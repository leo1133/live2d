import { ad200Data } from "../test-data/ad200Data.js";
import { ENDPOINTS } from "../config/endpoint.js";

/**
 * Page Object Model cho màn hình AD200_Register Agency (事務所新規登録)
 * Tuân thủ Rule 05 & Ranh giới đỏ số 9:
 * - 100% Selectors tĩnh được khai báo qua biến ad200Data.selectors.* (Zero Raw Selectors inline).
 * - Các locators mang tính động được đóng gói thành các hàm tham số hóa (Parameterized Locators).
 * - Tuyệt đối không chứa câu lệnh expect() kiểm tra kết quả bên trong class này.
 */
export class AD200Page {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // 1. Navigation & Breadcrumbs (Tham chiếu qua ad200Data.selectors)
    this.breadcrumb = page
      .locator(ad200Data.selectors.breadcrumb)
      .or(page.getByText(ad200Data.labels.breadcrumbs));
    this.breadcrumbLink = page.getByText(ad200Data.labels.sidebarMenu);
    this.pageTitle = page
      .getByRole("heading", { name: ad200Data.labels.pageTitle })
      .or(page.locator(ad200Data.selectors.pageHeading).filter({ hasText: ad200Data.labels.pageTitle }));

    // 2. Form Input Fields (Tham chiếu qua ad200Data.selectors)
    this.nameInput = page
      .getByPlaceholder(ad200Data.placeholders.name)
      .or(page.locator(ad200Data.selectors.nameInput));

    this.codeInput = page
      .getByPlaceholder(ad200Data.placeholders.code)
      .or(page.locator(ad200Data.selectors.codeInput));

    this.codeHint = page
      .locator(ad200Data.selectors.codeHint)
      .or(page.getByText(ad200Data.hints.codeKeyword));

    this.contactNameInput = page
      .getByPlaceholder(ad200Data.placeholders.contactName)
      .or(page.locator(ad200Data.selectors.contactNameInput));

    this.contactPhoneInput = page
      .getByPlaceholder(ad200Data.placeholders.contactPhone)
      .or(page.locator(ad200Data.selectors.contactPhoneInput));

    this.contactEmailInput = page
      .getByPlaceholder(ad200Data.placeholders.contactEmail)
      .or(page.locator(ad200Data.selectors.contactEmailInput));

    // 3. Logo Upload Controls (Tham chiếu qua ad200Data.selectors)
    this.logoFileInput = page.locator(ad200Data.selectors.logoFileInput);
    this.selectLogoButton = page
      .getByRole("button", { name: ad200Data.labels.btnSelectImage })
      .or(page.locator(ad200Data.selectors.selectLogoButton));
    this.logoPreview = page.locator(ad200Data.selectors.logoPreview);
    this.removeLogoButton = page.locator(ad200Data.selectors.removeLogoButton);

    // 4. Action Buttons
    this.submitButton = page.getByRole("button", {
      name: ad200Data.labels.btnSubmit,
      exact: true,
    });
    this.cancelButton = page.getByRole("button", {
      name: ad200Data.labels.btnCancel,
      exact: true,
    });

    // 5. Modal Xóa/Hủy bỏ (MSG67)
    this.cancelModal = page
      .locator(ad200Data.selectors.cancelModal)
      .filter({ hasText: ad200Data.messages.cancelConfirm });
    this.cancelModalDiscardBtn = this.cancelModal.getByRole("button", {
      name: ad200Data.labels.btnDiscard,
    });
    this.cancelModalCancelBtn = this.cancelModal.getByRole("button", {
      name: ad200Data.labels.btnCancel,
    });

    // 6. Error & Feedback Messages (Tham chiếu qua ad200Data.selectors)
    this.nameError = page.locator(ad200Data.selectors.nameError);
    this.codeError = page.locator(ad200Data.selectors.codeError);
    this.contactNameError = page.locator(ad200Data.selectors.contactNameError);
    this.contactPhoneError = page.locator(ad200Data.selectors.contactPhoneError);
    this.contactEmailError = page.locator(ad200Data.selectors.contactEmailError);
    this.toastNotification = page.locator(ad200Data.selectors.toastNotification);
  }

  // Parameterized Locators
  getSidebarMenu(menuName = ad200Data.labels.sidebarMenu) {
    return this.page.getByRole("button", { name: menuName });
  }

  getSidebarSubmenu(submenuName = ad200Data.labels.sidebarSubmenu) {
    return this.page.getByRole("link", { name: submenuName });
  }

  /**
   * Điều hướng trực tiếp đến màn hình AD200
   */
  async goto(queryParams = {}) {
    const url = `${ad200Data.routes.create}${ad200Data.routes.buildQuery(queryParams)}`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  /**
   * Điền dữ liệu toàn bộ form tạo Agency
   */
  async fillForm({
    name,
    code,
    contactName,
    contactPhone,
    contactEmail,
  } = {}) {
    if (name !== undefined) await this.nameInput.fill(name);
    if (code !== undefined) await this.codeInput.fill(code);
    if (contactName !== undefined) await this.contactNameInput.fill(contactName);
    if (contactPhone !== undefined) await this.contactPhoneInput.fill(contactPhone);
    if (contactEmail !== undefined) await this.contactEmailInput.fill(contactEmail);
  }

  /**
   * Upload logo cho Agency
   * @param {string} filePath Đường dẫn tuyệt đối của ảnh
   */
  async uploadLogo(filePath) {
    await this.logoFileInput.setInputFiles(filePath);
  }

  /**
   * Bấm nút xóa logo
   */
  async removeLogo() {
    await this.removeLogoButton.click();
  }

  /**
   * Bấm nút Đăng ký (登録)
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Bấm nút Hủy (キャンセル) và tùy chọn xác nhận bỏ dữ liệu
   */
  async cancel(confirmDiscard = false) {
    await this.cancelButton.click();
    if (confirmDiscard) {
      const isModalVisible = await this.cancelModal.isVisible().catch(() => false);
      if (isModalVisible) {
        await this.cancelModalDiscardBtn.click();
      }
    }
  }

  /**
   * Lấy thông báo lỗi hiển thị dưới trường chỉ định
   */
  async getFieldError(fieldLocator) {
    if (await fieldLocator.isVisible()) {
      return (await fieldLocator.textContent())?.trim();
    }
    return null;
  }
}

export { AD200Page as AD200AgencyCreatePage };
