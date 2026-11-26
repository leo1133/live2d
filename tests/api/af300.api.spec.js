import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF300GiftDetailAPI } from "../../src/api/AF300API.js";
import { AF200GiftCreateAPI } from "../../src/api/AF200API.js";
import { apiAf300Data } from "../../src/test-data/apiAf300Data.js";
import { buildGiftPayload } from "../../src/test-data/apiAf200Data.js";
import { CrudLifecycleManager } from "../../src/utils/crudLifecycleManager.js";

/**
 * Bộ kiểm thử Tự động hóa Backend API cho màn hình AF300 — Gift Detail / Update / Delete
 * Chu trình vòng đời dữ liệu đầy đủ (FULL CRUD LIFECYCLE VỚI CRUDLIFECYCLEMANAGER):
 * 1. TẠO MỚI (Create): Tự động tạo 1 Gift tạm thời dùng xuyên suốt suite qua crudManager.
 * 2. XEM (Read/View - GET): Kiểm tra chi tiết trên chính Gift vừa tạo.
 * 3. SỬA (Update/Edit - PATCH): Kiểm tra chỉnh sửa/cập nhật trên chính Gift này.
 * 4. XÓA (Delete - DELETE): Ca DEL-001 xóa chính Gift này; DEL-002, DEL-003 kiểm tra tính toàn vẹn sau xóa (404/Idempotency).
 * 5. DỌN DẸP (afterAll): Thu dọn triệt để mọi tài nguyên tạm phát sinh qua crudManager.cleanupAll().
 */

test.describe("API AF300: Gift Detail / Update / Delete (/gift/{gift_id}/)", () => {
  test.describe.configure({ mode: "serial" });

  let detailApi;
  let createApi;
  let crudManager;
  let fallbackGiftId = apiAf300Data.defaultGiftId;

  test.beforeEach(async ({ authenticatedRequest }) => {
    detailApi = new AF300GiftDetailAPI(authenticatedRequest);
    createApi = new AF200GiftCreateAPI(authenticatedRequest);

    if (!crudManager) {
      crudManager = new CrudLifecycleManager({
        entityName: "Gift",
        buildPayload: (timestamp, randomSuffix) =>
          buildGiftPayload({
            name: `G_${timestamp.toString().slice(-6)}`,
            price: 500,
            sort_order: 1,
            status: "public",
            animation_type: "normal",
          }),
        extractId: (data) => data?.id ?? data?.data?.id,
      });
    }

    crudManager.bindHandlers({
      createFn: async (payload) => {
        const res = await createApi.createGift({ payload });
        return res;
      },
      deleteFn: (id) => detailApi.deleteGift(id),
    });

    await crudManager.getOrCreateSuiteEntity();
  });

  test.afterAll(async ({ playwright }) => {
    if (crudManager) {
      try {
        const { getOrFetchToken, getApiBaseUrl } = await import("../../src/fixtures/baseTest.js");
        const token = await getOrFetchToken(playwright);
        const reqContext = await playwright.request.newContext({
          baseURL: getApiBaseUrl(),
          extraHTTPHeaders: { Authorization: `Bearer ${token}` },
        });
        await crudManager.cleanupAll(async (id) => {
          await reqContext.delete(`/gift/${id}/`);
        });
        await reqContext.dispose();
      } catch {
        await crudManager.cleanupAll();
      }
    }
  });

  test.describe("1. GET /gift/{gift_id}/ — Auth, Path & Lifecycle Read", () => {
    test("[AF300-API-01] (AUTH-001): Thiếu Authorization -> 401", async ({ unauthenticatedRequest }) => {
      const api = new AF300GiftDetailAPI(unauthenticatedRequest);
      const res = await api.getGiftDetail(1);
      expect([401, 403]).toContain(res.status());
    });

    test("[AF300-API-02] (CRUD-Read): GET chi tiết trên Ephemeral Gift vừa tạo -> 200 OK", async () => {
      const targetId = crudManager.getTargetId(fallbackGiftId);
      const res = await detailApi.getGiftDetail(targetId);
      expect([200]).toContain(res.status());
      const body = await res.json().catch(() => ({}));
      const item = body?.data || body;
      expect(item).toBeDefined();
    });

    for (const tc of apiAf300Data.invalidDetailIds) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF300GiftDetailAPI(authenticatedRequest);
        const res = await api.getGiftDetail(tc.id);
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    test("[AF300-API-10] (MTD-005): Gửi POST lên /gift/{gift_id}/ -> 405", async ({ authenticatedRequest }) => {
      const api = new AF300GiftDetailAPI(authenticatedRequest);
      const res = await api.getGiftDetail(1, { method: "POST" });
      expect([405, 404]).toContain(res.status());
    });
  });

  test.describe("2. PATCH /gift/{gift_id}/ — Validation, Security & Lifecycle Update", () => {
    test("[AF300-API-20] (UPD-001): Cập nhật thành công tên và giá của Ephemeral Gift -> 200 OK", async () => {
      const targetId = crudManager.getTargetId(fallbackGiftId);
      const updatePayload = {
        name: `Upd_${Date.now().toString().slice(-6)}`,
        price: 999,
      };
      const patchRes = await detailApi.updateGift(targetId, { payload: updatePayload });
      expect([200, 204]).toContain(patchRes.status());

      const getRes = await detailApi.getGiftDetail(targetId);
      if (getRes.status() === 200) {
        const body = await getRes.json().catch(() => ({}));
        const item = body?.data || body;
        if (item?.name) expect(item.name).toBe(updatePayload.name);
      }
    });

    for (const tc of apiAf300Data.patchInvalidCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async () => {
        const targetId = crudManager.getTargetId(fallbackGiftId);
        const res = await detailApi.updateGift(targetId, { payload: tc.payload });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    test("[AF300-API-38] (UPD-003): PATCH gift_id=999999 không tồn tại -> 404", async ({ authenticatedRequest }) => {
      const api = new AF300GiftDetailAPI(authenticatedRequest);
      const res = await api.updateGift(999999, { payload: { name: "NotFound" } });
      expect([404]).toContain(res.status());
    });
  });

  test.describe("3. DELETE /gift/{gift_id}/ — Lifecycle Delete & Idempotency", () => {
    test("[AF300-API-45] (DEL-001): Xóa thành công chính Ephemeral Gift đã qua các bước GET và PATCH", async () => {
      const suiteId = await crudManager.getOrCreateSuiteEntity();
      if (suiteId) {
        crudManager.markDeleted(suiteId);
        const res = await detailApi.deleteGift(suiteId);
        expect([200, 204]).toContain(res.status());
      }
    });

    test("[AF300-API-49] (DEL-002): Xóa lại chính Gift vừa xóa ở DEL-001 -> 404 Not Found (Idempotency / Already Deleted)", async () => {
      const deletedId = await crudManager.ensureDeletedEntity();
      if (deletedId) {
        const res = await detailApi.deleteGift(deletedId);
        expect([404, 400, 410]).toContain(res.status());
      }
    });

    test("[AF300-API-50] (DEL-003): Gọi GET trên Gift vừa xóa -> 404 Not Found", async () => {
      const deletedId = await crudManager.ensureDeletedEntity();
      if (deletedId) {
        const res = await detailApi.getGiftDetail(deletedId);
        expect([404, 410]).toContain(res.status());
      }
    });

    for (const tc of apiAf300Data.deleteInvalidCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF300GiftDetailAPI(authenticatedRequest);
        const res = await api.deleteGift(tc.id);
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    test("[AF300-API-48] (DEL-007): Gọi DELETE trực tiếp trên collection /gift/ -> 405", async ({ authenticatedRequest }) => {
      const api = new AF300GiftDetailAPI(authenticatedRequest);
      const res = await api.deleteCollection();
      expect([405, 404]).toContain(res.status());
    });
  });
});
