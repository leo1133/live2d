import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF500AnimationTypeAPI } from "../../src/api/AF500API.js";
import { apiAf500Data } from "../../src/test-data/apiAf500Data.js";

test.describe("API AF500: GIFT Animation Type (演出種類)", () => {
  test("[AF500-API-01] (AUTH-001): POST /gift/ thiếu token -> 401", async ({ unauthenticatedRequest }) => {
    const api = new AF500AnimationTypeAPI(unauthenticatedRequest);
    const res = await api.createGift({ payload: { name: "Shutter1", animation_type: 2, price: 5000 } });
    expect([401, 403]).toContain(res.status());
  });

  for (const tc of apiAf500Data.createInvalidPriceCases) {
    test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
      const api = new AF500AnimationTypeAPI(authenticatedRequest);
      const res = await api.createGift({
        payload: { name: "AnimGift", animation_type: tc.animation_type, price: tc.price, sort_order: 1 },
      });
      expect(tc.expectedStatus).toContain(res.status());
    });
  }

  for (const tc of apiAf500Data.filterCases) {
    test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
      const api = new AF500AnimationTypeAPI(authenticatedRequest);
      const res = await api.getGiftList({ queryParams: tc.queryParams });
      expect(tc.expectedStatus).toContain(res.status());
    });
  }

  test.describe("Database Verification (API vs DB) - AF500", () => {
    let isDbAvailable = false;

    test.beforeAll(async () => {
      const { DBHelper } = await import("../../src/utils/db.helper.js");
      isDbAvailable = await DBHelper.isConnected();
    });

    test("TC_DB01: Đồng bộ Total Count theo từng animation_type (1, 2, 3) giữa API và bảng gifts", async ({ authenticatedRequest, db }) => {
      test.skip(!isDbAvailable, "⚠️ Bỏ qua DB tests: Database offline");
      const api = new AF500AnimationTypeAPI(authenticatedRequest);
      for (const animType of [1, 2, 3]) {
        const res = await api.getGiftList({ queryParams: { animation_type: animType, page: 1, items_per_page: 10 } });
        expect(res.status()).toBe(200);
        const body = await res.json();

        const dbCount = await db.query(
          "SELECT COUNT(*)::int AS cnt FROM gifts WHERE animation_type = $1 AND is_deleted = false AND deleted_at IS NULL",
          [animType]
        );
        expect(body.total_count).toBe(dbCount.rows[0].cnt);
      }
    });
  });
});
