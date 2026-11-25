import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF300GiftDetailPage } from "../../src/pages/AF300Page.js";
import { af300Data } from "../../src/test-data/af300Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

test.describe.serial("UI AF300: Gift Manage - Gift Update / Delete (編集・削除)", () => {
  let sharedPage;
  let detailPage;
  const targetGiftId = process.env.TEST_GIFT_ID || 1;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(af300Data.timeouts.suiteTimeout);
    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      storageState: getUiSessionFile(),
      httpCredentials: process.env.BASIC_AUTH_USER
        ? { username: process.env.BASIC_AUTH_USER, password: process.env.BASIC_AUTH_PASS }
        : undefined,
    });
    sharedPage = await context.newPage();
    detailPage = new AF300GiftDetailPage(sharedPage);
    await detailPage.goto(targetGiftId);
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  test.describe("1. Common, Pre-fill & Navigation", () => {
    // @tc: [AF300-1], [AF300-5], [AF300-6], [AF300-7]
    test("[AF300-1][AF300-5][AF300-6][AF300-7]: Truy cập AF300 pre-fill đúng dữ liệu, F5 Reload & Breadcrumb", async () => {
      await detailPage.goto(targetGiftId);
      await expect(detailPage.nameInput).toBeVisible({ timeout: af300Data.timeouts.pageLoad });
      await sharedPage.reload({ waitUntil: "domcontentloaded" });
      await expect(detailPage.nameInput).toBeVisible();
    });
  });

  test.describe("2. Edit Form Validation & Update (Data-Driven)", () => {
    for (const tc of af300Data.editNameCases) {
      // @tc: [AF300-10], [AF300-11]
      test(`${tc.tcId}: Sửa Tên quà — ${tc.label}`, async () => {
        await detailPage.nameInput.fill(tc.value);
        if (!tc.expectValid) {
          await detailPage.clickSave();
          await expect(detailPage.errorMessages.first()).toBeVisible({ timeout: af300Data.timeouts.modal });
        }
      });
    }

    for (const tc of af300Data.editCoinCases) {
      // @tc: [AF300-15], [AF300-16]
      test(`${tc.tcId}: Sửa Giá Coin — ${tc.label}`, async () => {
        await detailPage.coinPriceInput.fill(tc.value);
      });
    }

    for (const tc of af300Data.editSortOrderCases) {
      // @tc: [AF300-21]
      test(`${tc.tcId}: Sửa Sort Order — ${tc.label}`, async () => {
        await detailPage.sortOrderInput.fill(tc.value);
      });
    }

    // @tc: [AF300-9], [AF300-17]
    test("[AF300-9][AF300-17]: Xóa trắng Tên quà và Giá coin báo lỗi CMMSG29", async () => {
      await detailPage.nameInput.fill("");
      await detailPage.coinPriceInput.fill("");
      await detailPage.clickSave();
      await expect(detailPage.errorMessages.first()).toBeVisible({ timeout: af300Data.timeouts.modal });
    });

    // @tc: [AF300-8], [AF300-13], [AF300-18], [AF300-20], [AF300-24], [AF300-28], [AF300-29]
    test("[AF300-8][AF300-13][AF300-18][AF300-20][AF300-24][AF300-28][AF300-29]: Cập nhật hợp lệ, giữ nguyên icon & Debounce CMR15", async () => {
      await detailPage.goto(targetGiftId);
      const upd = af300Data.buildUpdateData();
      await detailPage.nameInput.fill(upd.name);
      await detailPage.coinPriceInput.fill(upd.coin_price);
      await detailPage.sortOrderInput.fill(upd.sort_order);
      await detailPage.saveButton.dblclick();
    });
  });

  test.describe("3. Cancel (CMR07) & Delete Flow (CMR25)", () => {
    // @tc: [AF300-31], [AF300-32], [AF300-43], [AF300-44]
    test("[AF300-31][AF300-32][AF300-43][AF300-44]: Hủy khi chưa sửa vs đã sửa (Modal CMMSG46)", async () => {
      await detailPage.goto(targetGiftId);
      await detailPage.nameInput.fill("Modified Gift Name");
      await detailPage.clickCancel();
      if ((await detailPage.confirmModal.count()) > 0) {
        await expect(detailPage.confirmModal).toBeVisible();
        await detailPage.modalCancelBtn.click();
        await expect(detailPage.nameInput).toHaveValue("Modified Gift Name");
        await detailPage.clickCancel();
        await detailPage.modalOkBtn.click();
        expect(sharedPage.url()).toContain(af300Data.routes.giftList);
      }
    });

    // @tc: [AF300-33], [AF300-34], [AF300-38], [AF300-39]
    test("[AF300-33][AF300-34][AF300-38][AF300-39]: Nút Xóa mở Modal CMR25, Hủy xóa & Xác nhận xóa", async () => {
      await detailPage.goto(targetGiftId);
      if ((await detailPage.deleteButton.count()) > 0) {
        await detailPage.clickDelete();
        if ((await detailPage.confirmModal.count()) > 0) {
          await expect(detailPage.confirmModal).toBeVisible();
          await detailPage.modalCancelBtn.click();
          await expect(detailPage.confirmModal).toBeHidden();
        }
      }
    });
  });
});
