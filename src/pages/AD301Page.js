import { ad301Data } from "../test-data/ad301Data.js";
import { ENDPOINTS } from "../config/endpoint.js";

/**
 * Page Object Model cho màn hình AD301_Agency Information (事務所詳細_詳細)
 * Tuân thủ Rule 05 & Ranh giới đỏ số 9:
 * - 100% Selectors tĩnh được khai báo qua biến ad301Data.selectors.* (Zero Raw Selectors inline).
 * - Các locators mang tính động được đóng gói thành các hàm tham số hóa (Parameterized Locators).
 * - Tuyệt đối không chứa câu lệnh expect() kiểm tra kết quả bên trong class này.
 */
export class AD301Page {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // 1. Navigation & Breadcrumbs (Tham chiếu qua ad301Data.selectors)
    this.breadcrumb = page
      .locator(ad301Data.selectors.breadcrumb)
      .or(page.getByText(ad301Data.labels.breadcrumbs));
    this.breadcrumbLink = page.getByText(ad301Data.labels.sidebarMenu);
    this.pageTitle = page
      .getByRole("heading", { name: ad301Data.labels.pageTitle })
      .or(page.locator(ad301Data.selectors.pageHeading).filter({ hasText: ad301Data.labels.pageTitle }));

    // 2. Tabs Navigation (CMR20, CMR40)
    this.tabDetail = page.getByRole("tab", { name: ad301Data.labels.tabDetail }).or(page.locator(ad301Data.selectors.tabDetail));
    this.tabLiverList = page.getByRole("tab", { name: ad301Data.labels.tabLiverList }).or(page.locator(ad301Data.selectors.tabLiverList));
    this.tabRevenue = page.getByRole("tab", { name: ad301Data.labels.tabRevenue }).or(page.locator(ad301Data.selectors.tabRevenue));

    // 3. Form Input Fields (Tham chiếu qua ad301Data.selectors)
    this.nameInput = page
      .getByPlaceholder(ad301Data.placeholders.name)
      .or(page.locator(ad301Data.selectors.nameInput));

    this.codeInput = page
      .getByPlaceholder(ad301Data.placeholders.code)
      .or(page.locator(ad301Data.selectors.codeInput));

    this.contactNameInput = page
      .getByPlaceholder(ad301Data.placeholders.contactName)
      .or(page.locator(ad301Data.selectors.contactNameInput));

    this.contactPhoneInput = page
      .getByPlaceholder(ad301Data.placeholders.contactPhone)
      .or(page.locator(ad301Data.selectors.contactPhoneInput));

    this.contactEmailInput = page
      .getByPlaceholder(ad301Data.placeholders.contactEmail)
      .or(page.locator(ad301Data.selectors.contactEmailInput));

    // 4. Logo Controls (Tham chiếu qua ad301Data.selectors)
    this.logoFileInput = page.locator(ad301Data.selectors.logoFileInput);
    this.selectLogoButton = page
      .getByRole("button", { name: ad301Data.labels.btnSelectImage })
      .or(page.locator(ad301Data.selectors.selectLogoButton));
    this.logoPreview = page.locator(ad301Data.selectors.logoPreview);

    // 5. Status Controls & Modal MSG65 (Tham chiếu qua ad301Data.selectors)
    this.statusDropdown = page
      .getByRole("combobox", { name: ad301Data.labels.statusLabel })
      .or(page.locator(ad301Data.selectors.statusDropdown));
    this.statusConfirmModal = page
      .locator(ad301Data.selectors.statusConfirmModal)
      .filter({ hasText: ad301Data.messages.statusChangeConfirm });
    this.statusConfirmBtn = this.statusConfirmModal.getByRole("button", {
      name: ad301Data.labels.modalConfirmStatus,
    });
    this.statusCancelBtn = this.statusConfirmModal.getByRole("button", {
      name: ad301Data.labels.modalCancel,
    });

    // 6. Action Buttons
    this.saveButton = page.getByRole("button", {
      name: ad301Data.labels.btnSave,
      exact: true,
    });
    this.deleteButton = page.getByRole("button", {
      name: ad301Data.labels.btnDelete,
      exact: true,
    });
    this.changePasswordButton = page.getByRole("button", {
      name: ad301Data.labels.btnChangePassword,
    });

    // 7. Modal Xóa Agency MSG66 (Tham chiếu qua ad301Data.selectors)
    this.deleteConfirmModal = page
      .locator(ad301Data.selectors.deleteConfirmModal)
      .filter({ hasText: ad301Data.messages.deleteConfirm });
    this.deleteConfirmBtn = this.deleteConfirmModal.getByRole("button", {
      name: ad301Data.labels.modalConfirmDelete,
    });
    this.deleteCancelBtn = this.deleteConfirmModal.getByRole("button", {
      name: ad301Data.labels.modalCancel,
    });

    // 8. Error & Toast Feedback (Tham chiếu qua ad301Data.selectors)
    this.nameError = page.locator(ad301Data.selectors.nameError);
    this.codeError = page.locator(ad301Data.selectors.codeError);
    this.contactNameError = page.locator(ad301Data.selectors.contactNameError);
    this.contactPhoneError = page.locator(ad301Data.selectors.contactPhoneError);
    this.contactEmailError = page.locator(ad301Data.selectors.contactEmailError);
    this.toastNotification = page.locator(ad301Data.selectors.toastNotification);
  }

  // Parameterized Locators
  getSidebarMenu(menuName = ad301Data.labels.sidebarMenu) {
    return this.page.getByRole("button", { name: menuName });
  }

  getSidebarSubmenu(submenuName) {
    return this.page.getByRole("link", { name: submenuName });
  }

  getTab(tabName) {
    return this.page.getByRole("tab", { name: tabName });
  }

  /**
   * Điều hướng trực tiếp đến màn hình chi tiết Agency AD301
   * @param {number|string} agencyId ID của Agency
   * @param {Object} queryParams Tham số URL động
   */
  async goto(agencyId = ad301Data.sampleData.agencyId, queryParams = {}) {
    const url = `${ad301Data.routes.detail(agencyId)}${ad301Data.routes.buildQuery(queryParams)}`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  /**
   * Chuyển tab trong phân hệ chi tiết Agency
   * @param {'detail'|'liver'|'revenue'} tabName
   */
  async switchTab(tabName) {
    switch (tabName) {
      case "liver":
        await this.tabLiverList.click();
        break;
      case "revenue":
        await this.tabRevenue.click();
        break;
      default:
        await this.tabDetail.click();
    }
  }

  /**
   * Cập nhật thông tin trên form
   */
  async fillInformation({
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
   * Bấm nút Lưu (保存)
   */
  async save() {
    await this.saveButton.click();
  }

  /**
   * Đổi trạng thái Agency và tùy chọn xác nhận modal
   */
  async setStatus(statusValue, confirm = true) {
    await this.statusDropdown.selectOption(String(statusValue));
    if (confirm) {
      const isVisible = await this.statusConfirmModal.isVisible().catch(() => false);
      if (isVisible) {
        await this.statusConfirmBtn.click();
      }
    }
  }

  /**
   * Bấm xóa Agency và tùy chọn xác nhận modal MSG66
   */
  async deleteAgency(confirm = false) {
    await this.deleteButton.click();
    if (confirm) {
      const isVisible = await this.deleteConfirmModal.isVisible().catch(() => false);
      if (isVisible) {
        await this.deleteConfirmBtn.click();
      }
    }
  }
}

export { AD301Page as AD301AgencyDetailPage };
