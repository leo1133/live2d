import { af200Data } from "../test-data/af200Data.js";

/**
 * Page Object Model cho màn hình AF200 — Gift Create (ギフト登録)
 */
export class AF200Page {
  constructor(page) {
    this.page = page;
    this.sidebarMenu = page.locator(af200Data.selectors.sidebarMenu);
    this.breadcrumb = page.locator(af200Data.selectors.breadcrumb);
    this.nameInput = page
      .getByPlaceholder(af200Data.placeholders.nameInput)
      .or(page.locator(af200Data.selectors.nameInput));
    this.iconInput = page.locator(af200Data.selectors.iconInput);
    this.contentInput = page.locator(af200Data.selectors.contentInput);
    this.sortOrderInput = page.locator(af200Data.selectors.sortOrderInput);
    this.priceInput = page
      .getByPlaceholder(af200Data.placeholders.priceInput)
      .or(page.locator(af200Data.selectors.priceInput));
    this.categoryDropdown = page.locator(af200Data.selectors.categoryDropdown);
    this.addCategoryBtn = page.locator(af200Data.selectors.addCategoryBtn);
    this.popoverCategoryNameInput = page.locator(af200Data.selectors.popoverCategoryNameInput);
    this.popoverCategorySubmitBtn = page.locator(af200Data.selectors.popoverCategorySubmitBtn);
    this.cancelBtn = page.getByRole("button", { name: af200Data.labels.btnCancel, exact: true });
    this.submitBtn = page.getByRole("button", { name: af200Data.labels.btnSubmit, exact: true });
  }

  getAnimationTypeRadio(val) {
    return this.page.locator(af200Data.selectors.animationTypeRadio(val));
  }

  getStatusRadio(val) {
    return this.page.locator(af200Data.selectors.statusRadio(val));
  }

  async goto() {
    await this.page.goto(af200Data.routes.giftCreate, {
      waitUntil: "load",
      timeout: af200Data.timeouts.pageLoad,
    });
  }

  async fillName(name) {
    await this.nameInput.fill(name);
  }

  async fillPrice(price) {
    await this.priceInput.fill(String(price));
  }

  async fillSortOrder(order) {
    await this.sortOrderInput.fill(String(order));
  }

  async fillForm(formData) {
    if (formData.name !== undefined) await this.fillName(formData.name);
    if (formData.iconPath && (await this.iconInput.count()) > 0) {
      await this.iconInput.setInputFiles(formData.iconPath);
    }
    if (formData.iconPath && (await this.contentInput.count()) > 0 && (await this.contentInput.isEnabled())) {
      await this.contentInput.setInputFiles(formData.iconPath);
    }
    if (formData.sortOrder !== undefined && (await this.sortOrderInput.count()) > 0) {
      await this.fillSortOrder(formData.sortOrder);
    }
    if (formData.price !== undefined && (await this.priceInput.count()) > 0) {
      await this.fillPrice(formData.price);
    }
    if ((await this.categoryDropdown.count()) > 0 && (await this.categoryDropdown.isEnabled())) {
      await this.categoryDropdown.click();
      const firstOption = this.page.getByRole("option").first();
      await firstOption.waitFor({ state: "visible", timeout: 10000 });
      await firstOption.click();
    }
  }

  async clickSave() {
    await this.clickSubmit();
  }

  async clickSubmit() {
    await this.submitBtn.click();
  }

  async clickCancel() {
    await this.cancelBtn.click();
  }
}

export { AF200Page as AF200GiftCreatePage };
