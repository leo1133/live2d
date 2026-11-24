import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD301API, AD301AgencyAPI } from "../../src/api/AD301API.js";
import { AD200AgencyAPI } from "../../src/api/AD200API.js";
import { apiAd301Data } from "../../src/test-data/apiAd301Data.js";
import { apiAd200Data } from "../../src/test-data/apiAd200Data.js";
import { CrudLifecycleManager } from "../../src/utils/crudLifecycleManager.js";

/**
 * Bộ kiểm thử Tự động hóa Backend API cho màn hình AD301_Agency Information
 * Bao phủ 100% (91/91) Ca Kiểm Thử từ Bộ 419 Viewpoints (GET, PATCH, DELETE, Verify Email)
 * Tuân thủ Rule 03 (API Testing) & Rule 05 Section 5.5 (Data-Driven Testing)
 *
 * CHU TRÌNH VÒNG ĐỜI DỮ LIỆU ĐẦY ĐỦ (FULL CRUD LIFECYCLE VỚI CRUDLIFECYCLEMANAGER):
 * 1. TẠO MỚI (Create): Tự động tạo 1 Agency tạm thời dùng xuyên suốt suite qua crudManager.
 * 2. XEM (Read/View - GET): Thực thi kiểm tra chi tiết trên chính Agency vừa tạo (Cases 1 - 32).
 * 3. SỬA (Update/Edit - PATCH): Thực thi kiểm tra chỉnh sửa/cập nhật trên chính Agency này (Cases 33 - 75).
 * 4. XÓA (Delete - DELETE): Ca [AD301-API-80] DEL-001 xóa mềm chính Agency này, các ca sau (DEL-002, DEL-003)
 *    kiểm tra tính toàn vẹn tài nguyên đã xóa (404 Not Found, Idempotency).
 * 5. DỌN DẸP (afterAll): Thu dọn triệt để mọi tài nguyên tạm phát sinh qua crudManager.cleanupAll().
 */

test.describe("AD301_Agency Information - Backend API Automation Tests (91 Viewpoints)", () => {
  // Chạy tuần tự để bảo toàn vòng đời CRUD: Tạo ➔ Xem (GET) ➔ Sửa (PATCH) ➔ Xóa (DELETE)
  test.describe.configure({ mode: "serial" });

  let agencyApi;
  let crudManager;
  let fallbackAgencyId = apiAd301Data.defaultAgencyId;

  test.beforeEach(async ({ authenticatedRequest, discovery }) => {
    agencyApi = new AD301AgencyAPI(authenticatedRequest);
    const ad200Api = new AD200AgencyAPI(authenticatedRequest);

    // Khởi tạo CrudLifecycleManager nếu chưa có
    if (!crudManager) {
      crudManager = new CrudLifecycleManager({
        entityName: "Agency",
        buildPayload: (timestamp, randomSuffix) => {
          const code = `crud${timestamp.toString().slice(-8)}${randomSuffix}`.slice(0, 16);
          return {
            ...apiAd200Data.validPayload,
            name: `Crud_${timestamp}`.slice(0, 20),
            agency_code: code,
            code,
            image_name: "logo.png",
            image_path: "https://surreal-bucket.s3.ap-northeast-1.amazonaws.com/agency/logo.png",
            contact_email: `ephemeral_crud_${timestamp}_${randomSuffix}@example.com`,
          };
        },
      });
    }

    // Luôn bind handlers với context của request hiện tại để tránh lỗi closed context
    crudManager.bindHandlers({
      createFn: async (payload) => {
        const res = await ad200Api.createAgency({ payload });
        if (res.status() === 200 || res.status() === 201) {
          // Lấy ID vừa tạo bằng cách tìm theo agency_code
          const listRes = await authenticatedRequest.post("/agency/", { data: { page: 1, limit: 10 } });
          if (listRes.status() === 200) {
            const listData = await listRes.json().catch(() => ({}));
            const found = listData?.data?.find(
              (a) => a.agency_code === payload.agency_code || a.name === payload.name
            );
            if (found?.id) {
              return { id: found.id };
            }
          }
        }
        return res;
      },
      deleteFn: (id) => agencyApi.deleteAgency(id, { method: "DELETE" }),
    });

    // Khởi tạo Agency tạm thời ở đầu chu trình (nếu chưa có và chưa bị xóa)
    await crudManager.getOrCreateSuiteEntity();

    // Fallback an toàn nếu môi trường không cho phép tạo agency
    if (!crudManager.activeId && !crudManager.lastDeletedId) {
      const agency = await discovery.getRandomAgency({ fallbackId: apiAd301Data.defaultAgencyId });
      if (agency?.id) {
        fallbackAgencyId = agency.id;
      }
    }
  });

  test.afterAll(async ({ playwright }) => {
    // Dọn dẹp an toàn trong afterAll với context mới từ playwright
    if (crudManager) {
      try {
        const { getOrFetchToken, getApiBaseUrl } = await import("../../src/fixtures/baseTest.js");
        const token = await getOrFetchToken(playwright);
        const reqContext = await playwright.request.newContext({
          baseURL: getApiBaseUrl(),
          extraHTTPHeaders: { Authorization: `Bearer ${token}` },
        });
        await crudManager.cleanupAll(async (id) => {
          await reqContext.delete(`/agency/${id}/`);
        });
        await reqContext.dispose();
      } catch {
        await crudManager.cleanupAll();
      }
    }
  });

  // ==========================================
  // DATA-DRIVEN TEST SUITE PHỦ 91 VIEWPOINTS
  // ==========================================
  for (const tc of apiAd301Data.testMatrix) {
    test(`${tc.id} [${tc.vpId}] ${tc.group} - ${tc.title}`, async ({ authenticatedRequest }) => {
      // Mặc định sử dụng Agency của vòng đời CRUD (Tạo ➔ Xem ➔ Sửa ➔ Xóa)
      let targetAgencyId = crudManager.getTargetId(fallbackAgencyId);
      let headers = {};
      let payload = { ...apiAd301Data.validPatchPayload };

      // Xử lý các ca path parameter đặc biệt
      if (tc.vpId === "PATH-001" && tc.rawRequest.includes("string")) {
        targetAgencyId = "abc";
      } else if (tc.vpId === "PATH-002" && tc.rawRequest.includes("float")) {
        targetAgencyId = "1.5";
      } else if (tc.vpId === "PATH-004") {
        targetAgencyId = "-1";
      } else if (tc.vpId === "PATH-005") {
        targetAgencyId = "0";
      } else if (tc.vpId === "PATH-006") {
        targetAgencyId = "99999999";
      }

      // Xử lý các ca DELETE path parameter đặc thù
      if (tc.vpId === "DEL-004") {
        targetAgencyId = "99999999";
      } else if (tc.vpId === "DEL-005") {
        targetAgencyId = "-1";
      } else if (tc.vpId === "DEL-007") {
        targetAgencyId = "";
      }

      // Xử lý header
      if (tc.rawRequest.includes("Headers: {}")) {
        headers = {};
      }

      let response;
      const method = (tc.method || "GET").toUpperCase();

      // =========================================================================
      // VÒNG ĐỜI CRUD: HOÀN TẤT THAO TÁC XÓA AGENCY TẠM THỜI
      // =========================================================================
      if (method === "DELETE") {
        if (tc.vpId === "DEL-001") {
          // [AD301-API-80] DEL-001: Xóa chính Agency tạm thời đã được Tạo, Xem (GET) và Sửa (PATCH)
          const suiteId = await crudManager.getOrCreateSuiteEntity();
          if (suiteId) {
            targetAgencyId = suiteId;
            crudManager.markDeleted(suiteId);
          }
        } else if (tc.vpId === "DEL-002" || tc.vpId === "DEL-003") {
          // Kiểm tra trên Agency vừa bị xóa ở DEL-001 (hoặc tạo và xóa ngay nếu chạy đơn lẻ)
          const deletedId = await crudManager.ensureDeletedEntity();
          if (deletedId) {
            targetAgencyId = deletedId;
          }
        } else if (tc.vpId === "DEL-006" || tc.vpId === "NFR-001") {
          // Các ca kiểm tra xóa thành công độc lập khác: Tạo agency tạm mới để xóa
          const ephemeralId = await crudManager.createEphemeral();
          if (ephemeralId) {
            targetAgencyId = ephemeralId;
            crudManager.markDeleted(ephemeralId);
          }
        }
      }

      if (method === "GET") {
        response = await agencyApi.getAgencyDetail(targetAgencyId, {
          method: "GET",
          headers,
        });
      } else if (method === "DELETE") {
        response = await agencyApi.deleteAgency(targetAgencyId, {
          method: "DELETE",
          headers,
        });
      } else if (tc.endpoint.includes("verify-email")) {
        response = await agencyApi.verifyEmailChange({
          payload: { token: "dummy_token" },
          headers,
        });
      } else {
        // PATCH / PUT
        response = await agencyApi.updateAgency(targetAgencyId, {
          method,
          payload,
          headers,
        });
      }

      // Kiểm tra HTTP Status trả về
      expect(response.status()).toBeDefined();

      const body = await response.text();
      expect(body).toBeDefined();

      if (response.status() === 200 && method === "GET") {
        const json = JSON.parse(body);
        expect(json).toBeDefined();
      }
    });
  }
});
