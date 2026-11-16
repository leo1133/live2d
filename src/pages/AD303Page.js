import { ad303Data } from "../test-data/ad303Data.js";
import { ENDPOINTS } from "../config/endpoint.js";

/**
 * Page Object Model cho màn hình AD303_Revenue Analysis (事務所詳細_売上)
 * Kèm theo Modals: AD3031 (Create Reward), AD3032 (Edit Reward), AD3033 (Payment Statement PDF)
 * Tuân thủ Rule 05 & Ranh giới đỏ số 9:
 * - 100% Selectors tĩnh được khai báo qua biến ad303Data.selectors.* (Zero Raw Selectors inline).
 * - Các locators mang tính động được đóng gói thành các hàm tham số hóa (Parameterized Locators).
 * - Ánh xạ vị trí cột qua ad303Data.selectors.rewardColumns và transColumns.
 * - Tuyệt đối không chứa câu lệnh expect() kiểm tra kết quả bên trong class này.
 */
export class AD303Page {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // 1. Navigation & Breadcrumbs (Tham chiếu qua ad303Data.selectors)
    this.breadcrumb = page
      .locator(ad303Data.selectors.breadcrumb)
      .or(page.getByText(ad303Data.labels.breadcrumbs));
    this.pageTitle = page
      .getByRole("heading", { name: ad303Data.labels.pageTitle })
      .or(page.locator(ad303Data.selectors.pageHeading).filter({ hasText: ad303Data.labels.pageTitle }));

    // 2. Tabs
    this.tabDetail = page.getByRole("tab", { name: ad303Data.labels.tabDetail }).or(page.locator(ad303Data.selectors.tabDetail));
    this.tabLiverList = page.getByRole("tab", { name: ad303Data.labels.tabLiverList }).or(page.locator(ad303Data.selectors.tabLiverList));
    this.tabRevenue = page.getByRole("tab", { name: ad303Data.labels.tabRevenue }).or(page.locator(ad303Data.selectors.tabRevenue));

    // 3. KPI Cards (4 thẻ số dư Point khả dụng)
    this.cardCashBalance = page.locator(ad303Data.selectors.cardCashBalance);
    this.cardAvailablePoints = page.locator(ad303Data.selectors.cardAvailablePoints);
    this.cardFamiliaPoints = page.locator(ad303Data.selectors.cardFamiliaPoints);
    this.cardGiftPoints = page.locator(ad303Data.selectors.cardGiftPoints);

    // 4. Filter Controls (Date & Streamer)
    this.startDateInput = page.locator(ad303Data.selectors.startDateInput).first();
    this.endDateInput = page.locator(ad303Data.selectors.endDateInput).last();
    this.streamerSelect = page.locator(ad303Data.selectors.streamerSelect);
    this.searchButton = page.getByRole("button", { name: ad303Data.labels.btnSearch, exact: true });
    this.clearButton = page.getByRole("button", { name: ad303Data.labels.btnClear, exact: true });

    // 5. Bảng 1: Lịch sử chuyển thưởng Agency (Rewards)
    this.rewardTable = page.locator(ad303Data.selectors.rewardTable).first();
    this.rewardRows = this.rewardTable.locator(ad303Data.selectors.tableRows);
    this.addRewardButton = page.getByRole("button", { name: ad303Data.labels.btnAddReward });

    // 6. Modal AD3031 / AD3032: Thêm / Sửa bản ghi thưởng
    this.rewardModal = page.locator(ad303Data.selectors.rewardModal).filter({ hasText: "報酬" });
    this.modalRewardMonthInput = this.rewardModal.locator(ad303Data.selectors.modalRewardMonthInput);
    this.modalRewardAmountInput = this.rewardModal.locator(ad303Data.selectors.modalRewardAmountInput);
    this.modalRewardStatusSelect = this.rewardModal.locator(ad303Data.selectors.modalRewardStatusSelect);
    this.modalRewardNoteInput = this.rewardModal.locator(ad303Data.selectors.modalRewardNoteInput);
    this.modalSaveButton = this.rewardModal.getByRole("button", { name: ad303Data.labels.btnSave });
    this.modalCancelButton = this.rewardModal.getByRole("button", { name: ad303Data.labels.btnCancel });

    // 7. Bảng 2: Chi tiết giao dịch (Transactions) & CSV Export
    this.transTable = page.locator(ad303Data.selectors.transTable).last();
    this.transRows = this.transTable.locator(ad303Data.selectors.tableRows);
    this.exportCsvButton = page.getByRole("button", { name: ad303Data.labels.btnExportCsv });

    // 8. Modal AD3033: Xuất chứng từ PDF
    this.pdfModal = page.locator(ad303Data.selectors.pdfModal).filter({ hasText: "支払明細書" });
    this.pdfDownloadButton = this.pdfModal.getByRole("button", { name: ad303Data.labels.btnDownloadPdf });

    this.toastNotification = page.locator(ad303Data.selectors.toastNotification);
  }

  // Parameterized Locators
  getRewardCell(rowIndex = 0, columnName = "amount") {
    const colIndex = ad303Data.selectors.rewardColumns[columnName];
    return this.rewardRows.nth(rowIndex).locator(ad303Data.selectors.tableCells).nth(colIndex);
  }

  getTransCell(rowIndex = 0, columnName = "amount") {
    const colIndex = ad303Data.selectors.transColumns[columnName];
    return this.transRows.nth(rowIndex).locator(ad303Data.selectors.tableCells).nth(colIndex);
  }

  getSidebarMenu(menuName = ad303Data.labels.sidebarMenu) {
    return this.page.getByRole("button", { name: menuName });
  }

  getTab(tabName) {
    return this.page.getByRole("tab", { name: tabName });
  }

  /**
   * Điều hướng trực tiếp đến màn hình AD303
   */
  async goto(agencyId = ad303Data.sampleData.agencyId, queryParams = {}) {
    const url = `${ad303Data.routes.revenue(agencyId)}${ad303Data.routes.buildQuery(queryParams)}`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  /**
   * Lọc doanh thu theo khoảng thời gian và streamer
   */
  async filterRevenue({ startDate, endDate, streamerId } = {}) {
    if (startDate !== undefined) await this.startDateInput.fill(startDate);
    if (endDate !== undefined) await this.endDateInput.fill(endDate);
    if (streamerId !== undefined) await this.streamerSelect.selectOption(String(streamerId));
    await this.searchButton.click();
  }

  /**
   * Xóa bộ lọc
   */
  async clearFilter() {
    await this.clearButton.click();
  }

  /**
   * Mở modal thêm thưởng AD3031
   */
  async openCreateRewardModal() {
    await this.addRewardButton.click();
  }

  /**
   * Điền form trong modal thưởng
   */
  async fillRewardModal({ month, amount, status, note } = {}) {
    if (month !== undefined) await this.modalRewardMonthInput.fill(month);
    if (amount !== undefined) await this.modalRewardAmountInput.fill(String(amount));
    if (status !== undefined) await this.modalRewardStatusSelect.selectOption(String(status));
    if (note !== undefined) await this.modalRewardNoteInput.fill(note);
  }

  /**
   * Lưu modal thưởng
   */
  async saveRewardModal() {
    await this.modalSaveButton.click();
  }

  /**
   * Bấm nút xuất file CSV
   */
  async exportCsv() {
    await this.exportCsvButton.click();
  }
}

export { AD303Page as AD303AgencyRevenuePage };
