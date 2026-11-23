import { test, expect, getOrFetchToken } from "../../src/fixtures/baseTest.js";
import { AQ201Page, AQ201GachaLimitedPage, GachaLimitedPage } from "../../src/pages/AQ201Page.js";
import { AQ201API, AQ201GachaLimitedAPI, GachaLimitedAPI } from "../../src/api/AQ201API.js";
import { aq201Data, gachaLimitedData } from "../../src/test-data/aq201Data.js";
import { apiAq201Data, apiGachaLimitedData } from "../../src/test-data/apiAq201Data.js";
import { HTTP_STATUS_CODE } from "../../src/utils/constants.js";
import { ENDPOINTS, getUiSessionFile, getApiBaseUrl } from "../../src/config/endpoint.js";

test.describe.serial("E2E Limited Gacha Management (期間限定アバターガチャ)", () => {
  let sharedPage;
  let gachaLimitedPage;
  let gachaLimitedApi;

  let modelId = apiGachaLimitedData.defaultModelId;
  let packageId = apiGachaLimitedData.defaultPackageId;
  let limitedGachaUrl = gachaLimitedData.urls.detailPage(modelId);

  test.beforeAll(async ({ browser, playwright }) => {
    test.setTimeout(gachaLimitedData.timeouts.suiteTimeout);

    try {
      const access_token = await getOrFetchToken(playwright);
      const rawContext = await playwright.request.newContext({
        baseURL: getApiBaseUrl(),
        extraHTTPHeaders: { Authorization: `Bearer ${access_token}` },
        httpCredentials: process.env.BASIC_AUTH_USER
          ? {
              username: process.env.BASIC_AUTH_USER,
              password: process.env.BASIC_AUTH_PASS,
            }
          : undefined,
      });
      const api = new GachaLimitedAPI(rawContext);
      const target = await api.discoverRandomTarget();
      modelId = target.modelId;
      packageId = target.packageId;
      await rawContext.dispose();
    } catch {
      // Giữ giá trị fallback mặc định nếu API discovery thất bại
    }

    limitedGachaUrl = gachaLimitedData.urls.detailPage(modelId);

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
    // Chặn ảnh nặng để tối ưu tốc độ load DOM
    await sharedPage.route(/\.(png|jpeg|jpg|webp)$/, (route) => route.abort());

    gachaLimitedPage = new GachaLimitedPage(sharedPage);
    await sharedPage.goto(limitedGachaUrl, { waitUntil: "domcontentloaded" });
    await gachaLimitedPage.pageHeading.waitFor({ state: "visible", timeout: gachaLimitedData.timeouts.pageLoad });
  });

  test.beforeEach(async ({ authenticatedRequest }) => {
    test.setTimeout(gachaLimitedData.timeouts.suiteTimeout);
    gachaLimitedApi = new GachaLimitedAPI(authenticatedRequest);
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  async function ensureLimitedGachaPage() {
    if (!sharedPage.url().includes(limitedGachaUrl)) {
      await sharedPage.goto(limitedGachaUrl, { waitUntil: "domcontentloaded" });
      await gachaLimitedPage.pageHeading.waitFor({ state: "visible", timeout: gachaLimitedData.timeouts.pageLoad });
    }
  }

  async function fetchPackageDetailApi() {
    const response = await gachaLimitedApi.getPackageDetail({
      modelId,
      queryParams: { type: apiGachaLimitedData.packageTypes.LIMITED },
    });
    expect(response.status()).toBe(HTTP_STATUS_CODE.OK);
    return await response.json();
  }

  async function fetchPackageItemsApi(extraParams = {}) {
    const response = await gachaLimitedApi.getPackageItems({
      packageId,
      queryParams: {
        page: apiGachaLimitedData.defaultParams.page,
        items_per_page: apiGachaLimitedData.defaultParams.items_per_page,
        ...extraParams,
      },
    });
    expect(response.status()).toBe(HTTP_STATUS_CODE.OK);
    return await response.json();
  }

  test("TC01: Đồng bộ Package Detail & Pity settings giữa UI và API", async () => {
    await ensureLimitedGachaPage();

    const apiData = await fetchPackageDetailApi();

    // 1. Tiêu đề khớp với tên Model từ API
    await expect(gachaLimitedPage.pageHeading).toContainText(apiData.model_name);

    // 2. Giá trị trong các ô Pity khớp chuẩn với API
    const getExpectedPity = (val) =>
      val !== null && val !== undefined && val !== "" ? String(val) : /^(100|0|)$/;

    await expect(gachaLimitedPage.hardPityInput).toHaveValue(getExpectedPity(apiData.hard_pity));
    await expect(gachaLimitedPage.softPityInput).toHaveValue(getExpectedPity(apiData.soft_pity));
    await expect(gachaLimitedPage.giftHardPityInput).toHaveValue(getExpectedPity(apiData.gift_hard_pity));
    await expect(gachaLimitedPage.giftSoftPityInput).toHaveValue(getExpectedPity(apiData.gift_soft_pity));
  });

  test("TC02: Đồng bộ Total Count & Items Table giữa UI và API", async () => {
    await ensureLimitedGachaPage();

    const itemsData = await fetchPackageItemsApi();

    // 1. Kiểm tra chuỗi tổng kết phân trang
    if (await gachaLimitedPage.paginationSummary.isVisible().catch(() => false)) {
      const summaryText = await gachaLimitedPage.paginationSummary.innerText().catch(() => "");
      if (summaryText && gachaLimitedData.pagination.summaryRegex.test(summaryText)) {
        expect(summaryText).toContain(String(itemsData.total_count));
      }
    }

    // 2. Số lượng dòng hiển thị trên Table khớp với mảng data của API
    const rowsCount = await gachaLimitedPage.tableRows.count();
    expect(rowsCount).toBe(itemsData.data.length);
  });

  test("TC03: Đồng bộ dữ liệu từng hàng trong Table Items (UI vs API)", async () => {
    await ensureLimitedGachaPage();

    const itemsData = await fetchPackageItemsApi();
    const rowsCount = await gachaLimitedPage.tableRows.count();
    expect(rowsCount).toBe(itemsData.data.length);

    for (let i = 0; i < itemsData.data.length; i++) {
      const item = itemsData.data[i];
      const row = gachaLimitedPage.tableRows.nth(i);

      await expect(row).toContainText(item.id.toString());
      await expect(row).toContainText(item.name);
    }
  });

  test("TC04: Cập nhật Pity trên UI và đồng bộ với API", async () => {
    await ensureLimitedGachaPage();

    // Lấy giá trị gốc để rollback sau test
    const originalDetail = await fetchPackageDetailApi();

    const testPity = gachaLimitedData.e2eTestPity;

    // Nhập giá trị mới trên UI
    await gachaLimitedPage.fillPitySettings(testPity);

    // Đảm bảo có banner nếu form yêu cầu
    if (!originalDetail.image) {
      const bannerPath = gachaLimitedData.assets.testBannerPath;
      await gachaLimitedPage.bannerFileInput.setInputFiles(bannerPath);
    }

    // Chờ request PATCH pity khi click Lưu (保存)
    const [patchResponse] = await Promise.all([
      sharedPage.waitForResponse(
        (resp) =>
          resp.url().includes(ENDPOINTS.GACHA_LIMITED.UPDATE_PITY(packageId)) &&
          resp.request().method() === "PATCH",
        { timeout: gachaLimitedData.timeouts.actionResponse },
      ),
      gachaLimitedPage.saveButton.click(),
    ]);

    expect(patchResponse.status()).toBe(HTTP_STATUS_CODE.OK);

    // Gọi API kiểm tra xem dữ liệu trên hệ thống đã thực sự thay đổi
    const updatedApiDetail = await fetchPackageDetailApi();
    expect(updatedApiDetail.hard_pity).toBe(testPity.hardPity);
    expect(updatedApiDetail.soft_pity).toBe(testPity.softPity);
    expect(updatedApiDetail.gift_hard_pity).toBe(testPity.giftHardPity);
    expect(updatedApiDetail.gift_soft_pity).toBe(testPity.giftSoftPity);

    // Rollback về giá trị ban đầu qua API để giữ sạch môi trường
    await gachaLimitedApi.updatePity({
      packageId,
      payload: {
        hard_pity: originalDetail.hard_pity,
        soft_pity: originalDetail.soft_pity,
        gift_hard_pity: originalDetail.gift_hard_pity,
        gift_soft_pity: originalDetail.gift_soft_pity,
      },
    });
  });

  test("TC05: Đồng bộ trạng thái Modal Đăng ký mới Item (新規登録)", async () => {
    await ensureLimitedGachaPage();

    await gachaLimitedPage.newItemButton.click();
    await expect(gachaLimitedPage.modalCancelButton).toBeVisible({ timeout: gachaLimitedData.timeouts.modal });
    await gachaLimitedPage.modalCancelButton.click();
    await expect(gachaLimitedPage.modalCancelButton).toBeHidden({ timeout: gachaLimitedData.timeouts.modal });
  });

  test("TC06: Mở Preview ảnh Item và kiểm tra hiển thị", async () => {
    await ensureLimitedGachaPage();

    const previewButtons = gachaLimitedPage.dataTable.getByRole("button", {
      name: gachaLimitedData.table.actionRegex.preview,
    });

    if ((await previewButtons.count()) > 0) {
      await previewButtons.first().click();
      await expect(gachaLimitedPage.closePreviewButton).toBeVisible({ timeout: gachaLimitedData.timeouts.modal });
      await gachaLimitedPage.closePreviewButton.click();
      await expect(gachaLimitedPage.closePreviewButton).toBeHidden({ timeout: gachaLimitedData.timeouts.modal });
    }
  });
});

