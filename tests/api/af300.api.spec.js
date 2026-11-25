import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF300GiftDetailAPI } from "../../src/api/AF300API.js";
import { apiAf300Data, buildGiftUpdatePayload } from "../../src/test-data/apiAf300Data.js";
import { createAuthTestCases } from "../../src/test-data/commonApiData.js";

test.describe("API AF300: Gift Detail, Update & Delete (GET/PUT/PATCH/DELETE /gifts/:id)", () => {
  const sampleGiftId = Number(process.env.TEST_GIFT_ID || 1);

  test.describe("1. Auth & Path Parameter Validation (GET /gifts/:id)", () => {
    for (const tc of createAuthTestCases()) {
      test(`[AF300-API-AUTH] ${tc.tcId}: ${tc.title}`, async ({ unauthenticatedRequest }) => {
        const api = new AF300GiftDetailAPI(unauthenticatedRequest);
        const res = await api.getGiftDetail(sampleGiftId, { headers: tc.headers });
        expect([401, 403]).toContain(res.status());
      });
    }

    for (const tc of apiAf300Data.invalidPathIdCases) {
      test(`${tc.tcId} (${tc.vpId}): GET /gifts/${tc.id}`, async ({ authenticatedRequest }) => {
        const api = new AF300GiftDetailAPI(authenticatedRequest);
        const res = await api.getGiftDetail(tc.id);
        expect(tc.expectedStatus).toContain(res.status());
      });
    }
  });

  test.describe("2. PUT / PATCH /gifts/:id — Update Validation (UPD / BODY)", () => {
    for (const tc of apiAf300Data.putInvalidJsonCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF300GiftDetailAPI(authenticatedRequest);
        const res = await api.updateGift(sampleGiftId, {
          method: "PUT",
          payload: tc.raw,
          headers: { "Content-Type": "application/json" },
        });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    test("[AF300-API-18][AF300-API-19]: PUT thiếu required field & ID không tồn tại", async ({ authenticatedRequest }) => {
      const api = new AF300GiftDetailAPI(authenticatedRequest);
      const missingRes = await api.updateGift(sampleGiftId, { payload: { coin_price: 200 } });
      expect([400, 422]).toContain(missingRes.status());

      const notFoundRes = await api.updateGift(999999, { payload: buildGiftUpdatePayload() });
      expect(notFoundRes.status()).toBe(404);
    });

    for (const tc of apiAf300Data.patchNegativeCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF300GiftDetailAPI(authenticatedRequest);
        const res = await api.updateGift(sampleGiftId, { method: "PATCH", payload: tc.payload });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }
  });

  test.describe("3. DELETE /gifts/:id — Delete & Collection Guard (DEL)", () => {
    test("[AF300-API-32]: Thiếu Authorization khi DELETE trả 401", async ({ unauthenticatedRequest }) => {
      const api = new AF300GiftDetailAPI(unauthenticatedRequest);
      const res = await api.deleteGift(sampleGiftId);
      expect(res.status()).toBe(401);
    });

    for (const tc of apiAf300Data.deleteInvalidCases) {
      test(`${tc.tcId} (${tc.vpId}): DELETE /gifts/${tc.id}`, async ({ authenticatedRequest }) => {
        const api = new AF300GiftDetailAPI(authenticatedRequest);
        const res = await api.deleteGift(tc.id);
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    test("[AF300-API-40] (DEL-007): DELETE trực tiếp trên collection trả 405", async ({ authenticatedRequest }) => {
      const api = new AF300GiftDetailAPI(authenticatedRequest);
      const res = await api.deleteCollection();
      expect([404, 405]).toContain(res.status());
    });
  });
});
