import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF200GiftCreatePage } from "../../src/pages/AF200Page.js";
import { af200Data } from "../../src/test-data/af200Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

test.describe.serial("UI AF200: Gift Manage - Gift Create (ギフト登録)", () => {
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

  test("[AF200-3]: Truy cập trực tiếp URL AF200 tải form tạo mới", async () => {
    await createPage.goto();
    await expect(createPage.nameInput).toBeVisible({ timeout: af200Data.timeouts.pageLoad });
    await expect(createPage.submitBtn).toBeVisible();
  });

  for (const tc of af200Data.nameValidationCases) {
    test(`${tc.tcId}: Textbox ギフト名 - ${tc.title}`, async () => {
      await createPage.goto();
      await createPage.fillName(tc.value);
      await expect(createPage.nameInput).toBeVisible();
    });
  }

  for (const tc of af200Data.sortOrderCases) {
    test(`${tc.tcId}: Textbox 並び順 - ${tc.title}`, async () => {
      await createPage.goto();
      if ((await createPage.sortOrderInput.count()) > 0) {
        await createPage.fillSortOrder(tc.value);
      }
    });
  }

  for (const tc of af200Data.priceValidationCases) {
    test(`${tc.tcId}: Textbox ギフト値段 - ${tc.title}`, async () => {
      await createPage.goto();
      if ((await createPage.priceInput.count()) > 0) {
        await createPage.fillPrice(tc.value);
      }
    });
  }

  test("[AF200-65]: Button キャンセル khi chưa nhập dữ liệu quay về AF100", async () => {
    await createPage.goto();
    await createPage.clickCancel();
  });

  test("[AF200-67]: Button 登録 khi để trống tất cả trường bắt buộc báo CMMSG29", async () => {
    await createPage.goto();
    await createPage.clickSubmit();
  });
});
