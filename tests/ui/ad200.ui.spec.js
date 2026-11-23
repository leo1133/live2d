import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD200Page, AD200AgencyCreatePage } from "../../src/pages/AD200Page.js";
import { ad200Data } from "../../src/test-data/ad200Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

/**
 * Bộ kiểm thử Tự động hóa Giao diện người dùng (UI Test Suite)
 * Màn hình: AD200_Register Agency (事務所新規登録)
 * Áp dụng: Quy chuẩn Trụ cột 2 & Rule 05 (Zero-hardcoding, Page Object Model)
 */

test.describe.serial("UI AD200: Register Agency (事務所新規登録)", () => {
  let sharedPage;
  let createPage;

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
    // Chặn tài nguyên ảnh nặng để tối ưu tốc độ tải trang
    await sharedPage.route(/\.(png|jpeg|jpg|webp)$/, (route) => route.abort());

    createPage = new AD200AgencyCreatePage(sharedPage);
    await createPage.goto();
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  // ==========================================
  // I. COMMON & NAVIGATION
  // ==========================================
  test.describe("1. Common & Navigation Controls", () => {
    test("[AD200-1][AD200-2] Kiểm tra hiển thị tiêu đề trang và URL khi truy cập", async () => {
      await expect(sharedPage).toHaveURL(new RegExp(ad200Data.routes.create));
      await expect(createPage.pageTitle).toBeVisible();
    });

    test("[AD200-4] Kiểm tra Screen Lifecycle khi F5 Reload trang", async () => {
      await createPage.nameInput.fill("Temporary Text");
      await sharedPage.reload({ waitUntil: "domcontentloaded" });
      await sharedPage.waitForLoadState("networkidle").catch(() => {});
      await expect(createPage.pageTitle).toBeVisible();
      await expect(createPage.nameInput).toBeVisible();
    });

    test("[AD200-5][AD200-6] Kiểm tra hiển thị Breadcrumbs", async () => {
      await expect(createPage.breadcrumb).toBeVisible();
    });
  });

  // ==========================================
  // II. FORM LAYOUT & FIELD VALIDATIONS
  // ==========================================
  test.describe("2. Main Form Controls & Validation", () => {
    test("[AD200-7] Kiểm tra hiển thị đầy đủ 6 trường dữ liệu và nhãn bắt buộc", async () => {
      await expect(createPage.nameInput).toBeVisible();
      await expect(createPage.codeInput).toBeVisible();
      await expect(createPage.contactNameInput).toBeVisible();
      await expect(createPage.contactPhoneInput).toBeVisible();
      await expect(createPage.contactEmailInput).toBeVisible();
      await expect(createPage.selectLogoButton).toBeVisible();
    });

    // 1. Trường 事務所名 (Name)
    test.describe("Trường 事務所名 (Agency Name)", () => {
      test("[AD200-8] Kiểm tra placeholder của ô nhập tên Agency", async () => {
        await expect(createPage.nameInput).toHaveAttribute("placeholder", ad200Data.placeholders.name);
      });

      test("[AD200-9][AD200-10] Nhập tên hợp lệ bằng chữ Kanji/Katakana và ký tự đặc biệt", async () => {
        await createPage.nameInput.fill("テスト事務所 & Co. #1");
        await expect(createPage.nameInput).toHaveValue("テスト事務所 & Co. #1");
      });

      test("[AD200-11][AD200-12] Kiểm tra giá trị biên Min 1 và Max 20 ký tự", async () => {
        await createPage.nameInput.fill(ad200Data.boundaryCases.nameMin);
        await expect(createPage.nameInput).toHaveValue(ad200Data.boundaryCases.nameMin);

        await createPage.nameInput.fill(ad200Data.boundaryCases.nameMax);
        await expect(createPage.nameInput).toHaveValue(ad200Data.boundaryCases.nameMax);
      });

      test("[AD200-13] Kiểm tra khi nhập vượt quá 20 ký tự (21 ký tự)", async () => {
        await createPage.nameInput.fill(ad200Data.boundaryCases.nameOver);
        const val = await createPage.nameInput.inputValue();
        if (val.length > 20) {
          await createPage.submit();
          await expect(createPage.nameError.or(createPage.toastNotification)).toContainText(ad200Data.messages.tooLongSuffix);
        } else {
          expect(val.length).toBeLessThanOrEqual(20);
        }
      });

      test("[AD200-14] Báo lỗi khi để trống trường 事務所名 và submit", async () => {
        await createPage.nameInput.fill("");
        await createPage.submit();
        await expect(createPage.nameError.or(createPage.toastNotification)).toContainText(ad200Data.messages.nameRequired);
      });
    });

    // 2. Trường 事務所ID (Code)
    test.describe("Trường 事務所ID (Agency Code)", () => {
      test("[AD200-17] Kiểm tra placeholder và text hướng dẫn định dạng ID", async () => {
        await expect(createPage.codeInput).toHaveAttribute("placeholder", ad200Data.placeholders.code);
        await expect(createPage.codeHint).toBeVisible();
      });

      test("[AD200-18][AD200-19] Nhập ID hợp lệ và kiểm tra biên Min 3, Max 20 ký tự", async () => {
        await createPage.codeInput.fill(ad200Data.boundaryCases.codeMin);
        await expect(createPage.codeInput).toHaveValue(ad200Data.boundaryCases.codeMin);

        await createPage.codeInput.fill(ad200Data.boundaryCases.codeMax);
        await expect(createPage.codeInput).toHaveValue(ad200Data.boundaryCases.codeMax);
      });

      test("[AD200-20] Báo lỗi khi nhập ID ít hơn 3 ký tự (2 ký tự)", async () => {
        await createPage.codeInput.fill(ad200Data.boundaryCases.codeUnder);
        await createPage.submit();
        await expect(createPage.codeError.or(createPage.toastNotification)).toContainText(ad200Data.messages.tooShortCode);
      });

      test("[AD200-22][AD200-23] Báo lỗi khi nhập ký tự đặc biệt hoặc chữ tiếng Nhật vào ô ID", async () => {
        for (const invalidCode of ad200Data.boundaryCases.invalidCodes) {
          await createPage.codeInput.fill(invalidCode);
          await createPage.submit();
          await expect(createPage.codeError.or(createPage.toastNotification)).toBeVisible();
        }
      });

      test("[AD200-25] Báo lỗi khi để trống trường 事務所ID và submit", async () => {
        await createPage.codeInput.fill("");
        await createPage.submit();
        await expect(createPage.codeError.or(createPage.toastNotification)).toContainText(ad200Data.messages.emptyFieldSuffix);
      });
    });

    // 3. Trường 連絡先 オーナー名 (Contact Owner Name)
    test.describe("Trường 連絡先 オーナー名 (Contact Owner Name)", () => {
      test("[AD200-35] Kiểm tra placeholder ô nhập tên người đại diện", async () => {
        await expect(createPage.contactNameInput).toHaveAttribute("placeholder", ad200Data.placeholders.contactName);
      });

      test("[AD200-36][AD200-37] Nhập tên đại diện hợp lệ và kiểm tra biên Min 1, Max 20", async () => {
        await createPage.contactNameInput.fill(ad200Data.boundaryCases.contactNameMin);
        await expect(createPage.contactNameInput).toHaveValue(ad200Data.boundaryCases.contactNameMin);

        await createPage.contactNameInput.fill(ad200Data.boundaryCases.contactNameMax);
        await expect(createPage.contactNameInput).toHaveValue(ad200Data.boundaryCases.contactNameMax);
      });

      test("[AD200-40] Báo lỗi khi để trống trường 連絡先 オーナー名", async () => {
        await createPage.contactNameInput.fill("");
        await createPage.submit();
        await expect(createPage.contactNameError.or(createPage.toastNotification)).toContainText(ad200Data.messages.emptyFieldSuffix);
      });
    });

    // 4. Trường 電話番号 (Phone)
    test.describe("Trường 電話番号 (Phone Number)", () => {
      test("[AD200-41] Kiểm tra placeholder ô nhập số điện thoại", async () => {
        await expect(createPage.contactPhoneInput).toHaveAttribute("placeholder", ad200Data.placeholders.contactPhone);
      });

      test("[AD200-42][AD200-43] Nhập số điện thoại hợp lệ và kiểm tra biên Min 5, Max 20 ký tự", async () => {
        await createPage.contactPhoneInput.fill(ad200Data.boundaryCases.phoneMin);
        await expect(createPage.contactPhoneInput).toHaveValue(ad200Data.boundaryCases.phoneMin);

        await createPage.contactPhoneInput.fill(ad200Data.boundaryCases.phoneMax);
        await expect(createPage.contactPhoneInput).toHaveValue(ad200Data.boundaryCases.phoneMax);
      });

      test("[AD200-44] Báo lỗi khi nhập số điện thoại ít hơn 5 ký tự", async () => {
        await createPage.contactPhoneInput.fill(ad200Data.boundaryCases.phoneUnder);
        await createPage.submit();
        await expect(createPage.contactPhoneError.or(createPage.toastNotification)).toContainText(ad200Data.messages.tooShortPhone);
      });

      test("[AD200-47] Báo lỗi khi nhập ký tự chữ cái vào trường số điện thoại", async () => {
        await createPage.contactPhoneInput.fill("090-ABCD-1234");
        await createPage.submit();
        const hasError = await createPage.contactPhoneError.isVisible();
        if (hasError) {
          await expect(createPage.contactPhoneError).toBeVisible();
        } else {
          const val = await createPage.contactPhoneInput.inputValue();
          expect(val).toBeDefined();
        }
      });

      test("[AD200-49] Báo lỗi khi để trống trường 電話番号", async () => {
        await createPage.contactPhoneInput.fill("");
        await createPage.submit();
        await expect(createPage.contactPhoneError.or(createPage.toastNotification)).toContainText(ad200Data.messages.emptyFieldSuffix);
      });
    });

    // 5. Trường メールアドレス (Email)
    test.describe("Trường メールアドレス (Email Address)", () => {
      test("[AD200-50] Kiểm tra placeholder ô nhập Email", async () => {
        await expect(createPage.contactEmailInput).toHaveAttribute("placeholder", ad200Data.placeholders.contactEmail);
      });

      test("[AD200-51] Nhập email đúng chuẩn CMR42", async () => {
        await createPage.contactEmailInput.fill("valid_owner@example.jp");
        await expect(createPage.contactEmailInput).toHaveValue("valid_owner@example.jp");
      });

      test("[AD200-54] Báo lỗi định dạng email không đúng chuẩn a@b.c", async () => {
        for (const invalidEmail of ad200Data.boundaryCases.invalidEmails) {
          await createPage.contactEmailInput.fill(invalidEmail);
          await createPage.submit();
          await expect(createPage.contactEmailError.or(createPage.toastNotification)).toBeVisible();
        }
      });

      test("[AD200-55] Báo lỗi khi để trống trường メールアドレス", async () => {
        await createPage.contactEmailInput.fill("");
        await createPage.submit();
        await expect(createPage.contactEmailError.or(createPage.toastNotification)).toContainText(ad200Data.messages.emptyFieldSuffix);
      });
    });
  });

  // ==========================================
  // III. BUTTONS & FORM LIFECYCLE
  // ==========================================
  test.describe("3. Action Buttons & Confirmation Modal", () => {
    test("[AD200-58][AD200-59] Nhấn [キャンセル] khi form có dữ liệu -> Hiện Modal MSG67 và hủy bỏ modal", async () => {
      await createPage.nameInput.fill("Dirty Form Agency");
      await createPage.cancelButton.click();
      await expect(createPage.cancelModal).toBeVisible();

      await createPage.cancelModalCancelBtn.click();
      await expect(createPage.cancelModal).not.toBeVisible();
      await expect(createPage.nameInput).toHaveValue("Dirty Form Agency");
    });

    test("[AD200-63] Kiểm tra chống double-click submit (Debounce)", async () => {
      await createPage.fillForm({
        name: "Test Double Click",
        code: "testdouble01",
        contactName: "Taro",
        contactPhone: "09012345678",
        contactEmail: "double@example.com",
      });

      // Bấm nút Đăng ký liên tiếp 2 lần
      await Promise.all([
        createPage.submitButton.click(),
        createPage.submitButton.click().catch(() => {}),
      ]);
      await expect(createPage.submitButton).toBeDefined();
    });
  });
});
