import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF500HighValueGiftPage } from "../../src/pages/AF500Page.js";
import { AF500HighValueGiftAPI } from "../../src/api/AF500API.js";
import { af500Data } from "../../src/test-data/af500Data.js";

test.describe("E2E AF500: High-Value Gift Config Sync (UI <-> API)", () => {
  test("[AF500-E2E-01]: Đối chiếu giá trị Threshold giữa API GET và màn AF500", async ({
    page,
    authenticatedRequest,
  }) => {
    const api = new AF500HighValueGiftAPI(authenticatedRequest);
    const apiRes = await api.getConfig();
    expect(apiRes.status()).toBe(200);
    const config = await apiRes.json();
    const threshold = config.threshold ?? config.data?.threshold;

    const hvPage = new AF500HighValueGiftPage(page);
    await hvPage.goto();
    await expect(hvPage.thresholdInput).toBeVisible({ timeout: af500Data.timeouts.pageLoad });
    if (threshold !== undefined) {
      await expect(hvPage.thresholdInput).toHaveValue(String(threshold));
    }
  });
});
