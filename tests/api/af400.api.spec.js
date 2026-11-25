import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF400CategoryAPI } from "../../src/api/AF400API.js";
import { apiAf400Data, buildCategoryPayload } from "../../src/test-data/apiAf400Data.js";
import { createAuthTestCases } from "../../src/test-data/commonApiData.js";

test.describe("API AF400: Gift Categories CRUD (/api/v1/admin/gift-categories)", () => {
  test.describe("1. Auth, GET List & Collection Guard", () => {
    for (const tc of createAuthTestCases()) {
      test(`[AF400-API-AUTH] ${tc.tcId}: ${tc.title}`, async ({ unauthenticatedRequest }) => {
        const api = new AF400CategoryAPI(unauthenticatedRequest);
        const res = await api.getCategories({ headers: tc.headers });
        expect([401, 403]).toContain(res.status());
      });
    }

    test("[AF400-API-03][AF400-API-04]: GET danh sách danh mục 200 & DELETE collection 405", async ({
      authenticatedRequest,
    }) => {
      const api = new AF400CategoryAPI(authenticatedRequest);
      const listRes = await api.getCategories();
      expect(listRes.status()).toBe(200);

      const delColRes = await api.deleteCollection();
      expect([404, 405]).toContain(delColRes.status());
    });
  });

  test.describe("2. POST / PUT / DELETE Negative & Lifecycle", () => {
    for (const tc of apiAf400Data.createNegativeCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF400CategoryAPI(authenticatedRequest);
        const res = await api.createCategory({ payload: tc.payload });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    for (const tc of apiAf400Data.updateNegativeCases) {
      test(`${tc.tcId} (${tc.vpId}): PUT /gift-categories/${tc.id}`, async ({ authenticatedRequest }) => {
        const api = new AF400CategoryAPI(authenticatedRequest);
        const res = await api.updateCategory(tc.id, { payload: tc.payload });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    for (const tc of apiAf400Data.deleteNegativeCases) {
      test(`${tc.tcId} (${tc.vpId}): DELETE /gift-categories/${tc.id}`, async ({ authenticatedRequest }) => {
        const api = new AF400CategoryAPI(authenticatedRequest);
        const res = await api.deleteCategory(tc.id);
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    test("[AF400-API-09][AF400-API-19][AF400-API-25][AF400-API-26]: Full CRUD Lifecycle (Create -> Update -> Delete -> Delete 404)", async ({
      authenticatedRequest,
    }) => {
      const api = new AF400CategoryAPI(authenticatedRequest);
      const createRes = await api.createCategory({ payload: buildCategoryPayload() });
      expect([200, 201]).toContain(createRes.status());
      const created = await createRes.json();
      const catId = created.id || created.data?.id;

      if (catId) {
        const updRes = await api.updateCategory(catId, { payload: buildCategoryPayload() });
        expect(updRes.status()).toBe(200);

        const delRes = await api.deleteCategory(catId);
        expect([200, 204]).toContain(delRes.status());

        const delAgainRes = await api.deleteCategory(catId);
        expect(delAgainRes.status()).toBe(404);
      }
    });
  });
});
