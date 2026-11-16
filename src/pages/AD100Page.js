import { ad100Data } from "../test-data/ad100Data.js";
import { ENDPOINTS } from "../config/endpoint.js";

/**
 * Page Object Model cho màn hình AD100_Agency List / Search (事務所一覧・検索)
 * Tuân thủ Rule 05:
 * - 100% Selectors tĩnh được khai báo qua biến ad100Data.selectors.* (Zero Raw Selectors inline).
 * - Các locators mang tính động được đóng gói thành các hàm tham số hóa (Parameterized Locators).
 * - Không chứa magic column index (.nth(4)), ánh xạ qua ad100Data.selectors.columns.
 * - Tuyệt đối không chứa câu lệnh expect() bên trong class này.
 */
export class AD100Page {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // 1. Static Navigation & Breadcrumbs (Khai báo qua biến selectors)
    this.breadcrumb = page
      .locator(ad100Data.selectors.breadcrumb)
      .or(page.getByText(ad100Data.labels.breadcrumbs));

    // 2. Static Search & Action Controls
    this.searchInput = page
      .getByPlaceholder(ad100Data.placeholders.searchInput)
      .or(page.locator(ad100Data.selectors.searchInput));

    this.statusDropdown = page
      .getByRole("combobox", { name: ad100Data.labels.statusDropdown })
      .or(page.locator(ad100Data.selectors.statusDropdown));

    this.searchButton = page.getByRole("button", {
      name: ad100Data.labels.btnSearch,
      exact: true,
    });
    this.clearButton = page.getByRole("button", {
      name: ad100Data.labels.btnClear,
      exact: true,
    });
    this.createButton = page.getByRole("button", {
      name: ad100Data.labels.btnCreate,
      exact: true,
    });

    // 3. Static Table & Headers
    this.table = page
      .getByRole("table")
      .or(page.locator(ad100Data.selectors.dataTable));

    this.tableHeaderId = this.table
      .locator(ad100Data.selectors.tableHeaders)
      .filter({ hasText: ad100Data.tableHeaders.id });
    this.tableHeaderAgencyId = this.table
      .locator(ad100Data.selectors.tableHeaders)
      .filter({ hasText: ad100Data.tableHeaders.agencyId });
    this.tableHeaderAgencyName = this.table
      .locator(ad100Data.selectors.tableHeaders)
      .filter({ hasText: ad100Data.tableHeaders.agencyName });
    this.tableHeaderContactOwner = this.table
      .locator(ad100Data.selectors.tableHeaders)
      .filter({ hasText: ad100Data.tableHeaders.contactOwner });
    this.tableHeaderStreamerCount = this.table
      .locator(ad100Data.selectors.tableHeaders)
      .filter({ hasText: ad100Data.tableHeaders.streamerCount });
    this.tableHeaderPointSales = this.table
      .locator(ad100Data.selectors.tableHeaders)
      .filter({ hasText: ad100Data.tableHeaders.pointSales });
    this.tableHeaderFamiliaSales = this.table
      .locator(ad100Data.selectors.tableHeaders)
      .filter({ hasText: ad100Data.tableHeaders.familiaSales });
    this.tableHeaderTotalSales = this.table
      .locator(ad100Data.selectors.tableHeaders)
      .filter({ hasText: ad100Data.tableHeaders.totalSales });
    this.tableHeaderStatus = this.table
      .locator(ad100Data.selectors.tableHeaders)
      .filter({ hasText: ad100Data.tableHeaders.status });
    this.tableHeaderCreatedAt = this.table
      .locator(ad100Data.selectors.tableHeaders)
      .filter({ hasText: ad100Data.tableHeaders.createdAt });
    this.tableHeaderUpdatedAt = this.table
      .locator(ad100Data.selectors.tableHeaders)
      .filter({ hasText: ad100Data.tableHeaders.updatedAt });
    this.tableHeaderActions = this.table
      .locator(ad100Data.selectors.tableHeaders)
      .filter({ hasText: ad100Data.tableHeaders.actions });

    // 4. Data Rows & States
    this.tableRows = this.table.locator(ad100Data.selectors.tableRows);
    this.emptyStateText = page
      .getByText(ad100Data.labels.emptyState)
      .or(page.locator(ad100Data.selectors.emptyState));
    this.loadingSpinner = page.locator(ad100Data.selectors.loadingSpinner);

    // 5. Pagination Controls
    this.paginationContainer = page.locator(ad100Data.selectors.paginationContainer);
    this.prevPageButton = page
      .getByRole("button", { name: ad100Data.pagination.prevBtn })
      .or(page.locator(ad100Data.selectors.prevPageButton));
    this.nextPageButton = page
      .getByRole("button", { name: ad100Data.pagination.nextBtn })
      .or(page.locator(ad100Data.selectors.nextPageButton));
    this.firstPageButton = page
      .getByRole("button", { name: ad100Data.pagination.firstBtn })
      .or(page.locator(ad100Data.selectors.firstPageButton));
    this.lastPageButton = page
      .getByRole("button", { name: ad100Data.pagination.lastBtn })
      .or(page.locator(ad100Data.selectors.lastPageButton));
  }

  // =========================================================================
  // DYNAMIC LOCATORS (PARAMETERIZED METHODS)
  // =========================================================================

  /**
   * Locator động: Lấy button menu Sidebar theo tên linh hoạt
   */
  getSidebarMenu(menuName = ad100Data.labels.sidebarMenu) {
    return this.page.getByRole("button", { name: menuName });
  }

  /**
   * Getter tương thích ngược cho sidebarMenu mặc định
   */
  get sidebarMenu() {
    return this.getSidebarMenu(ad100Data.labels.sidebarMenu);
  }

  /**
   * Locator động: Lấy link submenu Sidebar theo tên linh hoạt
   */
  getSidebarSubmenu(submenuName = ad100Data.labels.sidebarSubmenu) {
    return this.page.getByRole("link", { name: submenuName });
  }

  /**
   * Getter tương thích ngược cho sidebarSubmenu mặc định
   */
  get sidebarSubmenu() {
    return this.getSidebarSubmenu(ad100Data.labels.sidebarSubmenu);
  }

  /**
   * Locator động: Lấy breadcrumb link theo tên
   */
  getBreadcrumbLink(text = ad100Data.labels.sidebarMenu) {
    return this.page.getByText(text);
  }

  /**
   * Getter tương thích ngược cho breadcrumbLink mặc định
   */
  get breadcrumbLink() {
    return this.getBreadcrumbLink(ad100Data.labels.sidebarMenu);
  }

  /**
   * Locator động: Lấy dòng dữ liệu theo chỉ số dòng (Row Index)
   */
  getTableRow(rowIndex = 0) {
    return this.tableRows.nth(rowIndex);
  }

  /**
   * Locator động: Lấy dòng dữ liệu theo Agency ID hoặc mã code
   */
  getTableRowById(agencyId) {
    return this.tableRows.filter({
      has: this.page.locator(`${ad100Data.selectors.tableCells}:text("${agencyId}")`),
    });
  }

  /**
   * Locator động: Lấy ô (Cell) theo tên cột ngữ nghĩa - Triệt tiêu Magic Index
   */
  getTableCell(rowIndex = 0, columnName = "id") {
    const colIndex = ad100Data.selectors.columns[columnName];
    if (colIndex === undefined) {
      throw new Error(`Cột "${columnName}" không tồn tại trong ad100Data.selectors.columns`);
    }
    return this.getTableRow(rowIndex).locator(ad100Data.selectors.tableCells).nth(colIndex);
  }

  /**
   * Locator động: Lấy nút chuyển trang theo số trang
   */
  getPageNumberButton(pageNumber) {
    return this.paginationContainer.getByRole("button", {
      name: String(pageNumber),
      exact: true,
    });
  }

  /**
   * Locator động: Lấy nút xóa trên bảng (nếu có)
   */
  getDeleteButtons() {
    return this.page.locator(ad100Data.selectors.deleteButtons);
  }

  // =========================================================================
  // ACTIONS & SMART WAITING
  // =========================================================================

  /**
   * Điều hướng vào màn hình AD100 kèm hỗ trợ Query Params động
   */
  async goto(queryParams = "") {
    let url;
    if (typeof queryParams === "object" && queryParams !== null) {
      url = ad100Data.routes.buildAgencyListQuery(queryParams);
    } else if (queryParams) {
      url = queryParams.startsWith("?")
        ? `${ad100Data.routes.agencyList}${queryParams}`
        : `${ad100Data.routes.agencyList}?${queryParams}`;
    } else {
      url = ad100Data.routes.agencyList;
    }

    await this.page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: ad100Data.timeouts.pageLoad,
    });
    await this.waitForLoadingDetached();
  }

  /**
   * Chờ spinner biến mất (Smart Waiting)
   */
  async waitForLoadingDetached() {
    try {
      await this.loadingSpinner.waitFor({
        state: "detached",
        timeout: ad100Data.timeouts.modal,
      });
    } catch {
      // Bỏ qua nếu spinner không xuất hiện
    }
  }

  /**
   * Nhập từ khóa tìm kiếm
   */
  async fillSearchKeyword(keyword) {
    await this.searchInput.fill(keyword);
  }

  /**
   * Chọn trạng thái từ dropdown
   */
  async selectStatus(statusText) {
    if ((await this.statusDropdown.count()) > 0) {
      const tagName = await this.statusDropdown.evaluate((el) =>
        el.tagName.toLowerCase()
      );
      if (tagName === "select") {
        await this.statusDropdown.selectOption({ label: statusText });
      } else {
        await this.statusDropdown.click();
        await this.page.getByRole("option", { name: statusText }).click();
      }
    }
  }

  /**
   * Thực hiện tìm kiếm kèm theo chờ hoàn tất request mạng (Smart Waiting)
   */
  async clickSearch() {
    const searchPromise = this.page
      .waitForResponse(
        (resp) =>
          resp.url().includes(ENDPOINTS.AGENCY.GET_LIST) &&
          (resp.status() === 200 || resp.status() === 304),
        { timeout: ad100Data.timeouts.action }
      )
      .catch(() => {});

    await this.searchButton.click();
    await searchPromise;
    await this.waitForLoadingDetached();
  }

  /**
   * Nhấn Enter trên ô tìm kiếm
   */
  async pressEnterInSearch() {
    const searchPromise = this.page
      .waitForResponse(
        (resp) =>
          resp.url().includes(ENDPOINTS.AGENCY.GET_LIST) &&
          (resp.status() === 200 || resp.status() === 304),
        { timeout: ad100Data.timeouts.action }
      )
      .catch(() => {});

    await this.searchInput.press("Enter");
    await searchPromise;
    await this.waitForLoadingDetached();
  }

  /**
   * Click nút クリア (Reset bộ lọc)
   */
  async clickClear() {
    const clearPromise = this.page
      .waitForResponse(
        (resp) =>
          resp.url().includes(ENDPOINTS.AGENCY.GET_LIST) &&
          (resp.status() === 200 || resp.status() === 304),
        { timeout: ad100Data.timeouts.action }
      )
      .catch(() => {});

    await this.clearButton.click();
    await clearPromise;
    await this.waitForLoadingDetached();
  }

  /**
   * Click nút 新規登録 (Điều hướng sang AD200)
   */
  async clickCreateAgency() {
    await this.createButton.click();
  }

  /**
   * Sort cột 作成日 (Ngày tạo)
   */
  async clickSortCreatedAt() {
    const sortPromise = this.page
      .waitForResponse((resp) => resp.url().includes(ENDPOINTS.AGENCY.GET_LIST), {
        timeout: ad100Data.timeouts.action,
      })
      .catch(() => {});

    await this.tableHeaderCreatedAt.click();
    await sortPromise;
    await this.waitForLoadingDetached();
  }

  /**
   * Sort cột 変更日 (Ngày cập nhật)
   */
  async clickSortUpdatedAt() {
    const sortPromise = this.page
      .waitForResponse((resp) => resp.url().includes(ENDPOINTS.AGENCY.GET_LIST), {
        timeout: ad100Data.timeouts.action,
      })
      .catch(() => {});

    await this.tableHeaderUpdatedAt.click();
    await sortPromise;
    await this.waitForLoadingDetached();
  }

  /**
   * Lấy số lượng bản ghi hiển thị trên bảng
   */
  async getRowCount() {
    return await this.tableRows.count();
  }

  /**
   * Lấy dữ liệu chi tiết của 1 dòng theo bảng ánh xạ cột chuẩn
   */
  async getRowData(rowIndex = 0) {
    const row = this.getTableRow(rowIndex);
    const cells = row.locator(ad100Data.selectors.tableCells);
    const count = await cells.count();
    const cellTexts = [];
    for (let i = 0; i < count; i++) {
      cellTexts.push((await cells.nth(i).innerText()).trim());
    }

    const cols = ad100Data.selectors.columns;
    return {
      id: cellTexts[cols.id] || "",
      agencyCode: cellTexts[cols.agencyCode] || "",
      name: cellTexts[cols.agencyName] || "",
      owner: cellTexts[cols.contactOwner] || "",
      memberCount: cellTexts[cols.streamerCount] || "",
      pointSales: cellTexts[cols.pointSales] || "",
      familiaSales: cellTexts[cols.familiaSales] || "",
      totalSales: cellTexts[cols.totalSales] || "",
      status: cellTexts[cols.status] || "",
      createdAt: cellTexts[cols.createdAt] || "",
      updatedAt: cellTexts[cols.updatedAt] || "",
    };
  }

  /**
   * Click vào cột ライバー数 (CR 06/11/2025: Điều hướng sang AD302)
   */
  async clickStreamerCount(rowIndex = 0) {
    await this.getTableCell(rowIndex, "streamerCount").click();
  }

  /**
   * Click vào dòng Agency hoặc nút Chi tiết (Điều hướng sang AD301)
   */
  async clickRowDetail(rowIndex = 0) {
    await this.getTableCell(rowIndex, "actions").click();
  }

  /**
   * Click chuyển sang số trang cụ thể
   */
  async clickPageNumber(pageNumber) {
    const pageBtn = this.getPageNumberButton(pageNumber);
    const pagePromise = this.page
      .waitForResponse((resp) => resp.url().includes(ENDPOINTS.AGENCY.GET_LIST), {
        timeout: ad100Data.timeouts.action,
      })
      .catch(() => {});

    await pageBtn.click();
    await pagePromise;
    await this.waitForLoadingDetached();
  }
}

export { AD100Page as AD100AgencyListPage };