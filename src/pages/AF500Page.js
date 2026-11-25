import { af500Data } from "../test-data/af500Data.js";

/**
 * Page Object Model cho màn hình AF500 — Quà cao cấp (High-Value Gift Configuration)
 * // [Pending Live Verification]
 */
export class AF500Page {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.breadcrumb = page.locator(af500Data.selectors.breadcrumb);
    this.thresholdInput = page.locator(af500Data.selectors.thresholdInput);
    this.saveButton = page.getByRole("button", { name: af500Data.labels.btnSave, exact: true });
    this.cancelButton = page.getByRole("button", { name: af500Data.labels.btnCancel, exact: true });
    this.errorMessages = page.locator(af500Data.selectors.errorMessages);
    this.unsavedModal = page.locator(af500Data.selectors.unsavedModal);
    this.modalOkBtn = this.unsavedModal.getByRole("button", { name: af500Data.labels.btnModalOk });
    this.modalCancelBtn = this.unsavedModal.getByRole("button", { name: af500Data.labels.btnModalCancel });
    this.saveSuccessText = page.getByText(af500Data.labels.msgSaveSuccess);
  }

  getHighValueToggle(index = 0) {
    return this.page.locator(af500Data.selectors.highValueToggle).nth(index);
  }

  async goto() {
    await this.page.goto(af500Data.routes.highValueConfig, {
      waitUntil: "domcontentloaded",
      timeout: af500Data.timeouts.pageLoad,
    });
  }

  async fillThreshold(value) {
    await this.thresholdInput.fill(String(value));
  }

  async clickSave() {
    await this.saveButton.click();
  }
}

export { AF500Page as AF500HighValueGiftPage };
