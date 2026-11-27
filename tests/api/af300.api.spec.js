import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF300GiftDetailAPI } from "../../src/api/AF300API.js";
import { apiAf300Data } from "../../src/test-data/apiAf300Data.js";
import { buildGiftPayload } from "../../src/test-data/apiAf200Data.js";

test.describe("API AF300: Gift Detail / Update / Delete (/gift/{gift_id}/)", () => {
  test.describe("1. GET /gift/{gift_id}/ — Auth, Path & Method", () => {
    test("[AF300-API-01] (AUTH-001): Thiếu Authorization -> 401", async ({ unauthenticatedRequest }) => {
      const api = new AF300GiftDetailAPI(unauthenticatedRequest);
      const res = await api.getGiftDetail(1);
      expect([401, 403]).toContain(res.status());
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

  test.describe("2. PATCH /gift/{gift_id}/ — Validation & Security", () => {
    for (const tc of apiAf300Data.patchInvalidCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF300GiftDetailAPI(authenticatedRequest);
        const res = await api.updateGift(1, { payload: tc.payload });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    test("[AF300-API-38] (UPD-003): PATCH gift_id=999999 không tồn tại -> 404/422", async ({ authenticatedRequest }) => {
      const api = new AF300GiftDetailAPI(authenticatedRequest);
      const res = await api.updateGift(999999, { payload: buildGiftPayload({ name: "NotFound" }) });
      expect([404, 422]).toContain(res.status());
    });
  });

  test.describe("3. DELETE /gift/{gift_id}/ — Validation & Collection Guard", () => {
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

  test.describe("4. Database Verification (API vs DB) - AF300", () => {
    let isDbAvailable = false;

    test.beforeAll(async () => {
      const { DBHelper } = await import("../../src/utils/db.helper.js");
      isDbAvailable = await DBHelper.isConnected();
    });

    test("TC_DB01: Đồng bộ chi tiết Gift giữa GET /gift/{id}/ và bảng gifts", async ({ authenticatedRequest, db }) => {
      test.skip(!isDbAvailable, "⚠️ Bỏ qua DB tests: Database offline");
      const pick = await db.query(
        "SELECT id, name, price, sort_order, status, animation_type, category_id FROM gifts WHERE is_deleted = false AND deleted_at IS NULL ORDER BY id DESC LIMIT 1"
      );
      if (pick.rows.length === 0) return;
      const dbItem = pick.rows[0];

      const api = new AF300GiftDetailAPI(authenticatedRequest);
      const res = await api.getGiftDetail(dbItem.id);
      expect(res.status()).toBe(200);
      const apiItem = await res.json();

      expect(apiItem.id).toBe(dbItem.id);
      expect(apiItem.name).toBe(dbItem.name);
      expect(apiItem.price).toBe(dbItem.price);
      expect(apiItem.sort_order).toBe(dbItem.sort_order);
      expect(apiItem.status).toBe(dbItem.status);
      expect(apiItem.animation_type).toBe(dbItem.animation_type);
      expect(apiItem.category_id).toBe(dbItem.category_id);
    });
  });
});
