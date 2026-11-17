import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD100Page, AD100AgencyListPage } from "../../src/pages/AD100Page.js";
import { AD100API, AD100AgencyAPI } from "../../src/api/AD100API.js";
import { ad100Data } from "../../src/test-data/ad100Data.js";
import { getUiSessionFile, ENDPOINTS } from "../../src/config/endpoint.js";

test.describe("E2E AD100: Triple-Layer Data Consistency (UI <-> API)", () => {
  let agencyPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(ad100Data.timeouts.suiteTimeout);
    // Chặn ảnh nặng tối ưu tốc độ
    await page.route(/\.(png|jpeg|jpg|webp)$/, (route) => route.abort());
    agencyPage = new AD100AgencyListPage(page);
  });

  // @tc: [AD100-E2E-01]
  test("TC_E2E_01: Đối chiếu tính nhất quán dữ liệu danh sách Agency giữa API Backend và Giao diện UI", async ({
    page,
    authenticatedRequest,
  }) => {
    // 1. Lấy dữ liệu danh sách từ Backend API
    const api = new AD100AgencyAPI(authenticatedRequest);
    const apiResponse = await api.getAgencyList({
      method: "POST",
      payload: { page: 1, items_per_page: 10 },
    });

    expect(apiResponse.status()).toBe(200);
    const apiData = await apiResponse.json();

    // 2. Mở màn hình danh sách AD100 trên UI
    await agencyPage.goto();
    await expect(agencyPage.table).toBeVisible({
      timeout: ad100Data.timeouts.pageLoad,
    });

    // 3. Đối chiếu số lượng bản ghi hiển thị (Smart waiting với auto-retry)
    const apiList = apiData.data || apiData.items || [];
    const expectedCount = Math.min(
      apiList.length,
      ad100Data.pagination.defaultItemsPerPage
    );
    await expect(agencyPage.tableRows).toHaveCount(expectedCount, {
      timeout: ad100Data.timeouts.pageLoad,
    });

    // 4. Đối chiếu chi tiết bản ghi đầu tiên nếu có dữ liệu
    if (expectedCount > 0 && apiList.length > 0) {
      const firstApiItem = apiList[0];
      const firstUiRow = await agencyPage.getRowData(0);

      // Mã Agency ID hoặc Tên Agency phải xuất hiện trên dòng UI
      if (firstApiItem.agency_code) {
        expect(firstUiRow.agencyCode).toContain(firstApiItem.agency_code);
      }
      if (firstApiItem.name) {
        expect(firstUiRow.name).toContain(firstApiItem.name);
      }
    }
  });

  // @tc: [AD100-E2E-02]
  test("TC_E2E_02: Tìm kiếm từ khóa trên UI kích hoạt đúng tham số payload lên API", async ({
    page,
  }) => {
    await agencyPage.goto();

    const searchKeyword = ad100Data.searchTestData.kanjiKeyword;
    await agencyPage.fillSearchKeyword(searchKeyword);

    // Bắt request mạng gửi lên từ UI khi bấm Search
    const [request] = await Promise.all([
      page.waitForRequest(
        (req) => req.url().includes(ENDPOINTS.AGENCY.GET_LIST) && req.method() === "POST"
      ),
      agencyPage.searchButton.click(),
    ]);

    // Kiểm tra payload gửi lên chứa đúng từ khóa tìm kiếm
    const postData = request.postDataJSON();
    if (postData) {
      expect(postData.q).toBe(searchKeyword);
    }
    await agencyPage.waitForLoadingDetached();
    await expect(agencyPage.table).toBeVisible();
  });
});
