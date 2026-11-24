import { HTTP_STATUS_CODE } from "./constants.js";

/**
 * Quản lý vòng đời dữ liệu CRUD khép kín (Create ➔ Read/View ➔ Update/Edit ➔ Delete ➔ Cleanup)
 * 
 * Mục đích:
 * 1. Tự động khởi tạo và quản lý tài nguyên tạm thời (Ephemeral Resource) cho toàn bộ test suite.
 * 2. Bảo vệ 100% dữ liệu gốc trong Database khỏi việc bị sửa đổi hoặc xóa ngoài ý muốn.
 * 3. Hỗ trợ đầy đủ các ca kiểm thử: Xem (GET), Sửa (PATCH/PUT), Xóa (DELETE), và Kiểm tra sau xóa (404/Idempotency).
 * 4. Tự động thu dọn (Auto-Cleanup) toàn bộ dữ liệu tạm thời trong `test.afterAll`, ngăn chặn rò rỉ dữ liệu mồ côi (Zero Orphan Records).
 * 5. Hỗ trợ `bindHandlers` linh hoạt để cập nhật context theo từng test case trong Playwright runner.
 */
export class CrudLifecycleManager {
  /**
   * @param {Object} options
   * @param {string} options.entityName - Tên đại diện của thực thể (vd: "Agency", "Streamer", "Quest")
   * @param {Function} [options.createFn] - Hàm gọi API tạo mới: `async (payload) => APIResponse | { id }`
   * @param {Function} [options.deleteFn] - Hàm gọi API xóa: `async (id) => APIResponse`
   * @param {Function} options.buildPayload - Hàm sinh payload hợp lệ: `(timestamp, randomSuffix) => Object`
   * @param {Function} [options.extractId] - Hàm trích xuất ID từ body response JSON (Mặc định: `data?.id || data?.data?.id`)
   */
  constructor({ entityName, createFn, deleteFn, buildPayload, extractId }) {
    if (!entityName || typeof buildPayload !== "function") {
      throw new Error(`[CrudLifecycleManager] Khởi tạo thiếu các thuộc tính bắt buộc (entityName, buildPayload).`);
    }

    this.entityName = entityName;
    this.createFn = createFn || null;
    this.deleteFn = deleteFn || null;
    this.buildPayload = buildPayload;
    this.extractId = extractId || ((data) => data?.id ?? data?.data?.id);

    // Bộ nhớ theo dõi trạng thái các ID tạm thời
    this.createdIds = new Set();
    this.deletedIds = new Set();
    this.activeId = null;
    this.lastDeletedId = null;
  }

  /**
   * Cập nhật hoặc bind handlers (createFn, deleteFn) mới theo từng test context
   * Giúp tránh lỗi 'context or browser has been closed' khi Playwright dispose request giữa các test
   * @param {Object} handlers
   * @param {Function} [handlers.createFn]
   * @param {Function} [handlers.deleteFn]
   */
  bindHandlers({ createFn, deleteFn } = {}) {
    if (createFn) this.createFn = createFn;
    if (deleteFn) this.deleteFn = deleteFn;
  }

  /**
   * Tạo mới một thực thể tạm thời (Ephemeral Entity) độc lập
   * @returns {Promise<number|string|null>} ID của thực thể vừa tạo thành công, hoặc null nếu lỗi
   */
  async createEphemeral() {
    if (!this.createFn) {
      console.warn(`⚠️ [${this.entityName}] createFn chưa được cấu hình hoặc chưa bind request context.`);
      return null;
    }

    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const payload = this.buildPayload(timestamp, randomSuffix);

    try {
      const response = await this.createFn(payload);

      // Nếu createFn trực tiếp trả về ID dạng number hoặc string
      if (typeof response === "number" || typeof response === "string") {
        this.createdIds.add(response);
        return response;
      }

      // Nếu createFn trả về object chứa { id }
      if (response?.id !== undefined && response?.id !== null) {
        this.createdIds.add(response.id);
        return response.id;
      }

      // Nếu createFn trả về APIResponse của Playwright
      if (typeof response?.status === "function") {
        const status = response.status();
        if (status === HTTP_STATUS_CODE.OK || status === 201) {
          const data = await response.json().catch(() => ({}));
          const id = this.extractId(data);
          if (id !== undefined && id !== null) {
            this.createdIds.add(id);
            return id;
          }
        } else {
          const errorText = await response.text().catch(() => "");
          console.warn(`⚠️ [${this.entityName}] Tạo entity thất bại (Status: ${status}):`, errorText.slice(0, 200));
        }
      }
    } catch (err) {
      console.warn(`⚠️ [${this.entityName}] Ngoại lệ khi tạo entity tạm:`, err.message);
    }
    return null;
  }

  /**
   * Lấy ID dùng chung cho toàn bộ chu trình CRUD (Khởi tạo lười ở ca đầu tiên nếu chưa có)
   * @returns {Promise<number|string|null>}
   */
  async getOrCreateSuiteEntity() {
    if (!this.activeId && !this.lastDeletedId) {
      this.activeId = await this.createEphemeral();
    }
    return this.activeId;
  }

  /**
   * Trả về ID mục tiêu phù hợp theo ngữ cảnh test case:
   * Ưu tiên: activeId (đang sống) ➔ lastDeletedId (đã xóa) ➔ fallbackId
   * @param {number|string} [fallbackId]
   * @returns {number|string|null}
   */
  getTargetId(fallbackId = null) {
    return this.activeId ?? this.lastDeletedId ?? fallbackId;
  }

  /**
   * Đánh dấu thực thể đã bị xóa (Dùng cho ca test xóa chính như DEL-001)
   * Chuyển activeId sang lastDeletedId để phục vụ các ca test kiểm tra sau xóa (DEL-002, DEL-003)
   * @param {number|string} id
   */
  markDeleted(id) {
    if (id !== undefined && id !== null) {
      this.deletedIds.add(id);
      this.lastDeletedId = id;
      if (this.activeId === id) {
        this.activeId = null;
      }
    }
  }

  /**
   * Đảm bảo có sẵn một entity đã xóa để kiểm thử tính chất Idempotent hoặc 404 (Dùng cho DEL-002, DEL-003 khi chạy lẻ)
   * @returns {Promise<number|string|null>}
   */
  async ensureDeletedEntity() {
    if (this.lastDeletedId) {
      return this.lastDeletedId;
    }

    // Nếu chưa có entity nào bị xóa (do chạy lẻ ca test), tự động tạo và xóa ngay một entity tạm
    const ephemeralId = await this.createEphemeral();
    if (ephemeralId) {
      try {
        if (this.deleteFn) {
          await this.deleteFn(ephemeralId);
        }
        this.markDeleted(ephemeralId);
      } catch (err) {
        console.warn(`⚠️ [${this.entityName}] Không thể xóa entity vừa tạo cho test case kiểm tra:`, err.message);
      }
      return ephemeralId;
    }
    return null;
  }

  /**
   * Dọn dẹp triệt để toàn bộ các thực thể tạm thời đã tạo nhưng chưa được xóa (Gọi trong test.afterAll)
   * @param {Function} [customDeleteFn] - Hàm xóa tùy chọn (ví dụ dùng request context mới trong afterAll)
   */
  async cleanupAll(customDeleteFn = null) {
    const deleteHandler = customDeleteFn || this.deleteFn;
    if (!deleteHandler) return;

    for (const id of this.createdIds) {
      if (!this.deletedIds.has(id)) {
        try {
          await deleteHandler(id);
          this.deletedIds.add(id);
        } catch (err) {
          // Bỏ qua lỗi trong quá trình thu dọn để không làm fail kết quả test chung
        }
      }
    }
  }
}
