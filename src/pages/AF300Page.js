import { af300Data } from "../test-data/af300Data.js";

/**
 * Page Object Model cho màn hình AF300 — Gift Update / Delete
 * // [Pending Live Verification]
 */
export class AF300Page {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.breadcrumb = page.locator(af300Data.selectors.breadcrumb);
    this.nameInput = page.locator(af300Data.selectors.nameInput);
    this.coinPriceInput = page.locator(af300Data.selectors.coinPriceInput);
    this.categoryDropdown = page.locator(af300Data.selectors.categoryDropdown);
    this.sortOrderInput = page.locator(af300Data.selectors.sortOrderInput);
    this.statusToggle = page.locator(af300Data.selectors.statusToggle);
    this.iconFileInput = page.locator(af300Data.selectors.iconFileInput);
    this.animationFileInput = page.locator(af300Data.selectors.animationFileInput);
    this.animationRemoveBtn = page.locator(af300Data.selectors.animationRemoveBtn);
    this.saveButton = page.getByRole("button", { name: af300Data.labels.btnSave, exact: true });
    this.cancelButton = page.getByRole("button", { name: af300Data.labels.btnCancel, exact: true });
    this.deleteButton = page.getByRole("button", { name: af300Data.labels.btnDelete, exact: true });
    this.errorMessages = page.locator(af300Data.selectors.errorMessages);
    this.confirmModal = page.locator(af300Data.selectors.confirmModal);
    this.modalOkBtn = this.confirmModal.getByRole("button", { name: af300Data.labels.btnModalOk });
    this.modalCancelBtn = this.confirmModal.getByRole("button", { name: af300Data.labels.btnModalCancel });
    this.modalConfirmDeleteBtn = this.confirmModal.getByRole("button", { name: af300Data.labels.btnModalConfirmDelete });
    this.saveSuccessText = page.getByText(af300Data.labels.msgSaveSuccess);
    this.deleteSuccessText = page.getByText(af300Data.labels.msgDeleteSuccess);
  }

  getBreadcrumbNode(nodeText) {
    return this.breadcrumb.getByText(nodeText);
  }

  async goto(giftId) {
    await this.page.goto(af300Data.routes.giftDetail(giftId), {
      waitUntil: "domcontentloaded",
      timeout: af300Data.timeouts.pageLoad,
    });
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async clickDelete() {
    await this.deleteButton.click();
  }
}

export { AF300Page as AF300GiftDetailPage };
