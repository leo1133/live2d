import { af400Data } from "../test-data/af400Data.js";

/**
 * Page Object Model cho màn hình AF400 — Gift Category (ギフトカテゴリ管理)
 */
export class AF400Page {
  constructor(page) {
    this.page = page;
    this.sidebarMenu = page.locator(af400Data.selectors.sidebarMenu);
    this.breadcrumb = page.locator(af400Data.selectors.breadcrumb);
    this.createButton = page.getByRole("button", { name: af400Data.labels.btnCreate, exact: true });
    this.table = page.locator(af400Data.selectors.table);
    this.tableRows = this.table.locator(af400Data.selectors.tableRows);
    this.modal = page.locator(af400Data.selectors.modal);
    this.modalInput = page.locator(af400Data.selectors.modalInput);
    this.modalAddBtn = page.locator(af400Data.selectors.modalAddBtn);
    this.modalSaveBtn = page.locator(af400Data.selectors.modalSaveBtn);
  }

  async goto() {
    await this.page.goto(af400Data.routes.giftCategories, {
      waitUntil: "domcontentloaded",
      timeout: af400Data.timeouts.pageLoad,
    });
  }

  async openCreateModal() {
    await this.createButton.click();
  }
}

export { AF400Page as AF400CategoryPage, AF400Page as AF400CategoryManagePage };
