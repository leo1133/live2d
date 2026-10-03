import { test, expect } from "../../src/fixtures/baseTest.js";
import { LoginPage } from "../../src/pages/LoginPage.js";
import { GachaPage } from "../../src/pages/GachaPage.js";
import { GachaAPI } from "../../src/api/GachaAPI.js";
import { loginData } from "../../src/test-data/loginData.js";
import { gachaData } from "../../src/test-data/gachaData.js";
import { apiGachaData } from "../../src/test-data/apiGachaData.js";
import { METHODS } from "../../src/utils/constants.js";

test.describe.serial("E2E Gacha Management", () => {
  let sharedPage;
  let gachaPage;
  let gachaApi;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60000);

    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      httpCredentials: process.env.BASIC_AUTH_USER
        ? {
            username: process.env.BASIC_AUTH_USER,
            password: process.env.BASIC_AUTH_PASS,
          }
        : undefined,
    });
    sharedPage = await context.newPage();
    const loginPage = new LoginPage(sharedPage);
    gachaPage = new GachaPage(sharedPage);

    await loginPage.goto();
    await loginPage.login(
      loginData.credentials.account,
      loginData.credentials.password,
    );
    try {
      await loginPage.verifyLoginSuccess(new RegExp(gachaData.titles.dashboard));
    } catch (e) {
      await loginPage.goto();
      await loginPage.login(
        loginData.credentials.account,
        loginData.credentials.password,
      );
      await loginPage.verifyLoginSuccess(new RegExp(gachaData.titles.dashboard));
    }

    await gachaPage.navigateToGachaList();
    await sharedPage.waitForTimeout(1000);
  });

  test.beforeEach(async ({ authenticatedRequest }) => {
    gachaApi = new GachaAPI(authenticatedRequest);
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  async function ensureGachaPage() {
    await sharedPage.goto(gachaData.url);
    await gachaPage.searchInput.waitFor({ state: "visible", timeout: 15000 });
    await sharedPage.waitForTimeout(500);
  }

  test("TC01: Đồng bộ Total Count & Table Rows (UI vs API)", async () => {
    await ensureGachaPage();

    const apiResponse = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: {
        page: 1,
        items_per_page: 10,
      },
    });
    expect(apiResponse.status()).toBe(200);
    const body = await apiResponse.json();

    const summaryText = await gachaPage.paginationSummary.innerText().catch(() => "");
    if (summaryText && gachaData.pagination.summaryRegex.test(summaryText)) {
      const match = summaryText.match(gachaData.pagination.summaryRegex);
      const uiTotalCount = parseInt(match[1].replace(/,/g, ""), 10);
      expect(uiTotalCount).toBe(body.total_count);
    }

    const rowsCount = await gachaPage.tableRows.count();
    expect(rowsCount).toBe(body.data.length);
  });

  test("TC02: Đồng bộ dữ liệu từng hàng trong Table (UI vs API)", async () => {
    await ensureGachaPage();

    const apiResponse = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: {
        page: 1,
        items_per_page: 10,
      },
    });
    expect(apiResponse.status()).toBe(200);
    const body = await apiResponse.json();

    if (body.data.length > 0) {
      const firstItem = body.data[0];
      const firstRow = gachaPage.tableRows.first();

      await expect(firstRow).toContainText(firstItem.id.toString());
      await expect(firstRow).toContainText(firstItem.name);

      const expectedStatusText = firstItem.status === 1 ? "公開" : "非公開";
      await expect(firstRow).toContainText(expectedStatusText);
    }
  });

  test("TC03: Tìm kiếm Keyword đồng bộ (UI vs API)", async () => {
    await ensureGachaPage();

    const listResponse = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: { page: 1, items_per_page: 10 },
    });
    const listBody = await listResponse.json();
    const keyword = listBody.data.length > 0 ? listBody.data[0].name : apiGachaData.filterParams.keyword.valid;

    await gachaPage.searchModel(keyword);

    const apiSearchResponse = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: {
        page: 1,
        items_per_page: 10,
        keyword: keyword,
      },
    });
    expect(apiSearchResponse.status()).toBe(200);
    const searchBody = await apiSearchResponse.json();

    const uiRowsCount = await gachaPage.tableRows.count();
    expect(uiRowsCount).toBe(searchBody.data.length);

    if (searchBody.data.length > 0) {
      const firstRow = gachaPage.tableRows.first();
      await expect(firstRow).toContainText(keyword);
    }
  });

  test("TC04: Lọc Status đồng bộ (UI vs API)", async () => {
    await ensureGachaPage();

    const statusDropdown = sharedPage.getByRole("combobox").first();
    await statusDropdown.click();
    await sharedPage.waitForTimeout(300);
    await sharedPage.getByText(gachaData.filterOptions.status[1], { exact: true }).last().click();
    await gachaPage.searchButton.click();
    await sharedPage.waitForTimeout(500);

    const apiPublicResponse = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: {
        page: 1,
        items_per_page: 10,
        status: apiGachaData.filterParams.status.public,
      },
    });
    expect(apiPublicResponse.status()).toBe(200);
    const publicBody = await apiPublicResponse.json();

    const publicRowsCount = await gachaPage.tableRows.count();
    expect(publicRowsCount).toBe(publicBody.data.length);
  });

  test("TC05: Tìm kiếm No Data đồng bộ (UI vs API)", async () => {
    await ensureGachaPage();

    const invalidKeyword = apiGachaData.filterParams.keyword.invalid;
    await gachaPage.searchModel(invalidKeyword);

    const apiResponse = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: {
        page: 1,
        items_per_page: 10,
        keyword: invalidKeyword,
      },
    });
    expect(apiResponse.status()).toBe(200);
    const body = await apiResponse.json();

    expect(body.data).toHaveLength(0);
    expect(body.total_count).toBe(0);

    await expect(sharedPage.getByText(gachaData.labels.noDataMessage)).toBeVisible();
  });

  test("TC06: Clear Filter khôi phục dữ liệu đồng bộ (UI vs API)", async () => {
    await ensureGachaPage();

    await gachaPage.searchInput.fill(apiGachaData.filterParams.keyword.invalid);
    await gachaPage.searchButton.click();
    await sharedPage.waitForTimeout(500);

    await gachaPage.clearFilters();

    const apiResponse = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: {
        page: 1,
        items_per_page: 10,
      },
    });
    expect(apiResponse.status()).toBe(200);
    const body = await apiResponse.json();

    const rowsCount = await gachaPage.tableRows.count();
    expect(rowsCount).toBe(body.data.length);
  });
});
