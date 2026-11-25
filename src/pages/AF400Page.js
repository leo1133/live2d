import { af400Data } from "../test-data/af400Data.js";

/**
 * Page Object Model cho màn hình AF400 — Gift Category Manage
 * // [Pending Live Verification]
 */
export class AF400Page {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.breadcrumb = page.locator(af400Data.selectors.breadcrumb);
    this.table = page.locator(af400Data.selectors.dataTable);
    this.tableRows = this.table.locator(af400Data.selectors.tableRows);
    this.emptyStateText = page.getByText(af400Data.labels.emptyState).or(page.locator(af400Data.selectors.emptyState));
    this.createButton = page.getByRole("button", { name: af400Data.labels.btnCreate, exact: true });
    this.modalDialog = page.locator(af400Data.selectors.modalDialog);
    this.categoryNameInput = this.modalDialog.locator(af400Data.selectors.categoryNameInput);
    this.sortOrderInput = this.modalDialog.locator(af400Data.selectors.sortOrderInput);
    this.modalSaveBtn = this.modalDialog.getByRole("button", { name: af400Data.labels.btnSave, exact: true });
    this.modalCancelBtn = this.modalDialog.getByRole("button", { name: af400Data.labels.btnCancel, exact: true });
    this.modalDeleteBtn = this.modalDialog.getByRole("button", { name: af400Data.labels.btnDelete, exact: true });
    this.errorMessages = page.locator(af400Data.selectors.errorMessages);
    this.paginationContainer = page.locator(af400Data.selectors.paginationContainer);
    this.saveSuccessText = page.getByText(af400Data.labels.msgSaveSuccess);
    this.deleteSuccessText = page.getByText(af400Data.labels.msgDeleteSuccess);
  }

  getTableHeader(headerText) {
    return this.table.locator(af400Data.selectors.tableHeaders).filter({ hasText: headerText });
  }

  getTableCell(rowIndex, columnName) {
    const colIndex = af400Data.selectors.columns[columnName];
    return this.tableRows.nth(rowIndex).locator("td").nth(colIndex);
  }

  getRowEditButton(rowIndex = 0) {
    return this.getTableCell(rowIndex, "actions").getByRole("button", { name: af400Data.labels.btnEdit });
  }

  getRowDeleteButton(rowIndex = 0) {
    return this.getTableCell(rowIndex, "actions").getByRole("button", { name: af400Data.labels.btnDelete });
  }

  async goto() {
    await this.page.goto(af400Data.routes.categoryManage, {
      waitUntil: "domcontentloaded",
      timeout: af400Data.timeouts.pageLoad,
    });
  }
}

export { AF400Page as AF400CategoryManagePage };
