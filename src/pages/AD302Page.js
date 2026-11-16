import { ad302Data } from "../test-data/ad302Data.js";
import { ENDPOINTS } from "../config/endpoint.js";

/**
 * Page Object Model cho màn hình AD302_Agency Streamer List (事務所詳細_所属ライバー一覧)
 * Tuân thủ Rule 05 & Ranh giới đỏ số 9:
 * - 100% Selectors tĩnh được khai báo qua biến ad302Data.selectors.* (Zero Raw Selectors inline).
 * - Các locators mang tính động được đóng gói thành các hàm tham số hóa (Parameterized Locators).
 * - Ánh xạ vị trí cột ngữ nghĩa qua ad302Data.selectors.columns, triệt tiêu magic index (.nth(4)).
 * - Tuyệt đối không chứa câu lệnh expect() kiểm tra kết quả bên trong class này.
 */
export class AD302Page {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // 1. Navigation & Breadcrumbs (Tham chiếu qua ad302Data.selectors)
    this.breadcrumb = page
      .locator(ad302Data.selectors.breadcrumb)
      .or(page.getByText(ad302Data.labels.breadcrumbs));
    this.pageTitle = page
      .getByRole("heading", { name: ad302Data.labels.pageTitle })
      .or(page.locator(ad302Data.selectors.pageHeading).filter({ hasText: ad302Data.labels.pageTitle }));

    // 2. Tabs
    this.tabDetail = page.getByRole("tab", { name: ad302Data.labels.tabDetail }).or(page.locator(ad302Data.selectors.tabDetail));
    this.tabLiverList = page.getByRole("tab", { name: ad302Data.labels.tabLiverList }).or(page.locator(ad302Data.selectors.tabLiverList));
    this.tabRevenue = page.getByRole("tab", { name: ad302Data.labels.tabRevenue }).or(page.locator(ad302Data.selectors.tabRevenue));

    // 3. Search & Filter Controls (Tham chiếu qua ad302Data.selectors)
    this.searchInput = page
      .getByPlaceholder(ad302Data.placeholders.searchInput)
      .or(page.locator(ad302Data.selectors.searchInput));

    this.statusDropdown = page
      .locator(ad302Data.selectors.statusDropdown)
      .or(page.getByRole("combobox", { name: ad302Data.labels.statusAll }));

    this.agencyStatusDropdown = page
      .locator(ad302Data.selectors.agencyStatusDropdown)
      .or(page.getByRole("combobox", { name: ad302Data.labels.agencyStatusAll }));

    this.searchButton = page.getByRole("button", {
      name: ad302Data.labels.btnSearch,
      exact: true,
    });
    this.clearButton = page.getByRole("button", {
      name: ad302Data.labels.btnClear,
      exact: true,
    });

    // 4. Table & Column Controls (Tham chiếu qua ad302Data.selectors)
    this.table = page.locator(ad302Data.selectors.dataTable);
    this.tableRows = this.table.locator(ad302Data.selectors.tableRows);
    this.toggleColumnsButton = page.locator(ad302Data.selectors.toggleColumnsButton);

    // 5. Action Buttons in Table & Feedback
    this.approveButton = page.getByRole("button", { name: ad302Data.labels.btnApprove });
    this.rejectButton = page.getByRole("button", { name: ad302Data.labels.btnReject });
    this.toastNotification = page.locator(ad302Data.selectors.toastNotification);

    // 6. Pagination Controls
    this.paginationContainer = page.locator(ad302Data.selectors.paginationContainer);
    this.nextPageButton = page.locator(ad302Data.selectors.nextPageButton);
    this.prevPageButton = page.locator(ad302Data.selectors.prevPageButton);
  }

  // Parameterized Locators
  getTableCell(rowIndex = 0, columnName = "id") {
    const colIndex = ad302Data.selectors.columns[columnName];
    return this.tableRows.nth(rowIndex).locator(ad302Data.selectors.tableCells).nth(colIndex);
  }

  getTableRowById(entityId) {
    return this.tableRows.filter({ has: this.page.locator(`td:text("${entityId}")`) });
  }

  getSidebarMenu(menuName = ad302Data.labels.sidebarMenu) {
    return this.page.getByRole("button", { name: menuName });
  }

  getOption(optionLabel) {
    return this.page.getByRole("option", { name: optionLabel });
  }

  /**
   * Điều hướng trực tiếp đến màn hình danh sách streamer AD302
   */
  async goto(agencyId = ad302Data.sampleData.agencyId, queryParams = {}) {
    const url = `${ad302Data.routes.liverList(agencyId)}${ad302Data.routes.buildQuery(queryParams)}`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  /**
   * Thực hiện tìm kiếm streamer với từ khóa và bộ lọc
   */
  async search({ keyword, status, agencyStatus } = {}) {
    if (keyword !== undefined) await this.searchInput.fill(keyword);
    if (status !== undefined) await this.statusDropdown.selectOption(String(status));
    if (agencyStatus !== undefined) await this.agencyStatusDropdown.selectOption(String(agencyStatus));
    await this.searchButton.click();
  }

  /**
   * Bấm nút Xóa bộ lọc (クリア)
   */
  async clear() {
    await this.clearButton.click();
  }

  /**
   * Toggle mở rộng / thu gọn cột nâng cao
   */
  async toggleColumns() {
    if (await this.toggleColumnsButton.isVisible()) {
      await this.toggleColumnsButton.click();
    }
  }
}

export { AD302Page as AD302AgencyLiverListPage };
