import { af300Data } from "../test-data/af300Data.js";

/**
 * Page Object Model cho màn hình AF300 — Gift Update / Delete (ギフト更新・削除)
 */
export class AF300Page {
  constructor(page) {
    this.page = page;
    this.breadcrumb = page.locator(af300Data.selectors.breadcrumb);
    this.nameInput = page.locator(af300Data.selectors.nameInput);
    this.sortOrderInput = page.locator(af300Data.selectors.sortOrderInput);
    this.priceInput = page.locator(af300Data.selectors.priceInput);
    this.categoryDropdown = page.locator(af300Data.selectors.categoryDropdown);
    this.saveBtn = page.getByRole("button", { name: af300Data.labels.btnSave, exact: true });
    this.cancelBtn = page.getByRole("button", { name: af300Data.labels.btnCancel, exact: true });
    this.deleteBtn = page.getByRole("button", { name: af300Data.labels.btnDelete, exact: true });
  }

  async goto(id) {
    await this.page.goto(af300Data.routes.giftDetail(id), {
      waitUntil: "domcontentloaded",
      timeout: af300Data.timeouts.pageLoad,
    });
  }

  async fillName(name) {
    await this.nameInput.fill(name);
  }

  async fillPrice(price) {
    await this.priceInput.fill(String(price));
  }
}

export { AF300Page as AF300GiftDetailPage };
