import { af100Data } from "../test-data/af100Data.js";

/**
 * Page Object Model cho màn hình AF100 — Gift List (ギフト一覧)
 * Tuân thủ Guardrail #9: Zero raw selectors, Zero magic indexes, Parameterized locators.
 */
export class AF100Page {
  constructor(page) {
    this.page = page;
    this.sidebarMenu = page.locator(af100Data.selectors.sidebarMenu);
    this.breadcrumb = page.locator(af100Data.selectors.breadcrumb);
    this.searchInput = page
      .getByPlaceholder(af100Data.placeholders.searchInput)
      .or(page.locator(af100Data.selectors.searchInput));
    this.clearSearchIcon = page.locator(af100Data.selectors.clearSearchIcon);
    this.categoryDropdown = page.locator(af100Data.selectors.categoryDropdown);
    this.statusDropdown = page.locator(af100Data.selectors.statusDropdown);
    this.animationTypeDropdown = page.locator(af100Data.selectors.animationTypeDropdown);
    this.searchButton = page.getByRole("button", { name: af100Data.labels.btnSearch, exact: true });
    this.clearButton = page.getByRole("button", { name: af100Data.labels.btnClear, exact: true });
    this.createButton = page
      .getByRole("button", { name: af100Data.labels.btnCreate, exact: true })
      .or(page.getByRole("link", { name: af100Data.labels.btnCreate, exact: true }));
    this.table = page.locator(af100Data.selectors.dataTable);
    this.tableRows = this.table.locator(af100Data.selectors.tableRows);
    this.emptyStateText = page
      .getByText(af100Data.labels.emptyState)
      .or(page.locator(af100Data.selectors.emptyState));
    this.paginationContainer = page.locator(af100Data.selectors.paginationContainer);
    this.paginationPrevBtn = page.getByRole("button", { name: af100Data.labels.paginationPrev });
    this.paginationNextBtn = page.getByRole("button", { name: af100Data.labels.paginationNext });
    this.paginationFirstBtn = page.getByRole("button", { name: af100Data.labels.paginationFirst, exact: true });
    this.paginationLastBtn = page.getByRole("button", { name: af100Data.labels.paginationLast, exact: true });
    this.modalCancelBtn = page.getByRole("button", { name: af100Data.labels.modalCancel });
    this.permissionErrorText = page.getByText(af100Data.labels.errorPermission);
    this.serverErrorText = page.getByText(af100Data.labels.errorServer);
  }

  getSidebarMenu(menuName = af100Data.labels.sidebarParent) {
    return this.page.getByRole("button", { name: menuName }).or(this.page.getByRole("link", { name: menuName }));
  }

  getTableHeader(headerText) {
    return this.table.locator(af100Data.selectors.tableHeaders).filter({ hasText: headerText });
  }

  getTableCell(rowIndex, columnName) {
    const colIndex = af100Data.selectors.columns[columnName];
    return this.tableRows.nth(rowIndex).locator("td").nth(colIndex);
  }

  getRowEditButton(rowIndex = 0) {
    return this.getTableCell(rowIndex, "actions").locator(af100Data.selectors.editButton);
  }

  getRowDeleteButton(rowIndex = 0) {
    return this.getTableCell(rowIndex, "actions").locator(af100Data.selectors.deleteButton);
  }

  getPageNumberButton(pageNumber) {
    return this.paginationContainer.getByRole("button", { name: String(pageNumber), exact: true });
  }

  async goto(params = {}) {
    const url = af100Data.routes.buildGiftListQuery(params);
    await this.page.goto(url, { waitUntil: "domcontentloaded", timeout: af100Data.timeouts.pageLoad });
  }

  async fillSearchKeyword(keyword) {
    await this.searchInput.fill(keyword);
  }

  async clickSearch() {
    await this.searchButton.click();
  }

  async clickClear() {
    await this.clearButton.click();
  }

  async selectStatus(statusValue) {
    await this.statusDropdown.selectOption(statusValue);
  }

  async selectCategory(categoryValue) {
    await this.categoryDropdown.selectOption(String(categoryValue));
  }

  async selectAnimationType(animationType) {
    await this.animationTypeDropdown.selectOption(animationType);
  }

  async clickCreate() {
    await this.createButton.click();
  }
}

export { AF100Page as AF100GiftListPage };
