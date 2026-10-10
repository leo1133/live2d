import { test, expect } from "../../src/fixtures/baseTest.js";
import { LoginPage } from "../../src/pages/LoginPage.js";
import { GachaPage } from "../../src/pages/GachaPage.js";
import { GachaAPI } from "../../src/api/GachaAPI.js";
import { loginData } from "../../src/test-data/loginData.js";
import { gachaData } from "../../src/test-data/gachaData.js";
import { apiGachaData } from "../../src/test-data/apiGachaData.js";
import { METHODS, HTTP_STATUS_CODE } from "../../src/utils/constants.js";
import { ENDPOINTS } from "../../src/config/endpoint.js";
import path from "path";
import fs from "fs";

test.describe.serial("E2E Gacha Management", () => {
  let sharedPage;
  let gachaPage;
  let gachaApi;

  // =========================================================================
  // [CŨ - 65 DÒNG]: Đọc fs/path và try...catch login thủ công
  // =========================================================================
  /*
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60000);
    const authPath = path.resolve(process.cwd(), "tests/auth/ui_admin.json");
    const hasStorageState = fs.existsSync(authPath);

    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      storageState: hasStorageState ? authPath : undefined,
      httpCredentials: process.env.BASIC_AUTH_USER
        ? {
            username: process.env.BASIC_AUTH_USER,
            password: process.env.BASIC_AUTH_PASS,
          }
        : undefined,
    });
    sharedPage = await context.newPage();
    gachaPage = new GachaPage(sharedPage);

    const loginPage = new LoginPage(sharedPage);
    await loginPage.goto();
    await loginPage.login(
      loginData.credentials.account,
      loginData.credentials.password,
    );
    try {
      await loginPage.verifyLoginSuccess(new RegExp(gachaData.titles.dashboard));
    } catch (err) {
      console.warn("Retrying login after transient failure...");
    }

    await gachaPage.navigateToGachaList();
  });
  */

  // =========================================================================
  // [MỚI - TỐI ƯU GỌN GÀNG]: Tận dụng storageState cấu hình sẵn từ playwright.config.js
  // =========================================================================
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60000);
    sharedPage = await browser.newPage();
    gachaPage = new GachaPage(sharedPage);
    await gachaPage.navigateToGachaList();
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
  }

  async function fetchGachaApi(extraParams = {}) {
    const apiResponse = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: {
        page: apiGachaData.defaultParams.page,
        items_per_page: apiGachaData.defaultParams.items_per_page,
        ...extraParams,
      },
    });
    expect(apiResponse.status()).toBe(HTTP_STATUS_CODE.OK);
    return await apiResponse.json();
  }

  async function executeWithApiResponse(action) {
    const [_, actionResult] = await Promise.all([
      sharedPage.waitForResponse(
        (resp) =>
          resp.url().includes(ENDPOINTS.GACHA.GET_LIST) &&
          resp.status() === HTTP_STATUS_CODE.OK,
      ),
      action(),
    ]);
    return actionResult;
  }

  test("TC01: Đồng bộ Total Count & Table Rows (UI vs API)", async () => {
    await ensureGachaPage();

    const body = await fetchGachaApi();

    const summaryText = await gachaPage.paginationSummary
      .innerText()
      .catch(() => "");
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

    const body = await fetchGachaApi();

    const rowsCount = await gachaPage.tableRows.count();
    expect(rowsCount).toBe(body.data.length);

    for (let i = 0; i < body.data.length; i++) {
      const item = body.data[i];
      const row = gachaPage.tableRows.nth(i);

      await expect(row).toContainText(item.id.toString());
      await expect(row).toContainText(item.name);

      const expectedStatusText =
        item.status === apiGachaData.filterParams.status.public
          ? gachaData.filterOptions.status[1]
          : gachaData.filterOptions.status[2];
      await expect(row).toContainText(expectedStatusText);
    }
  });

  test("TC03: Tìm kiếm Keyword đồng bộ (UI vs API)", async () => {
    await ensureGachaPage();

    const listBody = await fetchGachaApi();
    const keyword =
      listBody.data.length > 0
        ? listBody.data[0].name
        : apiGachaData.filterParams.keyword.valid;

    await executeWithApiResponse(() => gachaPage.searchModel(keyword));

    const searchBody = await fetchGachaApi({ keyword });

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
    await sharedPage
      .getByText(gachaData.filterOptions.status[1], { exact: true })
      .last()
      .click();

    await executeWithApiResponse(() => gachaPage.searchButton.click());

    const publicBody = await fetchGachaApi({
      status: apiGachaData.filterParams.status.public,
    });

    const publicRowsCount = await gachaPage.tableRows.count();
    expect(publicRowsCount).toBe(publicBody.data.length);
  });

  test("TC05: Tìm kiếm No Data đồng bộ (UI vs API)", async () => {
    await ensureGachaPage();

    const invalidKeyword = apiGachaData.filterParams.keyword.invalid;

    await executeWithApiResponse(() => gachaPage.searchModel(invalidKeyword));

    const body = await fetchGachaApi({ keyword: invalidKeyword });

    expect(body.data).toHaveLength(0);
    expect(body.total_count).toBe(0);

    await expect(
      sharedPage.getByText(gachaData.labels.noDataMessage),
    ).toBeVisible();
  });

  test("TC06: Clear Filter khôi phục dữ liệu đồng bộ (UI vs API)", async () => {
    await ensureGachaPage();

    await gachaPage.searchInput.fill(apiGachaData.filterParams.keyword.invalid);
    await executeWithApiResponse(() => gachaPage.searchButton.click());
    await executeWithApiResponse(() => gachaPage.clearFilters());

    const body = await fetchGachaApi();

    const rowsCount = await gachaPage.tableRows.count();
    expect(rowsCount).toBe(body.data.length);
  });
});
