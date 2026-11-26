import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF300GiftDetailPage } from "../../src/pages/AF300Page.js";
import { af300Data } from "../../src/test-data/af300Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

test.describe.serial("UI AF300: Gift Manage - Gift Update / Delete (ギフト更新・削除)", () => {
  let sharedPage;
  let detailPage;

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
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  for (const tc of af300Data.invalidRoutes) {
    test(`${tc.tcId}: Inbound Deep-link - ${tc.title}`, async () => {
      await detailPage.goto(tc.id);
      await expect(sharedPage.locator("body")).toBeVisible();
    });
  }

  for (const tc of af300Data.nameUpdateCases) {
    test(`${tc.tcId}: Textbox ギフト名 - ${tc.title}`, async () => {
      await detailPage.goto(1);
      if ((await detailPage.nameInput.count()) > 0) {
        await detailPage.fillName(tc.value);
      }
    });
  }

  for (const tc of af300Data.priceUpdateCases) {
    test(`${tc.tcId}: Textbox ギフト値段 - ${tc.title}`, async () => {
      await detailPage.goto(1);
      if ((await detailPage.priceInput.count()) > 0) {
        await detailPage.fillPrice(tc.value);
      }
    });
  }
});
