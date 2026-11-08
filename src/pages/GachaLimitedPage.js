import { gachaLimitedData } from "../test-data/gachaLimitedData.js";
import { gachaData } from "../test-data/gachaData.js";

export class GachaLimitedPage {
  constructor(page) {
    this.page = page;

    // Tiêu đề trang
    this.pageHeading = page.getByRole("heading", {
      name: gachaLimitedData.headings.limitedGachaRegex,
    });
    this.avatarListHeading = page.getByRole("heading", {
      name: gachaLimitedData.headings.avatarList,
    });

    // Phần Cấu hình Banner
    this.bannerTitle = page.getByText(gachaLimitedData.banner.titleText);
    this.bannerUploadButton = page.getByRole("button", {
      name: gachaLimitedData.banner.uploadButtonText,
    });
    this.bannerFileInput = page.locator(gachaLimitedData.banner.fileInput);

    // Các trường thiết lập bảo hiểm (Pity / Ceiling)
    this.hardPityInput = page.getByRole("textbox", {
      name: gachaLimitedData.pitySettings.hardPityLabel,
      exact: true,
    });
    this.softPityInput = page.getByRole("textbox", {
      name: gachaLimitedData.pitySettings.softPityLabel,
      exact: true,
    });
    this.giftHardPityInput = page.getByRole("textbox", {
      name: gachaLimitedData.pitySettings.giftHardPityLabel,
    });
    this.giftSoftPityInput = page.getByRole("textbox", {
      name: gachaLimitedData.pitySettings.giftSoftPityLabel,
    });
    this.saveButton = page.getByRole("button", {
      name: gachaLimitedData.pitySettings.saveButtonText,
    });

    // Modal đăng ký mới Item
    this.newItemButton = page.getByRole("button", {
      name: gachaLimitedData.itemRegistration.newItemButtonText,
    });
    this.modalCancelButton = page.getByRole("button", {
      name: gachaLimitedData.itemRegistration.cancelButtonText,
    });

    // Bảng Item trong Gacha
    this.dataTable = page.getByRole("table");
    this.tableRows = this.dataTable.locator("tbody tr");
    this.colId = page.getByText(gachaLimitedData.table.columns.id, {
      exact: true,
    });
    this.colCategory = page.getByText(gachaLimitedData.table.columns.category);
    this.colItemName = page.getByText(gachaLimitedData.table.columns.itemName);
    this.colItemImage = page.getByText(
      gachaLimitedData.table.columns.itemImage,
    );
    this.colType = page.getByText(gachaLimitedData.table.columns.type);
    this.colSecret = page.getByText(gachaLimitedData.table.columns.secret);

    // Popup xem ảnh & chỉnh sửa item
    this.closePreviewButton = page.getByRole("button", {
      name: gachaLimitedData.table.closeButtonText,
    });
    this.colorChangeTab = page.getByRole("tab", {
      name: gachaLimitedData.table.colorTabTitle,
    });

    // Phân trang
    this.paginationSummary = page.getByText(
      gachaLimitedData.pagination.summaryRegex,
    );
    this.paginationPrev = page.getByRole("listitem").filter({
      hasText: gachaLimitedData.pagination.prevPageText,
    });
    this.paginationNext = page.getByRole("listitem").filter({
      hasText: gachaLimitedData.pagination.nextPageText,
    });
    this.paginationJump = page.getByRole("button", {
      name: gachaLimitedData.pagination.jumpPageText,
    });
  }

  /**
   * Điều hướng từ danh sách Avatar vào trang Gacha có hạn của Avatar đầu tiên có sẵn link edit
   */
  async navigateToFirstAvailableLimitedGacha() {
    // Nếu đã ở đúng màn hình Gacha có hạn thì giữ nguyên
    if (await this.pageHeading.isVisible().catch(() => false)) {
      return;
    }

    // Điều hướng tới danh sách avatar
    if (!this.page.url().includes(gachaData.url)) {
      await this.page.goto(gachaData.url, { waitUntil: "domcontentloaded" });
    }

    const editLinks = this.page.getByRole("link", {
      name: gachaLimitedData.links.editLimitedRegex,
    });
    await editLinks
      .first()
      .waitFor({
        state: "visible",
        timeout: gachaLimitedData.timeouts.pageLoad,
      });
    const href = await editLinks.first().getAttribute("href");
    if (href) {
      await this.page.goto(href, { waitUntil: "domcontentloaded" });
    } else {
      await editLinks.first().click();
    }
    await this.pageHeading.waitFor({
      state: "visible",
      timeout: gachaLimitedData.timeouts.pageLoad,
    });
  }

  /**
   * Nhập các thông số bảo hiểm Pity
   */
  async fillPitySettings({
    hardPity,
    softPity,
    giftHardPity,
    giftSoftPity,
  } = {}) {
    if (hardPity !== undefined) {
      await this.hardPityInput.fill(String(hardPity));
    }
    if (softPity !== undefined) {
      await this.softPityInput.fill(String(softPity));
    }
    if (giftHardPity !== undefined) {
      await this.giftHardPityInput.fill(String(giftHardPity));
    }
    if (giftSoftPity !== undefined) {
      await this.giftSoftPityInput.fill(String(giftSoftPity));
    }
  }

  /**
   * Lấy nút Preview hình ảnh của một Item theo tên
   */
  getItemPreviewButton(itemName) {
    const previewSuffix = gachaLimitedData.table.actionRegex.preview.source
      .replace("^", "")
      .replace("$", "");
    return this.page.getByRole("button", {
      name: new RegExp(`${itemName}.*${previewSuffix}`),
    });
  }

  /**
   * Lấy nút Chỉnh sửa của một Item theo tên
   */
  getItemEditButton(itemName) {
    const editSuffix = gachaLimitedData.table.actionRegex.edit.source
      .replace("^", "")
      .replace("$", "");
    return this.page.getByRole("button", {
      name: new RegExp(`${itemName}.*${editSuffix}`),
    });
  }

  /**
   * Lấy nút Xóa của một Item theo tên
   */
  getItemDeleteButton(itemName) {
    const deleteSuffix = gachaLimitedData.table.actionRegex.delete.source
      .replace("^", "")
      .replace("$", "");
    return this.page.getByRole("button", {
      name: new RegExp(`${itemName}.*${deleteSuffix}`),
    });
  }
}
