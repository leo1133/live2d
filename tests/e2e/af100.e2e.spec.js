import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF100GiftListPage } from "../../src/pages/AF100Page.js";
import { AF100GiftListAPI } from "../../src/api/AF100API.js";
import { af100Data } from "../../src/test-data/af100Data.js";
import { ENDPOINTS } from "../../src/config/endpoint.js";

test.describe("E2E AF100: Triple-Layer Data Consistency (UI <-> API <-> DB)", () => {
  test("[AF100-E2E-01]: Đối chiếu danh sách quà giữa API Backend, Giao diện UI và Database", async ({
    page,
    authenticatedRequest,
    db,
  }) => {
    await page.route(/\.(png|jpeg|jpg|webp)$/, (route) => route.abort());
    const api = new AF100GiftListAPI(authenticatedRequest);
    const apiRes = await api.getGiftList({ queryParams: { page: 1, limit: 10 } });
    expect(apiRes.status()).toBe(200);
    const apiBody = await apiRes.json();
    const apiItems = apiBody.data || apiBody.items || [];

    const giftPage = new AF100GiftListPage(page);
    await giftPage.goto();
    await expect(giftPage.table).toBeVisible({ timeout: af100Data.timeouts.pageLoad });

    const expectedCount = Math.min(apiItems.length, af100Data.paginationConfig.defaultPageSize);
    await expect(giftPage.tableRows).toHaveCount(expectedCount);

    if (apiItems.length > 0 && process.env.DB_HOST) {
      const dbRes = await db.query("SELECT id, name, coin_price FROM gifts WHERE id = $1 AND deleted_at IS NULL", [
        apiItems[0].id,
      ]);
      if (dbRes.rows.length > 0) {
        expect(dbRes.rows[0].name).toBe(apiItems[0].name);
      }
    }
  });

  test("[AF100-E2E-02]: Tìm kiếm trên UI gửi đúng query param lên API", async ({ page }) => {
    const giftPage = new AF100GiftListPage(page);
    await giftPage.goto();
    await giftPage.fillSearchKeyword("Heart");

    const [req] = await Promise.all([
      page.waitForRequest((r) => r.url().includes(ENDPOINTS.GIFT.GET_LIST) && r.method() === "GET"),
      giftPage.clickSearch(),
    ]);
    expect(req.url()).toContain("Heart");
  });
});
