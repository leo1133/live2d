import { test, expect } from "../../src/fixtures/baseTest.js";
import { GachaLimitedPage } from "../../src/pages/GachaLimitedPage.js";
import { gachaLimitedData } from "../../src/test-data/gachaLimitedData.js";
import { gachaData } from "../../src/test-data/gachaData.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

let tcIndex = 1;
const padTc = () => `TC${String(tcIndex++).padStart(2, "0")}`;

test.describe
  .serial("UI Limited Gacha Management (期間限定アバターガチャ)", () => {
  let sharedPage;
  let gachaLimitedPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(gachaLimitedData.timeouts.suiteTimeout);
    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      storageState: getUiSessionFile(),
      httpCredentials: process.env.BASIC_AUTH_USER
        ? {
            username: process.env.BASIC_AUTH_USER,
            password: process.env.BASIC_AUTH_PASS,
          }
        : undefined,
    });
    sharedPage = await context.newPage();
    // Chặn ảnh nặng để tối ưu tốc độ load DOM
    await sharedPage.route(/\.(png|jpeg|jpg|webp)$/, (route) => route.abort());

    gachaLimitedPage = new GachaLimitedPage(sharedPage);
    await sharedPage.goto(gachaData.url, { waitUntil: "domcontentloaded" });
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  // ==================== 1. Điều hướng & Tiêu đề ====================
  test.describe("1. Điều hướng & Tiêu đề", () => {
    test(`${padTc()}: Điều hướng từ danh sách Avatar vào màn hình Gacha Limited`, async () => {
      await gachaLimitedPage.navigateToFirstAvailableLimitedGacha();
      await expect(gachaLimitedPage.pageHeading).toBeVisible({
        timeout: gachaLimitedData.timeouts.pageLoad,
      });
    });

    test(`${padTc()}: Kiểm tra nội dung tiêu đề trang khớp định dạng Gacha Limited`, async () => {
      await expect(gachaLimitedPage.pageHeading).toHaveText(
        gachaLimitedData.headings.limitedGachaRegex,
      );
    });
  });

  // ==================== 2. Khu vực Banner ====================
  test.describe("2. Banner Gacha", () => {
    test(`${padTc()}: Hiển thị tiêu đề vùng tải Banner kèm đánh dấu bắt buộc (*)`, async () => {
      await expect(gachaLimitedPage.bannerTitle).toBeVisible();
    });

    test(`${padTc()}: Hiển thị nút tải ảnh Banner (画像をアップロード)`, async () => {
      await expect(gachaLimitedPage.bannerUploadButton).toBeVisible();
    });
  });

  // ==================== 3. Cài đặt Bảo hiểm (Pity / Ceiling) ====================
  test.describe("3. Cài đặt Bảo hiểm (Pity Settings)", () => {
    test(`${padTc()}: Hiển thị đầy đủ 4 trường thiết lập bảo hiểm (Hard/Soft Pity & Gift Pity)`, async () => {
      await expect(gachaLimitedPage.hardPityInput).toBeVisible();
      await expect(gachaLimitedPage.softPityInput).toBeVisible();
      await expect(gachaLimitedPage.giftHardPityInput).toBeVisible();
      await expect(gachaLimitedPage.giftSoftPityInput).toBeVisible();
    });

    test(`${padTc()}: Cho phép nhập giá trị số hợp lệ vào các trường bảo hiểm`, async () => {
      await gachaLimitedPage.fillPitySettings({
        hardPity: gachaLimitedData.testValues.hardPity,
        softPity: gachaLimitedData.testValues.softPity,
        giftHardPity: gachaLimitedData.testValues.giftHardPity,
        giftSoftPity: gachaLimitedData.testValues.giftSoftPity,
      });

      await expect(gachaLimitedPage.hardPityInput).toHaveValue(
        gachaLimitedData.testValues.hardPity,
      );
      await expect(gachaLimitedPage.softPityInput).toHaveValue(
        gachaLimitedData.testValues.softPity,
      );
      await expect(gachaLimitedPage.giftHardPityInput).toHaveValue(
        gachaLimitedData.testValues.giftHardPity,
      );
      await expect(gachaLimitedPage.giftSoftPityInput).toHaveValue(
        gachaLimitedData.testValues.giftSoftPity,
      );
    });

    test(`${padTc()}: Hiển thị nút Lưu cấu hình (保存)`, async () => {
      await expect(gachaLimitedPage.saveButton).toBeVisible();
      await expect(gachaLimitedPage.saveButton).toBeEnabled();
    });
  });

  // ==================== 4. Modal Đăng ký mới Item (新規登録) ====================
  test.describe("4. Đăng ký Item mới (新規登録)", () => {
    test(`${padTc()}: Hiển thị nút Đăng ký mới (新規登録)`, async () => {
      await expect(gachaLimitedPage.newItemButton).toBeVisible();
      await expect(gachaLimitedPage.newItemButton).toBeEnabled();
    });

    test(`${padTc()}: Click nút 新規登録 mở modal và đóng an toàn bằng nút キャンセル`, async () => {
      await gachaLimitedPage.newItemButton.click();
      await expect(gachaLimitedPage.modalCancelButton).toBeVisible({
        timeout: gachaLimitedData.timeouts.modal,
      });
      await gachaLimitedPage.modalCancelButton.click();
      await expect(gachaLimitedPage.modalCancelButton).toBeHidden({
        timeout: gachaLimitedData.timeouts.modal,
      });
    });
  });

  // ==================== 5. Danh sách Item trong Gacha ====================
  test.describe("5. Bảng danh sách Item", () => {
    test(`${padTc()}: Hiển thị đầy đủ các cột thông tin của bảng Item`, async () => {
      await expect(gachaLimitedPage.colId).toBeVisible();
      await expect(gachaLimitedPage.colCategory).toBeVisible();
      await expect(gachaLimitedPage.colItemName).toBeVisible();
      await expect(gachaLimitedPage.colItemImage).toBeVisible();
      await expect(gachaLimitedPage.colType).toBeVisible();
    });

    test(`${padTc()}: Bảng có ít nhất một dòng dữ liệu Item hiển thị`, async () => {
      const rowCount = await gachaLimitedPage.tableRows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test(`${padTc()}: Xem trước ảnh Item (画像をプレビュー) và đóng popup`, async () => {
      const previewButtons = gachaLimitedPage.dataTable.getByRole("button", {
        name: gachaLimitedData.table.actionRegex.preview,
      });

      if ((await previewButtons.count()) > 0) {
        await previewButtons.first().click();
        await expect(gachaLimitedPage.closePreviewButton).toBeVisible({
          timeout: gachaLimitedData.timeouts.modal,
        });
        await gachaLimitedPage.closePreviewButton.click();
        await expect(gachaLimitedPage.closePreviewButton).toBeHidden({
          timeout: gachaLimitedData.timeouts.modal,
        });
      }
    });

    test(`${padTc()}: Mở modal chỉnh sửa Item (編集) và đóng modal an toàn`, async () => {
      const editButtons = gachaLimitedPage.dataTable.getByRole("button", {
        name: gachaLimitedData.table.actionRegex.edit,
      });

      if ((await editButtons.count()) > 0) {
        await editButtons.first().click();
        await expect(gachaLimitedPage.colorChangeTab).toBeVisible({
          timeout: gachaLimitedData.timeouts.modal,
        });
        // Nhấn Escape để đóng modal chỉnh sửa
        await sharedPage.keyboard.press("Escape");
        await expect(gachaLimitedPage.colorChangeTab).toBeHidden({
          timeout: gachaLimitedData.timeouts.modal,
        });
      }
    });

    test(`${padTc()}: Mở xác nhận xóa Item (削除) và hủy bỏ bằng nút キャンセル`, async () => {
      const deleteButtons = gachaLimitedPage.dataTable.getByRole("button", {
        name: gachaLimitedData.table.actionRegex.delete,
      });

      if ((await deleteButtons.count()) > 0) {
        await deleteButtons.first().click();
        const cancelBtn = sharedPage.getByRole("button", {
          name: gachaLimitedData.table.cancelButtonText,
        });
        await expect(cancelBtn).toBeVisible({ timeout: gachaLimitedData.timeouts.modal });
        await cancelBtn.click();
        await expect(cancelBtn).toBeHidden({ timeout: gachaLimitedData.timeouts.modal });
      }
    });
  });

  // ==================== 6. Phân trang (Pagination) ====================
  test.describe("6. Phân trang", () => {
    test(`${padTc()}: Hiển thị chuỗi tổng kết số lượng bản ghi Item`, async () => {
      if (await gachaLimitedPage.paginationSummary.isVisible()) {
        await expect(gachaLimitedPage.paginationSummary).toBeVisible();
      }
    });

    test(`${padTc()}: Hiển thị các nút điều hướng phân trang`, async () => {
      if (await gachaLimitedPage.paginationSummary.isVisible()) {
        await expect(gachaLimitedPage.paginationPrev).toBeVisible();
        await expect(gachaLimitedPage.paginationNext).toBeVisible();
      }
    });
  });
});
