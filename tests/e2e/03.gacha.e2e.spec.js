import { test, expect } from "../../src/fixtures/baseTest.js";
import { GachaPage } from "../../src/pages/GachaPage.js";
import { GachaAPI } from "../../src/api/GachaAPI.js";
import { gachaData } from "../../src/test-data/gachaData.js";
import { apiGachaData } from "../../src/test-data/apiGachaData.js";
import { METHODS, HTTP_STATUS_CODE } from "../../src/utils/constants.js";
import { ENDPOINTS, getUiSessionFile } from "../../src/config/endpoint.js";

test.describe.serial("E2E Gacha Management", () => {
  let sharedPage;
  let gachaPage;
  let gachaApi;

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
    // Chặn tải hình ảnh tĩnh nặng (3D previews, avatars) để giảm tải mạng
    await sharedPage.route(/\.(png|jpeg|jpg|webp)$/, (route) => route.abort());
    gachaPage = new GachaPage(sharedPage);
    await sharedPage.goto(gachaData.url, { waitUntil: "domcontentloaded" });
    await gachaPage.searchInput.waitFor({ state: "visible", timeout: 15000 });
  });

  test.beforeEach(async ({ authenticatedRequest }) => {
    test.setTimeout(60000);
    gachaApi = new GachaAPI(authenticatedRequest);
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  async function ensureGachaPage() {
    if (!sharedPage.url().includes(gachaData.url)) {
      await sharedPage.goto(gachaData.url, { waitUntil: "domcontentloaded" });
    } else {
      await gachaPage.clearFilters();
    }
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

    await expect(gachaPage.tableRows).toHaveCount(body.data.length);
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

    await expect(gachaPage.tableRows).toHaveCount(searchBody.data.length);

    if (searchBody.data.length > 0) {
      const firstRow = gachaPage.tableRows.first();
      await expect(firstRow).toContainText(keyword);
    }
  });

  test("TC04: Lọc Status đồng bộ (UI vs API)", async () => {
    await ensureGachaPage();

    await gachaPage.statusFilterDropdown.click();
    await sharedPage
      .getByText(gachaData.filterOptions.status[1], { exact: true })
      .last()
      .click();

    await executeWithApiResponse(() => gachaPage.searchButton.click());

    const publicBody = await fetchGachaApi({
      status: apiGachaData.filterParams.status.public,
    });

    await expect(gachaPage.tableRows).toHaveCount(publicBody.data.length);
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

    await expect(gachaPage.tableRows).toHaveCount(body.data.length);
  });
});
