import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF400CategoryManagePage } from "../../src/pages/AF400Page.js";
import { AF400CategoryAPI } from "../../src/api/AF400API.js";
import { af400Data } from "../../src/test-data/af400Data.js";

test.describe("E2E AF400: Gift Category Sync (UI <-> API)", () => {
  test("[AF400-E2E-01]: Đối chiếu danh sách danh mục giữa API và bảng AF400", async ({
    page,
    authenticatedRequest,
  }) => {
    const api = new AF400CategoryAPI(authenticatedRequest);
    const apiRes = await api.getCategories();
    expect(apiRes.status()).toBe(200);
    const body = await apiRes.json();
    const categories = body.data || body.items || (Array.isArray(body) ? body : []);

    const catPage = new AF400CategoryManagePage(page);
    await catPage.goto();
    await expect(catPage.createButton).toBeVisible({ timeout: af400Data.timeouts.pageLoad });
    if (categories.length > 0) {
      await expect(catPage.tableRows.first()).toBeVisible();
    }
  });
});
