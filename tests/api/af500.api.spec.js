import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF500HighValueGiftAPI } from "../../src/api/AF500API.js";
import { apiAf500Data, buildHighValueConfigPayload } from "../../src/test-data/apiAf500Data.js";
import { createAuthTestCases } from "../../src/test-data/commonApiData.js";

test.describe("API AF500: High-Value Gift Config (/api/v1/admin/high-value-gift/config)", () => {
  test.describe("1. Auth, GET Config & Method Guard", () => {
    for (const tc of createAuthTestCases()) {
      test(`[AF500-API-AUTH] ${tc.tcId}: ${tc.title}`, async ({ unauthenticatedRequest }) => {
        const api = new AF500HighValueGiftAPI(unauthenticatedRequest);
        const res = await api.getConfig({ headers: tc.headers });
        expect([401, 403]).toContain(res.status());
      });
    }

    test("[AF500-API-03][AF500-API-04]: GET config 200 & DELETE trả 405", async ({ authenticatedRequest }) => {
      const api = new AF500HighValueGiftAPI(authenticatedRequest);
      const res = await api.getConfig();
      expect(res.status()).toBe(200);

      const delRes = await api.updateConfig({ method: "DELETE" });
      expect([404, 405]).toContain(delRes.status());
    });
  });

  test.describe("2. PUT Config — Threshold, Boolean & Array Validation", () => {
    for (const tc of apiAf500Data.thresholdValidationCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF500HighValueGiftAPI(authenticatedRequest);
        const res = await api.updateConfig({ payload: tc.payload });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    test("[AF500-API-10][AF500-API-21]: PUT cập nhật hợp lệ & Idempotent", async ({ authenticatedRequest }) => {
      const api = new AF500HighValueGiftAPI(authenticatedRequest);
      const payload = buildHighValueConfigPayload();
      const res1 = await api.updateConfig({ payload });
      expect(res1.status()).toBe(200);
      const res2 = await api.updateConfig({ payload });
      expect(res2.status()).toBe(200);
    });
  });
});
