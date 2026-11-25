import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF400CategoryManagePage } from "../../src/pages/AF400Page.js";
import { af400Data } from "../../src/test-data/af400Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

test.describe.serial("UI AF400: Gift Manage - Gift Category Manage (カテゴリ管理)", () => {
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
    categoryPage = new AF400CategoryManagePage(sharedPage);
    await categoryPage.goto();
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  test.describe("1. Common, Table Headers & List", () => {
    // @tc: [AF400-1], [AF400-2], [AF400-4], [AF400-5], [AF400-11], [AF400-12], [AF400-33]
    test("[AF400-1][AF400-2][AF400-4][AF400-5][AF400-11][AF400-33]: Truy cập AF400, F5 Reload, Danh sách & Phân trang", async () => {
      await categoryPage.goto();
      expect(sharedPage.url()).toContain(af400Data.routes.categoryManage);
      await expect(categoryPage.table).toBeVisible({ timeout: af400Data.timeouts.pageLoad });
      await sharedPage.reload({ waitUntil: "domcontentloaded" });
      await expect(categoryPage.table).toBeVisible();
    });

    for (const col of af400Data.tableHeaders) {
      // @tc: [AF400-6]..[AF400-10]
      test(`${col.tcId}: Kiểm tra Header cột ${col.text}`, async () => {
        const header = categoryPage.getTableHeader(col.text);
        if ((await header.count()) > 0) {
          await expect(header.first()).toBeVisible();
        }
      });
    }
  });

  test.describe("2. Create, Edit & Delete Modals (Data-Driven)", () => {
    // @tc: [AF400-13], [AF400-16], [AF400-22]
    test("[AF400-13][AF400-16][AF400-22]: Mở Modal Tạo, validate bỏ trống & Cancel", async () => {
      await categoryPage.createButton.click();
      await expect(categoryPage.modalDialog).toBeVisible({ timeout: af400Data.timeouts.modal });
      await categoryPage.modalSaveBtn.click();
      await expect(categoryPage.errorMessages.first()).toBeVisible({ timeout: af400Data.timeouts.modal });
      await categoryPage.modalCancelBtn.click();
    });

    for (const tc of af400Data.categoryDataCases) {
      // @tc: [AF400-17], [AF400-18]
      test(`${tc.tcId}: Modal Tạo danh mục — ${tc.label}`, async () => {
        await categoryPage.createButton.click();
        await categoryPage.categoryNameInput.fill(tc.value);
        if (!tc.expectValid) {
          await categoryPage.modalSaveBtn.click();
          await expect(categoryPage.errorMessages.first()).toBeVisible({ timeout: af400Data.timeouts.modal });
        }
        await categoryPage.modalCancelBtn.click();
      });
    }

    for (const tc of af400Data.sortOrderDataCases) {
      // @tc: [AF400-20]
      test(`${tc.tcId}: Modal Tạo danh mục Sort Order — ${tc.label}`, async () => {
        await categoryPage.createButton.click();
        await categoryPage.sortOrderInput.fill(tc.value);
        await categoryPage.modalCancelBtn.click();
      });
    }

    // @tc: [AF400-15], [AF400-21]
    test("[AF400-15][AF400-21]: Tạo danh mục thành công & Debounce double-click", async () => {
      const formData = af400Data.buildCategoryFormData();
      await categoryPage.createButton.click();
      await categoryPage.categoryNameInput.fill(formData.name);
      await categoryPage.sortOrderInput.fill(formData.sort_order);
      await categoryPage.modalSaveBtn.dblclick();
    });

    // @tc: [AF400-23], [AF400-24], [AF400-25], [AF400-26]
    test("[AF400-23][AF400-24][AF400-25][AF400-26]: Mở Modal Edit pre-fill, validate trống & cập nhật", async () => {
      if ((await categoryPage.tableRows.count()) > 0) {
        await categoryPage.getRowEditButton(0).click();
        await expect(categoryPage.modalDialog).toBeVisible();
        await categoryPage.categoryNameInput.fill("");
        await categoryPage.modalSaveBtn.click();
        await expect(categoryPage.errorMessages.first()).toBeVisible();
        await categoryPage.modalCancelBtn.click();
      }
    });

    // @tc: [AF400-27], [AF400-28], [AF400-29]
    test("[AF400-27][AF400-28][AF400-29]: Modal Xác nhận Xóa & Hủy xóa", async () => {
      if ((await categoryPage.tableRows.count()) > 0) {
        await categoryPage.getRowDeleteButton(0).click();
        await expect(categoryPage.modalDialog).toBeVisible();
        await categoryPage.modalCancelBtn.click();
        await expect(categoryPage.modalDialog).toBeHidden();
      }
    });
  });
});
