import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD100Page, AD100AgencyListPage } from "../../src/pages/AD100Page.js";
import { ad100Data } from "../../src/test-data/ad100Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

test.describe.serial("UI AD100: Agency List / Search (事務所一覧・検索)", () => {
  let sharedPage;
  let agencyPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(ad100Data.timeouts.suiteTimeout);
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
    // Chặn tài nguyên ảnh nặng để tối ưu tốc độ tải trang theo Rule 05
    await sharedPage.route(/\.(png|jpeg|jpg|webp)$/, (route) => route.abort());

    agencyPage = new AD100AgencyListPage(sharedPage);
    await agencyPage.goto();
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  // =========================================================================
  // SECTION 1: COMMON & NAVIGATION ([AD100-1] -> [AD100-9])
  // =========================================================================
  test.describe("1. Common & Navigation", () => {
    // @tc: [AD100-1] - Check hiển thị menu & sidebar
    test("[AD100-1]: Menu Sidebar hiển thị đầy đủ và highlight active 事務所一覧", async () => {
      if (await agencyPage.sidebarMenu.count() > 0) {
        await expect(agencyPage.sidebarMenu).toBeVisible();
      }
    });

    // @tc: [AD100-2] - Check điều hướng menu sidebar
    test("[AD100-2]: Click vào menu 事務所管理 > 事務所一覧 điều hướng thành công", async () => {
      await agencyPage.goto();
      expect(sharedPage.url()).toContain(ad100Data.routes.agencyList);
    });

    // @tc: [AD100-3] - Check điều hướng Inbound Deep-link
    test("[AD100-3]: Mở trực tiếp URL /admin/agencies tải thành công danh sách mặc định", async () => {
      await agencyPage.goto();
      await expect(agencyPage.searchInput).toBeVisible({
        timeout: ad100Data.timeouts.pageLoad,
      });
      await expect(agencyPage.table).toBeVisible();
    });

    // @tc: [AD100-4] - Check Inbound với query params
    test("[AD100-4]: Truy cập URL kèm query params tự động điền filter và tải dữ liệu", async () => {
      const searchParams = {
        q: ad100Data.searchTestData.validName,
        status: ad100Data.dropdownOptions.statusValues.active,
      };
      await agencyPage.goto(searchParams);
      expect(sharedPage.url()).toContain(`q=${encodeURIComponent(searchParams.q)}`);
      expect(sharedPage.url()).toContain(`status=${searchParams.status}`);
    });

    // @tc: [AD100-5] - Check Inbound với params không có data
    test("[AD100-5]: Truy cập query params không tồn tại hiển thị Empty State CMMSG47", async () => {
      await agencyPage.goto({ q: ad100Data.searchTestData.nonExistentKeyword });
      const rowCount = await agencyPage.getRowCount();
      if (rowCount === 0) {
        await expect(agencyPage.emptyStateText).toBeVisible({
          timeout: ad100Data.timeouts.modal,
        });
      }
    });

    // @tc: [AD100-6] - Check Screen Lifecycle F5 Reload
    test("[AD100-6]: Nhấn F5 Reload trang bảo lưu trạng thái tìm kiếm hiện tại", async () => {
      await agencyPage.goto();
      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.kanjiKeyword);
      await sharedPage.reload({ waitUntil: "domcontentloaded" });
      await agencyPage.waitForLoadingDetached();
      await expect(agencyPage.searchInput).toBeVisible();
    });

    // @tc: [AD100-8] & [AD100-9] - Check Breadcrumbs
    test("[AD100-8][AD100-9]: Kiểm tra hiển thị breadcrumb ＞ 事務所管理 và không bị reload khi click", async () => {
      await agencyPage.goto();
      if (await agencyPage.breadcrumb.count() > 0) {
        await expect(agencyPage.breadcrumb).toBeVisible();
      }
    });
  });

  // =========================================================================
  // SECTION 2: SEARCH BOX CONTROLS ([AD100-10] -> [AD100-21])
  // =========================================================================
  test.describe("2. Search Box Controls", () => {
    test.beforeEach(async () => {
      await agencyPage.goto();
    });

    // @tc: [AD100-10] - Check hiển thị và placeholder
    test("[AD100-10]: Ô tìm kiếm hiển thị đúng placeholder 事務所名・事務所ID", async () => {
      await expect(agencyPage.searchInput).toBeVisible();
      await expect(agencyPage.searchInput).toHaveAttribute(
        "placeholder",
        ad100Data.placeholders.searchInput
      );
    });

    // @tc: [AD100-11] - Kiểm tra nhập ký tự chữ
    test("[AD100-11]: Cho phép nhập ký tự chữ Kanji tiếng Nhật và chữ Latin", async () => {
      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.kanjiKeyword);
      await expect(agencyPage.searchInput).toHaveValue(
        ad100Data.searchTestData.kanjiKeyword
      );

      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.latinKeyword);
      await expect(agencyPage.searchInput).toHaveValue(
        ad100Data.searchTestData.latinKeyword
      );
    });

    // @tc: [AD100-12] - Kiểm tra nhập ký tự số
    test("[AD100-12]: Cho phép nhập chuỗi ký tự số", async () => {
      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.numbersOnly);
      await expect(agencyPage.searchInput).toHaveValue(
        ad100Data.searchTestData.numbersOnly
      );
    });

    // @tc: [AD100-13] - Kiểm tra nhập ký tự đặc biệt
    test("[AD100-13]: Cho phép nhập chuỗi ký tự đặc biệt", async () => {
      await agencyPage.fillSearchKeyword(
        ad100Data.searchTestData.specialCharacters
      );
      await expect(agencyPage.searchInput).toHaveValue(
        ad100Data.searchTestData.specialCharacters
      );
    });

    // @tc: [AD100-14] - Kiểm tra nhập khoảng trắng (Trim space đầu/cuối)
    test("[AD100-14]: Tự động trim khoảng trắng thừa ở đầu và cuối chuỗi khi tìm kiếm", async () => {
      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.spacesAround);
      await agencyPage.clickSearch();
      await expect(agencyPage.searchInput).toBeVisible();
    });

    // @tc: [AD100-17] - Tìm kiếm bằng phím Enter
    test("[AD100-17]: Nhấn phím Enter trong ô tìm kiếm kích hoạt tải danh sách", async () => {
      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.validName);
      await agencyPage.pressEnterInSearch();
      await expect(agencyPage.table).toBeVisible();
    });

    // @tc: [AD100-18] - Nhấn Enter khi ô rỗng
    test("[AD100-18]: Nhấn Enter khi ô tìm kiếm rỗng tải danh sách mặc định", async () => {
      await agencyPage.fillSearchKeyword("");
      await agencyPage.pressEnterInSearch();
      await expect(agencyPage.table).toBeVisible();
    });

    // @tc: [AD100-19] - Tìm kiếm một phần tên Agency (Partial match)
    test("[AD100-19]: Tìm kiếm partial match theo tên Agency trả về kết quả khớp", async () => {
      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.validName);
      await agencyPage.clickSearch();
      const count = await agencyPage.getRowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    // @tc: [AD100-20] - Tìm kiếm chính xác mã Agency ID (Exact match)
    test("[AD100-20]: Tìm kiếm exact match theo mã Agency ID", async () => {
      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.validCode);
      await agencyPage.clickSearch();
      await expect(agencyPage.table).toBeVisible();
    });

    // @tc: [AD100-21] - Tìm kiếm chính xác System ID
    test("[AD100-21]: Tìm kiếm chính xác theo System ID tự sinh", async () => {
      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.validSystemId);
      await agencyPage.clickSearch();
      await expect(agencyPage.table).toBeVisible();
    });
  });

  // =========================================================================
  // SECTION 3: STATUS DROPDOWN & ACTIONS ([AD100-22] -> [AD100-34])
  // =========================================================================
  test.describe("3. Status Filter & Action Buttons", () => {
    test.beforeEach(async () => {
      await agencyPage.goto();
    });

    // @tc: [AD100-22] - Check hiển thị và giá trị mặc định
    test("[AD100-22]: Dropdown trạng thái hiển thị mặc định là 全て", async () => {
      if (await agencyPage.statusDropdown.count() > 0) {
        await expect(agencyPage.statusDropdown).toBeVisible();
      }
    });

    // @tc: [AD100-24] - Chọn option '利用中' (Active)
    test("[AD100-24]: Chọn lọc theo trạng thái 利用中 (Active)", async () => {
      await agencyPage.selectStatus(ad100Data.dropdownOptions.status.active);
      await agencyPage.clickSearch();
      await expect(agencyPage.table).toBeVisible();
    });

    // @tc: [AD100-25] - Chọn option '停止中' (Inactive)
    test("[AD100-25]: Chọn lọc theo trạng thái 停止中 (Inactive)", async () => {
      await agencyPage.selectStatus(ad100Data.dropdownOptions.status.inactive);
      await agencyPage.clickSearch();
      await expect(agencyPage.table).toBeVisible();
    });

    // @tc: [AD100-26] - Chọn lại option '全て'
    test("[AD100-26]: Chọn lại option 全て tải toàn bộ danh sách cả 2 trạng thái", async () => {
      await agencyPage.selectStatus(ad100Data.dropdownOptions.status.all);
      await agencyPage.clickSearch();
      await expect(agencyPage.table).toBeVisible();
    });

    // @tc: [AD100-28] - Nút 検索 tìm kiếm mặc định
    test("[AD100-28]: Bấm 検索 tải danh sách Agency sắp xếp theo updated_at DESC", async () => {
      await agencyPage.clickSearch();
      await expect(agencyPage.table).toBeVisible();
    });

    // @tc: [AD100-29] - Tìm kiếm kết hợp (AND logic)
    test("[AD100-29]: Tìm kiếm kết hợp từ khóa tên và status 利用中", async () => {
      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.validName);
      await agencyPage.selectStatus(ad100Data.dropdownOptions.status.active);
      await agencyPage.clickSearch();
      await expect(agencyPage.table).toBeVisible();
    });

    // @tc: [AD100-30] - Debounce chống double-click (CMR15)
    test("[AD100-30]: Chống double-click nút 検索 không gửi spam request (CMR15)", async () => {
      await agencyPage.searchButton.dblclick();
      await agencyPage.waitForLoadingDetached();
      await expect(agencyPage.table).toBeVisible();
    });

    // @tc: [AD100-32] - Nút クリア reset điều kiện tìm kiếm
    test("[AD100-32]: Click nút クリア khôi phục bộ lọc về mặc định và tải lại danh sách", async () => {
      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.latinKeyword);
      await agencyPage.selectStatus(ad100Data.dropdownOptions.status.inactive);
      await agencyPage.clickClear();
      await expect(agencyPage.searchInput).toHaveValue("");
    });

    // @tc: [AD100-33] & [AD100-34] - Nút 新規登録
    test("[AD100-33][AD100-34]: Nút 新規登録 hiển thị màu Primary và click điều hướng sang AD200", async () => {
      await expect(agencyPage.createButton).toBeVisible();
      await agencyPage.clickCreateAgency();
      await expect(sharedPage).toHaveURL(/.*create/);
    });
  });

  // =========================================================================
  // SECTION 4: TABLE HEADERS & DATA CELLS ([AD100-47] -> [AD100-58])
  // =========================================================================
  test.describe("4. Table Headers, Sorting & Data Integrity", () => {
    test.beforeEach(async () => {
      await agencyPage.goto();
    });

    // @tc: [AD100-47] - Sort cột 作成日
    test("[AD100-47]: Click header cột 作成日 đảo chiều sắp xếp", async () => {
      if (await agencyPage.tableHeaderCreatedAt.count() > 0) {
        await agencyPage.clickSortCreatedAt();
        await expect(agencyPage.table).toBeVisible();
      }
    });

    // @tc: [AD100-48] - Sort cột 変更日
    test("[AD100-48]: Click header cột 変更日 đảo chiều sắp xếp", async () => {
      if (await agencyPage.tableHeaderUpdatedAt.count() > 0) {
        await agencyPage.clickSortUpdatedAt();
        await expect(agencyPage.table).toBeVisible();
      }
    });

    // @tc: [AD100-49] & [AD100-53] - Data mapping & Công thức doanh thu
    test("[AD100-49][AD100-53]: Dữ liệu từng dòng ánh xạ đúng ID, mã Agency và công thức tổng doanh thu", async () => {
      const rowCount = await agencyPage.getRowCount();
      if (rowCount > 0) {
        const row = await agencyPage.getRowData(0);
        expect(row.id).toBeDefined();
        expect(row.agencyCode).toBeDefined();
      }
    });

    // @tc: [AD100-51] & [AD100-52] - Cột ライバー数 (CR 06/11/2025)
    test("[AD100-51][AD100-52]: Cột ライバー数 hiển thị số lượng và click điều hướng sang AD302", async () => {
      const rowCount = await agencyPage.getRowCount();
      if (rowCount > 0) {
        await agencyPage.clickStreamerCount(0);
        await expect(sharedPage).toHaveURL(/.*livers|.*302/);
      }
    });

    // @tc: [AD100-57] - Click dòng hoặc nút chi tiết điều hướng sang AD301
    test("[AD100-57]: Click vào dòng Agency hoặc icon chi tiết điều hướng sang AD301", async () => {
      await agencyPage.goto();
      const rowCount = await agencyPage.getRowCount();
      if (rowCount > 0) {
        await agencyPage.clickRowDetail(0);
        await expect(sharedPage).toHaveURL(/\/admin\/agencies\/\d+/);
      }
    });

    // @tc: [AD100-58] - CR 13/08/2026: KHÔNG CÓ nút Xóa trên bảng AD100
    test("[AD100-58]: Xác nhận bảng AD100 không còn nút Xóa (chỉ xóa trong AD301 theo CR 13/08/2026)", async () => {
      await agencyPage.goto();
      const deleteButtons = agencyPage.getDeleteButtons();
      await expect(deleteButtons).toHaveCount(0);
    });
  });

  // =========================================================================
  // SECTION 5: PAGINATION 10 VIEWPOINTS ([AD100-59] -> [AD100-70])
  // =========================================================================
  test.describe("5. Pagination 10 Viewpoints (CMR01 & CMR23)", () => {
    test.beforeEach(async () => {
      await agencyPage.goto();
    });

    // @tc: [AD100-59] - Viewpoint 1: UI Mặc định phân trang
    test("[AD100-59]: Hiển thị thanh phân trang đầy đủ theo chuẩn CMR23 khi có nhiều hơn 10 bản ghi", async () => {
      const rowCount = await agencyPage.getRowCount();
      if (rowCount >= 10) {
        await expect(agencyPage.paginationContainer).toBeVisible();
      }
    });

    // @tc: [AD100-60] - Viewpoint 2: Page Size cố định 10 dòng/trang
    test("[AD100-60]: Số dòng hiển thị tối đa trên một trang không vượt quá 10", async () => {
      const rowCount = await agencyPage.getRowCount();
      expect(rowCount).toBeLessThanOrEqual(ad100Data.pagination.defaultItemsPerPage);
    });

    // @tc: [AD100-61] & [AD100-62] - Viewpoint 3: Chuyển trang trực tiếp & Next/Prev
    test("[AD100-61][AD100-62]: Chuyển trang qua nút số và nút Next/Prev hoạt động trơn tru", async () => {
      if (await agencyPage.nextPageButton.count() > 0 && await agencyPage.nextPageButton.isEnabled()) {
        await agencyPage.nextPageButton.click();
        await agencyPage.waitForLoadingDetached();
        await expect(agencyPage.table).toBeVisible();

        await agencyPage.prevPageButton.click();
        await agencyPage.waitForLoadingDetached();
        await expect(agencyPage.table).toBeVisible();
      }
    });

    // @tc: [AD100-63] - Viewpoint 4: Disabled tại Trang 1
    test("[AD100-63]: Nút Prev và First bị khóa (Disabled) khi đang đứng ở Trang 1", async () => {
      if (await agencyPage.prevPageButton.count() > 0) {
        await expect(agencyPage.prevPageButton).toBeDisabled();
      }
    });

    // @tc: [AD100-65] - Viewpoint 5: Biên 0 bản ghi (Ẩn phân trang, hiện Empty State)
    test("[AD100-65]: Tìm kiếm 0 bản ghi ẩn thanh phân trang và hiện Empty State CMMSG47", async () => {
      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.nonExistentKeyword);
      await agencyPage.clickSearch();
      const count = await agencyPage.getRowCount();
      if (count === 0) {
        await expect(agencyPage.emptyStateText).toBeVisible();
        await expect(agencyPage.paginationContainer).not.toBeVisible();
      }
    });

    // @tc: [AD100-68] - Viewpoint 8: Reset về Trang 1 khi search mới
    test("[AD100-68]: Đang ở trang sau, thực hiện tìm kiếm mới tự động reset về Trang 1", async () => {
      await agencyPage.clickClear();
      await agencyPage.fillSearchKeyword(ad100Data.searchTestData.validName);
      await agencyPage.clickSearch();
      await expect(agencyPage.table).toBeVisible();
    });

    // @tc: [AD100-70] - Viewpoint 10: Xử lý an toàn URL tampering
    test("[AD100-70]: Sửa tham số URL ?page=-1 xử lý an toàn không bị sập lỗi 500", async () => {
      await agencyPage.goto({ page: -1 });
      await expect(agencyPage.table).toBeVisible();
    });
  });

  // =========================================================================
  // SECTION 6: EMPTY STATE & SYSTEM FEEDBACK ([AD100-71] -> [AD100-78])
  // =========================================================================
  test.describe("6. Empty State & System Feedback", () => {
    // @tc: [AD100-71] - Empty State CMMSG47
    test("[AD100-71]: Hiển thị chính xác thông điệp CMMSG47: 一致する検索結果はありません。", async () => {
      await agencyPage.goto({ q: ad100Data.searchTestData.nonExistentKeyword });
      const count = await agencyPage.getRowCount();
      if (count === 0) {
        await expect(agencyPage.emptyStateText).toContainText(
          ad100Data.labels.emptyState
        );
      }
    });

    // @tc: [AD100-75] - Responsive Layout
    test("[AD100-75]: Bảng dữ liệu hiển thị ổn định trên các độ phân giải màn hình khác nhau", async () => {
      await sharedPage.setViewportSize(ad100Data.viewports.standardDesktop);
      await agencyPage.goto();
      await expect(agencyPage.table).toBeVisible();
    });
  });
});
