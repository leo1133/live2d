import { test, expect } from "../../src/fixtures/baseTest.js";
import { loginData } from "../../src/test-data/loginData.js";
import { LoginPage } from "../../src/pages/LoginPage.js";
import { UserPage } from "../../src/pages/UserPage.js";
import { userData } from "../../src/test-data/userData.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

test.describe("E2E User List Suite: Kết hợp UI + API", () => {
  let sharedPage;
  let userPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60000);
    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      storageState: getUiSessionFile(),
      httpCredentials: process.env.BASIC_AUTH_USER
        ? {
            username: process.env.BASIC_AUTH_USER,
            password: process.env.BASIC_AUTH_PASS,
          }
        : undefined,
    });
    sharedPage = await context.newPage();
    userPage = new UserPage(sharedPage);
    await sharedPage.goto(userData.url, { waitUntil: "domcontentloaded" });
    await userPage.searchInput.waitFor({ state: "visible", timeout: 15000 });
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  test("TC_E2E_01: Kiểm tra tính đồng bộ tổng số lượng bản ghi (Total Count) giữa UI và API", async ({
    authenticatedRequest,
  }) => {
    const summaryText = await userPage.paginationSummary.innerText();
    const match = summaryText.match(userData.pagination.summaryRegex);
    expect(match).not.toBeNull();
    const uiTotalCount = parseInt(match[1].replace(/,/g, ""), 10);

    const apiResponse = await authenticatedRequest.get("/api/v1/user/", {
      params: {
        page: 1,
        items_per_page: 10,
      },
    });

    expect(apiResponse.status()).toBe(200);

    const body = await apiResponse.json();
    const apiTotalCount = body.total_count;

    expect(uiTotalCount).toBe(apiTotalCount);

    if (apiTotalCount > 0) {
      const rowsCount = await userPage.tableRows.count();
      expect(rowsCount).toBe(body.data.length);
    }
  });
});
