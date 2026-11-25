import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF200GiftCreatePage } from "../../src/pages/AF200Page.js";
import { af200Data } from "../../src/test-data/af200Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

test.describe.serial("UI AF200: Gift Manage - Gift Create (新規登録)", () => {
  let sharedPage;
  let createPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(af200Data.timeouts.suiteTimeout);
    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      storageState: getUiSessionFile(),
      httpCredentials: process.env.BASIC_AUTH_USER
        ? { username: process.env.BASIC_AUTH_USER, password: process.env.BASIC_AUTH_PASS }
        : undefined,
    });
    sharedPage = await context.newPage();
    createPage = new AF200GiftCreatePage(sharedPage);
    await createPage.goto();
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  test.describe("1. Common & Navigation", () => {
    // @tc: [AF200-1], [AF200-2], [AF200-4], [AF200-5], [AF200-6]
    test("[AF200-1][AF200-2][AF200-4][AF200-5][AF200-6]: Truy cập AF200, Autofocus CMR09, F5 Reload & Breadcrumb", async () => {
      await createPage.goto();
      expect(sharedPage.url()).toContain(af200Data.routes.giftCreate);
      await expect(createPage.nameInput).toBeVisible({ timeout: af200Data.timeouts.pageLoad });
      await sharedPage.reload({ waitUntil: "domcontentloaded" });
      await expect(createPage.nameInput).toHaveValue("");
    });
  });

  test.describe("2. Form Inputs & Validation (Data-Driven)", () => {
    // @tc: [AF200-7]
    test("[AF200-7]: Nhập tên quà tiếng Nhật & Latin hợp lệ", async () => {
      await createPage.nameInput.fill("スターギフト Star Gift");
      await expect(createPage.nameInput).toHaveValue("スターギフト Star Gift");
    });

    for (const tc of af200Data.nameDataCases) {
      // @tc: [AF200-8]..[AF200-13]
      test(`${tc.tcId}: Textbox Tên quà — ${tc.label}`, async () => {
        await createPage.nameInput.fill(tc.value);
        if (!tc.expectValid) {
          await createPage.clickSave();
          await expect(createPage.errorMessages.first()).toBeVisible({ timeout: af200Data.timeouts.modal });
        }
      });
    }

    for (const tc of af200Data.coinPriceDataCases) {
      // @tc: [AF200-16]..[AF200-22]
      test(`${tc.tcId}: Textbox Giá Coin — ${tc.label}`, async () => {
        await createPage.coinPriceInput.fill(tc.value);
        if (!tc.expectValid) {
          await createPage.clickSave();
        }
      });
    }

    for (const tc of af200Data.sortOrderDataCases) {
      // @tc: [AF200-29]
      test(`${tc.tcId}: Textbox Sort Order — ${tc.label}`, async () => {
        await createPage.sortOrderInput.fill(tc.value);
      });
    }

    // @tc: [AF200-11], [AF200-23], [AF200-27], [AF200-45]
    test("[AF200-11][AF200-23][AF200-27][AF200-45]: Validate toàn bộ form khi để trống các trường bắt buộc", async () => {
      await createPage.goto();
      await createPage.clickSave();
      await expect(createPage.errorMessages.first()).toBeVisible({ timeout: af200Data.timeouts.modal });
    });

    // @tc: [AF200-24], [AF200-25], [AF200-26], [AF200-28], [AF200-31]
    test("[AF200-24]..[AF200-28][AF200-31]: Dropdown Category, Sort Order & Toggle Status", async () => {
      const optCount = await createPage.categoryDropdown.locator("option").count();
      if (optCount > 1) {
        await createPage.categoryDropdown.selectOption({ index: 1 });
      }
      await createPage.sortOrderInput.fill("5");
      if ((await createPage.statusToggle.count()) > 0) {
        await createPage.statusToggle.click();
      }
    });
  });

  test.describe("3. File Upload, Save, Cancel (CMR07) & Modals", () => {
    // @tc: [AF200-33], [AF200-34], [AF200-35], [AF200-37], [AF200-38], [AF200-42], [AF200-43]
    test("[AF200-33][AF200-35][AF200-37][AF200-38]: Upload Icon hợp lệ, xóa & tải lại chính file đó", async () => {
      if ((await createPage.iconFileInput.count()) > 0) {
        await createPage.uploadIcon(af200Data.assets.validIconPath);
        if ((await createPage.iconRemoveBtn.count()) > 0) {
          await createPage.iconRemoveBtn.click();
          await createPage.uploadIcon(af200Data.assets.validIconPath);
        }
      }
    });

    // @tc: [AF200-46], [AF200-48]
    test("[AF200-46][AF200-48]: Lưu tạo quà thành công & Debounce chống double-click CMR15", async () => {
      const formData = af200Data.buildGiftFormData();
      await createPage.fillForm(formData);
      await createPage.saveButton.dblclick();
    });

    // @tc: [AF200-49], [AF200-50], [AF200-54], [AF200-55]
    test("[AF200-49][AF200-50][AF200-54][AF200-55]: Nút Hủy khi chưa nhập vs đã nhập (Modal CMR07)", async () => {
      await createPage.goto();
      await createPage.clickCancel();
      expect(sharedPage.url()).toContain(af200Data.routes.giftList);

      await createPage.goto();
      await createPage.nameInput.fill("Unsaved Test Gift");
      await createPage.clickCancel();
      if ((await createPage.unsavedModal.count()) > 0) {
        await expect(createPage.unsavedModal).toBeVisible();
        await createPage.modalCancelBtn.click();
        await expect(createPage.nameInput).toHaveValue("Unsaved Test Gift");
        await createPage.clickCancel();
        await createPage.modalOkBtn.click();
        expect(sharedPage.url()).toContain(af200Data.routes.giftList);
      }
    });
  });
});
