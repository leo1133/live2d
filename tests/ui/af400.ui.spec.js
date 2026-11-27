import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF400CategoryPage } from "../../src/pages/AF400Page.js";
import { af400Data } from "../../src/test-data/af400Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

test.describe.serial("UI AF400: Gift Manage - Gift Category (ギフトカテゴリ管理)", () => {
  let sharedPage;
  let categoryPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(af400Data.timeouts.suiteTimeout);
    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      storageState: getUiSessionFile(),
      httpCredentials: process.env.BASIC_AUTH_USER
        ? { username: process.env.BASIC_AUTH_USER, password: process.env.BASIC_AUTH_PASS }
        : undefined,
    });
    sharedPage = await context.newPage();
    categoryPage = new AF400CategoryPage(sharedPage);
    await categoryPage.goto();
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  test("[AF400-5]: Bảng danh sách Category hiển thị đầy đủ", async () => {
    await categoryPage.goto();
    await expect(categoryPage.createButton).toBeVisible({ timeout: af400Data.timeouts.pageLoad });
    await expect(categoryPage.tableRows.first()).toBeVisible({ timeout: af400Data.timeouts.pageLoad });
  });

  test("[AF400-9]: Button 新規登録 mở Modal tạo mới category", async () => {
    await categoryPage.goto();
    await categoryPage.openCreateModal();
    await expect(categoryPage.modal).toBeVisible();
  });

  for (const tc of af400Data.createValidationCases) {
    test(`${tc.tcId}: Modal Tạo mới - ${tc.title}`, async () => {
      await categoryPage.goto();
      await categoryPage.openCreateModal();
      await categoryPage.modalInput.fill(tc.value);
      await categoryPage.modalAddBtn.click();
    });
  }
});
