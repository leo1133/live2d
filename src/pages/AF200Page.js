import { af200Data } from "../test-data/af200Data.js";

/**
 * Page Object Model cho màn hình AF200 — Gift Create
 * // [Pending Live Verification]
 */
export class AF200Page {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.breadcrumb = page.locator(af200Data.selectors.breadcrumb);
    this.nameInput = page.locator(af200Data.selectors.nameInput);
    this.coinPriceInput = page.locator(af200Data.selectors.coinPriceInput);
    this.categoryDropdown = page.locator(af200Data.selectors.categoryDropdown);
    this.sortOrderInput = page.locator(af200Data.selectors.sortOrderInput);
    this.statusToggle = page.locator(af200Data.selectors.statusToggle);
    this.iconFileInput = page.locator(af200Data.selectors.iconFileInput);
    this.iconDropZone = page.locator(af200Data.selectors.iconDropZone);
    this.iconPreview = page.locator(af200Data.selectors.iconPreview);
    this.iconRemoveBtn = page.locator(af200Data.selectors.iconRemoveBtn);
    this.animationFileInput = page.locator(af200Data.selectors.animationFileInput);
    this.animationRemoveBtn = page.locator(af200Data.selectors.animationRemoveBtn);
    this.saveButton = page.getByRole("button", { name: af200Data.labels.btnSave, exact: true });
    this.cancelButton = page.getByRole("button", { name: af200Data.labels.btnCancel, exact: true });
    this.errorMessages = page.locator(af200Data.selectors.errorMessages);
    this.unsavedModal = page.locator(af200Data.selectors.unsavedModal);
    this.modalOkBtn = this.unsavedModal.getByRole("button", { name: af200Data.labels.btnModalOk });
    this.modalCancelBtn = this.unsavedModal.getByRole("button", { name: af200Data.labels.btnModalCancel });
    this.successMessage = page.getByText(af200Data.labels.msgSaveSuccess);
  }

  getBreadcrumbNode(nodeText) {
    return this.breadcrumb.getByText(nodeText);
  }

  async goto() {
    await this.page.goto(af200Data.routes.giftCreate, { waitUntil: "domcontentloaded", timeout: af200Data.timeouts.pageLoad });
  }

  async fillForm({ name, coin_price, category_id, sort_order }) {
    if (name !== undefined) await this.nameInput.fill(name);
    if (coin_price !== undefined) await this.coinPriceInput.fill(String(coin_price));
    if (category_id !== undefined) await this.categoryDropdown.selectOption(String(category_id));
    if (sort_order !== undefined) await this.sortOrderInput.fill(String(sort_order));
  }

  async uploadIcon(filePath) {
    await this.iconFileInput.setInputFiles(filePath);
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }
}

export { AF200Page as AF200GiftCreatePage };
