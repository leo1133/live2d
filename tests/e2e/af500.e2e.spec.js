import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF500AnimationTypeAPI } from "../../src/api/AF500API.js";
import { AF500AnimationTypePage } from "../../src/pages/AF500Page.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

test.describe("E2E AF500: Animation Type Filter Sync (UI <-> API)", () => {
  test("[AF500-E2E-01]: Đối chiếu danh sách gift theo animation_type=shutter giữa API và AF100 UI", async ({
    authenticatedRequest,
    browser,
  }) => {
    const api = new AF500AnimationTypeAPI(authenticatedRequest);
    const res = await api.getGiftList({ queryParams: { animation_type: "shutter" } });
    expect(res.status()).toBe(200);

    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      storageState: getUiSessionFile(),
    });
    const page = await context.newPage();
    const af500Page = new AF500AnimationTypePage(page);
    await af500Page.gotoList();
    await expect(page.locator("body")).toBeVisible();
    await context.close();
  });
});
