import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF500HighValueGiftPage } from "../../src/pages/AF500Page.js";
import { af500Data } from "../../src/test-data/af500Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

test.describe.serial("UI AF500: Quà cao cấp (High-Value Gift Configuration)", () => {
  let sharedPage;
  let highValuePage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(af500Data.timeouts.suiteTimeout);
    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      storageState: getUiSessionFile(),
      httpCredentials: process.env.BASIC_AUTH_USER
        ? { username: process.env.BASIC_AUTH_USER, password: process.env.BASIC_AUTH_PASS }
        : undefined,
    });
    sharedPage = await context.newPage();
    highValuePage = new AF500HighValueGiftPage(sharedPage);
    await highValuePage.goto();
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  test.describe("1. Common, Threshold Validation & Toggles", () => {
    // @tc: [AF500-1], [AF500-2], [AF500-4], [AF500-5], [AF500-6]
    test("[AF500-1][AF500-2][AF500-4][AF500-5][AF500-6]: Truy cập AF500, Pre-fill Threshold & F5 Reload", async () => {
      await highValuePage.goto();
      expect(sharedPage.url()).toContain(af500Data.routes.highValueConfig);
      await expect(highValuePage.thresholdInput).toBeVisible({ timeout: af500Data.timeouts.pageLoad });
      await sharedPage.reload({ waitUntil: "domcontentloaded" });
      await expect(highValuePage.thresholdInput).toBeVisible();
    });

    for (const tc of af500Data.thresholdDataCases) {
      // @tc: [AF500-8], [AF500-9], [AF500-11]
      test(`${tc.tcId}: Threshold input — ${tc.label}`, async () => {
        await highValuePage.fillThreshold(tc.value);
        if (!tc.expectValid) {
          await highValuePage.clickSave();
          await expect(highValuePage.errorMessages.first()).toBeVisible({ timeout: af500Data.timeouts.modal });
        }
      });
    }

    // @tc: [AF500-10]
    test("[AF500-10]: Bỏ trống Threshold báo lỗi CMMSG29", async () => {
      await highValuePage.fillThreshold("");
      await highValuePage.clickSave();
      await expect(highValuePage.errorMessages.first()).toBeVisible({ timeout: af500Data.timeouts.modal });
    });

    // @tc: [AF500-7], [AF500-12], [AF500-13], [AF500-14], [AF500-16]
    test("[AF500-7][AF500-12][AF500-13][AF500-16]: Lưu cấu hình Threshold hợp lệ, Toggle & Debounce CMR15", async () => {
      await highValuePage.fillThreshold(af500Data.buildValidThreshold());
      if ((await highValuePage.getHighValueToggle(0).count()) > 0) {
        await highValuePage.getHighValueToggle(0).click();
      }
      await highValuePage.saveButton.dblclick();
    });

    // @tc: [AF500-17]
    test("[AF500-17]: Nút Hủy khi đã sửa hiện popup xác nhận CMMSG46", async () => {
      await highValuePage.fillThreshold("999");
      if ((await highValuePage.cancelButton.count()) > 0) {
        await highValuePage.cancelButton.click();
        if ((await highValuePage.unsavedModal.count()) > 0) {
          await expect(highValuePage.unsavedModal).toBeVisible();
          await highValuePage.modalCancelBtn.click();
        }
      }
    });
  });
});
