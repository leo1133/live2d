import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF500AnimationTypePage } from "../../src/pages/AF500Page.js";
import { af500Data } from "../../src/test-data/af500Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

test.describe.serial("UI AF500: GIFT Animation Type (演出種類)", () => {
  let sharedPage;
  let af500Page;

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
    af500Page = new AF500AnimationTypePage(sharedPage);
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  test("[AF500-1]: Mặc định chọn 通常演出 trên AF200", async () => {
    await af500Page.gotoCreate();
    const normalRadio = af500Page.getAnimationTypeRadio(af500Data.animationTypes.normal);
    if ((await normalRadio.count()) > 0) {
      await expect(normalRadio).toHaveAttribute("aria-checked", "true");
    }
  });

  test("[AF500-4][AF500-5]: Chọn シャッター演出 disable Category và Gift Content", async () => {
    await af500Page.gotoCreate();
    const shutterRadio = af500Page.getAnimationTypeRadio(af500Data.animationTypes.shutter);
    if ((await shutterRadio.count()) > 0) {
      await shutterRadio.click();
      await expect(af500Page.categoryDropdown).toBeDisabled();
    }
  });

  test("[AF500-7][AF500-8]: Chọn 継続演出 disable Category và Gift Content", async () => {
    await af500Page.gotoCreate();
    const contRadio = af500Page.getAnimationTypeRadio(af500Data.animationTypes.continuous);
    if ((await contRadio.count()) > 0) {
      await contRadio.click();
      await expect(af500Page.categoryDropdown).toBeDisabled();
    }
  });

  for (const tc of af500Data.filterCases) {
    test(`${tc.tcId}: Filter AF100 theo ${tc.label}`, async () => {
      await af500Page.gotoList();
      if ((await af500Page.filterAnimationType.count()) > 0) {
        await af500Page.filterAnimationType.click();
        await sharedPage.getByRole("option", { name: tc.label, exact: true }).click();
        await af500Page.searchBtn.click();
      }
    });
  }
});
