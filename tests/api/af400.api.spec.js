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
});
