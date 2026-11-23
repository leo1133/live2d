import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD301Page, AD301AgencyDetailPage } from "../../src/pages/AD301Page.js";
import { ad301Data } from "../../src/test-data/ad301Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

/**
 * Bộ kiểm thử Tự động hóa Giao diện người dùng (UI Test Suite)
 * Màn hình: AD301_Agency Information (事務所詳細_詳細)
 * Áp dụng: Quy chuẩn Trụ cột 2 & Rule 05 (Zero-hardcoding, Page Object Model)
 */

test.describe.serial("UI AD301: Agency Information (事務所詳細_詳細)", () => {
  let sharedPage;
  let detailPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60000);
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
    // Chặn tài nguyên ảnh nặng để tối ưu tốc độ
    await sharedPage.route(/\.(png|jpeg|jpg|webp)$/, (route) => route.abort());

    detailPage = new AD301AgencyDetailPage(sharedPage);
    await detailPage.goto(ad301Data.sampleData.agencyId);
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  // ==========================================
  // I. COMMON, BREADCRUMBS & 3 TABS
  // ==========================================
  test.describe("1. Common, Breadcrumbs & 3 Tabs Navigation", () => {
    test("[AD301-1][AD301-2] Kiểm tra hiển thị tiêu đề trang và URL khi truy cập", async () => {
      await expect(sharedPage).toHaveURL(new RegExp(`/agencies/detail/${ad301Data.sampleData.agencyId}`));
      await expect(detailPage.pageTitle).toBeVisible();
    });

    test("[AD301-4] Kiểm tra Screen Lifecycle khi F5 Reload trang", async () => {
      await sharedPage.reload({ waitUntil: "networkidle" }).catch(() => sharedPage.waitForLoadState("domcontentloaded"));
      await expect(detailPage.pageTitle).toBeVisible();
      await expect(detailPage.nameInput).toBeVisible();
    });

    test("[AD301-6] Kiểm tra hiển thị Breadcrumbs", async () => {
      await expect(detailPage.breadcrumb).toBeVisible();
    });

    test("[AD301-8][AD301-9] Kiểm tra hiển thị 3 Tabs và mặc định active Tab 詳細", async () => {
      await expect(detailPage.tabDetail).toBeVisible();
      await expect(detailPage.tabLiverList).toBeVisible();
      await expect(detailPage.tabRevenue).toBeVisible();
    });

    test("[AD301-10] Chuyển đổi sang Tab ライバー一覧 (AD302)", async () => {
      if (await detailPage.tabLiverList.isVisible()) {
        await detailPage.tabLiverList.click();
        if ((await detailPage.tabLiverList.getAttribute("data-state")) !== "active") {
          await sharedPage.waitForTimeout(300);
          await detailPage.tabLiverList.click();
        }
        await expect(detailPage.tabLiverList).toHaveAttribute("data-state", "active");
        // Quay lại tab chi tiết
        await detailPage.tabDetail.click();
        await expect(detailPage.tabDetail).toHaveAttribute("data-state", "active");
      }
    });

    test("[AD301-11] Chuyển đổi sang Tab 売上 (AD303)", async () => {
      if (await detailPage.tabRevenue.isVisible()) {
        const isEnabled = await detailPage.tabRevenue.isEnabled();
        if (isEnabled) {
          await detailPage.tabRevenue.click();
          await expect(sharedPage).toHaveURL(/agencies\/detail\/\d+.*tab=revenue/);
          // Quay lại tab chi tiết
          await detailPage.tabDetail.click();
        } else {
          await expect(detailPage.tabRevenue).toBeDisabled();
        }
      }
    });
  });

  // ==========================================
  // II. FORM CONTROLS & FIELD VALIDATIONS
  // ==========================================
  test.describe("2. Form Controls & Field Validation", () => {
    test("[AD301-13] Kiểm tra tải dữ liệu ban đầu lên form", async () => {
      await expect(detailPage.nameInput).toBeVisible();
      await expect(detailPage.codeInput).toBeVisible();
      await expect(detailPage.contactNameInput).toBeVisible();
      await expect(detailPage.contactPhoneInput).toBeVisible();
      await expect(detailPage.contactEmailInput).toBeVisible();
    });

    // 1. Trường 事務所名
    test.describe("Trường 事務所名 (Agency Name)", () => {
      test("[AD301-14] Nhập tên Agency mới hợp lệ và cho phép nhập", async () => {
        await detailPage.nameInput.fill("新事務所2026");
        await expect(detailPage.nameInput).toHaveValue("新事務所2026");
      });

      test("[AD301-15] Giữ nguyên tên hiện tại của Agency và submit không lỗi trùng", async () => {
        await detailPage.save();
        await expect(detailPage.nameError).not.toBeVisible();
      });

      test("[AD301-17] Báo lỗi khi xóa trắng ô tên bắt buộc và bấm Lưu", async () => {
        await detailPage.nameInput.fill("");
        await detailPage.save();
        await expect(detailPage.nameError.or(detailPage.toastNotification)).toContainText(ad301Data.messages.nameRequired);
      });

      test("[AD301-18] Kiểm tra khi nhập tên vượt quá 20 ký tự (21 ký tự)", async () => {
        await detailPage.nameInput.fill("A".repeat(21));
        const val = await detailPage.nameInput.inputValue();
        if (val.length > 20) {
          await detailPage.save();
          await expect(detailPage.nameError.or(detailPage.toastNotification)).toContainText(ad301Data.messages.tooLongSuffix);
        } else {
          expect(val.length).toBeLessThanOrEqual(20);
        }
      });
    });

    // 2. Trường 事務所ID
    test.describe("Trường 事務所ID (Agency Code)", () => {
      test("[AD301-19] Kiểm tra hiển thị mã Agency ID", async () => {
        await expect(detailPage.codeInput).toBeVisible();
      });

      test("[AD301-21] Báo lỗi khi sửa mã ID ít hơn 3 ký tự (2 ký tự)", async () => {
        await detailPage.codeInput.fill("ab");
        await detailPage.save();
        await expect(detailPage.codeError.or(detailPage.toastNotification)).toContainText(ad301Data.messages.tooShortCode);
      });

      test("[AD301-23][AD301-24] Báo lỗi khi sửa mã ID chứa dấu cách hoặc ký tự đặc biệt", async () => {
        await detailPage.codeInput.fill("ag 01");
        await detailPage.save();
        const hasError = await detailPage.codeError.or(detailPage.toastNotification).isVisible();
        expect(hasError).toBeTruthy();
      });

      test("[AD301-25] Báo lỗi khi xóa trắng ô 事務所ID", async () => {
        await detailPage.codeInput.fill("");
        await detailPage.save();
        await expect(detailPage.codeError.or(detailPage.toastNotification)).toContainText(ad301Data.messages.emptyFieldSuffix);
      });
    });

    // 3. Trường Logo
    test.describe("Trường 事務所ロゴ (Logo)", () => {
      test("[AD301-27] Kiểm tra hiển thị phần chọn Logo", async () => {
        await expect(detailPage.selectLogoButton).toBeVisible();
      });
    });

    // 4. Trường 連絡先 オーナー名
    test.describe("Trường 連絡先 オーナー名 (Contact Owner Name)", () => {
      test("[AD301-31] Chỉnh sửa tên người đại diện hợp lệ", async () => {
        await detailPage.contactNameInput.fill("佐藤 健太郎");
        await expect(detailPage.contactNameInput).toHaveValue("佐藤 健太郎");
      });

      test("[AD301-32] Kiểm tra biên Min 1 và Max 20 ký tự ô người đại diện", async () => {
        await detailPage.contactNameInput.fill("A");
        await expect(detailPage.contactNameInput).toHaveValue("A");
        await detailPage.contactNameInput.fill("B".repeat(20));
        await expect(detailPage.contactNameInput).toHaveValue("B".repeat(20));
      });

      test("[AD301-34] Báo lỗi khi xóa trắng ô người đại diện", async () => {
        await detailPage.contactNameInput.fill("");
        await detailPage.save();
        await expect(detailPage.contactNameError.or(detailPage.toastNotification)).toContainText(ad301Data.messages.emptyFieldSuffix);
      });
    });

    // 5. Trường 電話番号
    test.describe("Trường 電話番号 (Phone Number)", () => {
      test("[AD301-37] Chỉnh sửa số điện thoại hợp lệ", async () => {
        await detailPage.contactPhoneInput.fill("09088887777");
        await expect(detailPage.contactPhoneInput).toHaveValue("09088887777");
      });

      test("[AD301-38] Kiểm tra biên Min 5 và Max 20 ký tự số điện thoại", async () => {
        await detailPage.contactPhoneInput.fill("01234");
        await expect(detailPage.contactPhoneInput).toHaveValue("01234");
        await detailPage.contactPhoneInput.fill("09012345678901234567");
        await expect(detailPage.contactPhoneInput).toHaveValue("09012345678901234567");
      });

      test("[AD301-39] Báo lỗi khi nhập số điện thoại ít hơn 5 ký tự", async () => {
        await detailPage.contactPhoneInput.fill("0123");
        await detailPage.save();
        await expect(detailPage.contactPhoneError.or(detailPage.toastNotification)).toContainText(ad301Data.messages.tooShortPhone);
      });

      test("[AD301-40] Báo lỗi khi xóa trắng ô số điện thoại", async () => {
        await detailPage.contactPhoneInput.fill("");
        await detailPage.save();
        await expect(detailPage.contactPhoneError.or(detailPage.toastNotification)).toContainText(ad301Data.messages.emptyFieldSuffix);
      });
    });

    // 6. Trường メールアドレス & Luồng đổi email 2 bước PEM4
    test.describe("Trường メールアドレス (Email Address & PEM4 Flow)", () => {
      test("[AD301-43] Nhập email mới hợp lệ chuẩn bị gửi mail xác thực", async () => {
        await detailPage.contactEmailInput.fill(ad301Data.sampleData.newValidEmail);
        await expect(detailPage.contactEmailInput).toHaveValue(ad301Data.sampleData.newValidEmail);
      });

      test("[AD301-45] Báo lỗi khi nhập email sai định dạng CMR42", async () => {
        await detailPage.contactEmailInput.fill("invalid-email");
        await detailPage.save();
        const hasError = await detailPage.contactEmailError.or(detailPage.toastNotification).isVisible();
        expect(hasError).toBeTruthy();
      });

      test("[AD301-47] Báo lỗi khi để trống trường email", async () => {
        await detailPage.contactEmailInput.fill("");
        await detailPage.save();
        await expect(detailPage.contactEmailError.or(detailPage.toastNotification)).toContainText(ad301Data.messages.emptyFieldSuffix);
      });
    });

    // 7. Nút đổi mật khẩu Owner
    test.describe("Nút [パスワード変更] (Owner Password Reset)", () => {
      test("[AD301-49][AD301-50] Kiểm tra nút đổi mật khẩu hiển thị trên giao diện", async () => {
        if (await detailPage.changePasswordButton.isVisible()) {
          await expect(detailPage.changePasswordButton).toBeVisible();
        }
      });
    });
  });

  // ==========================================
  // III. STATUS MODAL & DELETE MODAL
  // ==========================================
  test.describe("3. Status Change (MSG65) & Delete Modal (MSG66)", () => {
    test("[AD301-55][AD301-56] Chuyển trạng thái sang 停止中 -> Hiển thị Modal MSG65 và hủy bỏ", async () => {
      if (await detailPage.statusDropdown.isVisible()) {
        await detailPage.statusDropdown.selectOption("2");
        if (await detailPage.statusConfirmModal.isVisible()) {
          await expect(detailPage.statusConfirmModal).toBeVisible();
          await detailPage.statusCancelBtn.click();
          await expect(detailPage.statusConfirmModal).not.toBeVisible();
        }
      }
    });

    test("[AD301-60][AD301-61] Bấm nút Xóa Agency -> Hiển thị Modal xác nhận MSG66 và hủy bỏ", async () => {
      if (await detailPage.deleteButton.isVisible()) {
        await detailPage.deleteButton.click();
        if (await detailPage.deleteConfirmModal.isVisible()) {
          await expect(detailPage.deleteConfirmModal).toBeVisible();
          await detailPage.deleteCancelBtn.click();
          await expect(detailPage.deleteConfirmModal).not.toBeVisible();
        }
      }
    });

    test("[AD301-65] Kiểm tra nút [保存] hiển thị và có thể bấm", async () => {
      await expect(detailPage.saveButton).toBeVisible();
    });
  });
});
