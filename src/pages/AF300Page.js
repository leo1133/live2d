import { af300Data } from "../test-data/af300Data.js";

/**
 * Page Object Model cho màn hình AF300 — Gift Update / Delete (ギフト更新・削除)
 * Tuân thủ Rule 05 & Ranh giới đỏ số 9: Zero-hardcoded selectors & parameterized locators
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

    // Modal xác nhận xóa CMMSG28 (本当に進みますか？)
    this.deleteConfirmModal = page
      .locator(af300Data.selectors.deleteConfirmModal)
      .filter({ hasText: /進みますか|削除/ });
    this.deleteConfirmBtn = this.deleteConfirmModal
      .getByRole("button", { name: af300Data.labels.btnDeleteConfirm, exact: true })
      .or(this.deleteConfirmModal.locator("button").filter({ hasText: af300Data.labels.btnDeleteConfirm }));
    this.deleteCancelBtn = this.deleteConfirmModal
      .getByRole("button", { name: af300Data.labels.btnDeleteCancel, exact: true })
      .or(this.deleteConfirmModal.locator("button").filter({ hasText: af300Data.labels.btnDeleteCancel }));
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

  async clickSave() {
    await this.saveBtn.click();
  }

  async save() {
    await this.clickSave();
  }

  async clickDelete() {
    await this.deleteBtn.click();
  }

  /**
   * Thao tác xóa quà tặng và tùy chọn xác nhận modal xóa CMMSG28
   * @param {boolean} confirm true nếu muốn click xác nhận xóa trên modal
   */
  async deleteGift(confirm = false) {
    await this.deleteBtn.click();
    if (confirm) {
      await this.deleteConfirmModal.waitFor({ state: "visible", timeout: af300Data.timeouts.modal });
      await this.deleteConfirmBtn.click();
    }
  }

  /**
   * Hủy thao tác xóa trên modal xác nhận
   */
  async cancelDelete() {
    await this.deleteCancelBtn.click();
  }
}

export { AF300Page as AF300GiftDetailPage };
