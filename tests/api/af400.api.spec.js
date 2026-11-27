import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF400CategoryAPI } from "../../src/api/AF400API.js";
import { apiAf400Data } from "../../src/test-data/apiAf400Data.js";

test.describe("API AF400: Gift Category (/gift/category/ & /gift/category/sort-order/{id})", () => {
  test("[AF400-API-01] (AUTH-001): GET /gift/category/ thiếu token -> 401", async ({ unauthenticatedRequest }) => {
    const api = new AF400CategoryAPI(unauthenticatedRequest);
    const res = await api.getCategories();
    expect([401, 403]).toContain(res.status());
  });

  test("[AF400-API-04] (RESP-010): GET /gift/category/ thành công -> 200", async ({ authenticatedRequest }) => {
    const api = new AF400CategoryAPI(authenticatedRequest);
    const res = await api.getCategories();
    expect(res.status()).toBe(200);
  });

  for (const tc of apiAf400Data.createValidationCases) {
    test(`${tc.tcId} (${tc.vpId}): POST /gift/category/ - ${tc.title}`, async ({ authenticatedRequest }) => {
      const api = new AF400CategoryAPI(authenticatedRequest);
      const res = await api.createCategory({ payload: tc.payload });
      expect(tc.expectedStatus).toContain(res.status());
    });
  }

  for (const tc of apiAf400Data.updateInvalidCases) {
    test(`${tc.tcId} (${tc.vpId}): PATCH /gift/category/{id} - ${tc.title}`, async ({ authenticatedRequest }) => {
      const api = new AF400CategoryAPI(authenticatedRequest);
      const res = await api.updateCategory(tc.id, { payload: tc.payload });
      expect(tc.expectedStatus).toContain(res.status());
    });
  }

  for (const tc of apiAf400Data.sortOrderInvalidCases) {
    test(`${tc.tcId} (${tc.vpId}): PUT /gift/category/sort-order/{id} - ${tc.title}`, async ({ authenticatedRequest }) => {
      const api = new AF400CategoryAPI(authenticatedRequest);
      const res = await api.updateSortOrder(tc.id, { payload: tc.payload });
      expect(tc.expectedStatus).toContain(res.status());
    });
  }

  for (const tc of apiAf400Data.deleteInvalidCases) {
    test(`${tc.tcId} (${tc.vpId}): DELETE /gift/category/{id} - ${tc.title}`, async ({ authenticatedRequest }) => {
      const api = new AF400CategoryAPI(authenticatedRequest);
      const res = await api.deleteCategory(tc.id);
      expect(tc.expectedStatus).toContain(res.status());
    });
  }

  test("[AF400-API-28] (MTD-002): DELETE /gift/category/ collection -> 405/404/422", async ({ authenticatedRequest }) => {
    const api = new AF400CategoryAPI(authenticatedRequest);
    const res = await api.deleteCollection();
    expect([405, 404, 422]).toContain(res.status());
  });

  test.describe("Database Verification (API vs DB) - AF400", () => {
    let isDbAvailable = false;

    test.beforeAll(async () => {
      const { DBHelper } = await import("../../src/utils/db.helper.js");
      isDbAvailable = await DBHelper.isConnected();
    });

    test("TC_DB01: Đồng bộ Total Count, Field-by-Field và gift_count giữa GET /gift/category/ và DB", async ({ authenticatedRequest, db }) => {
      test.skip(!isDbAvailable, "⚠️ Bỏ qua DB tests: Database offline");
      const api = new AF400CategoryAPI(authenticatedRequest);
      const res = await api.getCategories();
      expect(res.status()).toBe(200);
      const body = await res.json();

      const countRes = await db.query(
        "SELECT COUNT(*)::int AS cnt FROM gift_categories WHERE is_deleted = false AND deleted_at IS NULL"
      );
      expect(body.total_count).toBe(countRes.rows[0].cnt);

      if (body.data.length > 0) {
        const apiItem = body.data[0];
        const dbRes = await db.query(
          `SELECT gc.id, gc.name, gc.sort_order,
                  (SELECT COUNT(*)::int FROM gifts g WHERE g.category_id = gc.id AND g.is_deleted = false AND g.deleted_at IS NULL) AS gift_count
           FROM gift_categories gc
           WHERE gc.id = $1 AND gc.is_deleted = false`,
          [apiItem.id]
        );
        expect(dbRes.rows.length).toBe(1);
        expect(apiItem.id).toBe(dbRes.rows[0].id);
        expect(apiItem.name).toBe(dbRes.rows[0].name);
        expect(apiItem.sort_order).toBe(dbRes.rows[0].sort_order);
        expect(apiItem.gift_count).toBe(dbRes.rows[0].gift_count);
      }
    });
  });
});
