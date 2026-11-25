import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF200GiftCreateAPI } from "../../src/api/AF200API.js";
import { apiAf200Data, buildGiftPayload } from "../../src/test-data/apiAf200Data.js";
import { createAuthTestCases } from "../../src/test-data/commonApiData.js";

test.describe("API AF200: Gift Create & Upload Asset (POST /gifts & POST /gifts/upload-asset)", () => {
  test.describe("1. Auth, Content-Type & Invalid JSON Body (AUTH / CT / BODY)", () => {
    for (const tc of createAuthTestCases()) {
      test(`[AF200-API-AUTH] ${tc.tcId}: ${tc.title}`, async ({ unauthenticatedRequest }) => {
        const api = new AF200GiftCreateAPI(unauthenticatedRequest);
        const res = await api.createGift({ payload: buildGiftPayload(), headers: tc.headers });
        expect([401, 403]).toContain(res.status());
      });
    }

    for (const ct of ["", "text/plain", "text/xml"]) {
      test(`[AF200-API-CT] Content-Type='${ct}' trả 415/400`, async ({ authenticatedRequest }) => {
        const api = new AF200GiftCreateAPI(authenticatedRequest);
        const res = await api.createGift({
          payload: JSON.stringify(buildGiftPayload()),
          headers: { "Content-Type": ct },
        });
        expect([400, 415]).toContain(res.status());
      });
    }

    for (const tc of apiAf200Data.invalidJsonPayloads) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF200GiftCreateAPI(authenticatedRequest);
        const res = await api.createGift({
          payload: tc.raw,
          headers: { "Content-Type": "application/json" },
        });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }
  });

  test.describe("2. Required Fields & Field-Level Validation (REQ / STR / INT / ENUM / SEC)", () => {
    for (const tc of apiAf200Data.requiredFieldCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF200GiftCreateAPI(authenticatedRequest);
        let payload = tc.payload;
        if (!payload && tc.omitField) {
          payload = buildGiftPayload();
          delete payload[tc.omitField];
        }
        const res = await api.createGift({ payload });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    for (const tc of apiAf200Data.fieldValidationCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF200GiftCreateAPI(authenticatedRequest);
        const payload = buildGiftPayload(tc.overrides);
        const res = await api.createGift({ payload });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }
  });

  test.describe("3. Happy Path, Read-Only Ignore & Double Submit (CRE-001..007)", () => {
    test("[AF200-API-13][AF200-API-42][AF200-API-43]: Tạo mới thành công, server tự sinh ID & bỏ qua read-only fields", async ({
      authenticatedRequest,
    }) => {
      const api = new AF200GiftCreateAPI(authenticatedRequest);
      const payload = buildGiftPayload({ id: 999999, created_at: "2000-01-01T00:00:00Z" });
      const res = await api.createGift({ payload });
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      const createdId = body.id || body.data?.id;
      expect(createdId).not.toBe(999999);
    });
  });

  test.describe("4. POST /api/v1/admin/gifts/upload-asset — File Upload (FILE-001..024)", () => {
    test("[AF200-API-48]: Thiếu Authorization khi upload trả 401", async ({ unauthenticatedRequest }) => {
      const api = new AF200GiftCreateAPI(unauthenticatedRequest);
      const res = await api.uploadAsset({
        multipart: { file: { name: "icon.png", mimeType: "image/png", buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]) } },
      });
      expect(res.status()).toBe(401);
    });

    test("[AF200-API-49]: Gửi application/json lên multipart endpoint trả 415/400", async ({ authenticatedRequest }) => {
      const api = new AF200GiftCreateAPI(authenticatedRequest);
      const res = await api.uploadAsset({ data: {}, headers: { "Content-Type": "application/json" } });
      expect([400, 415]).toContain(res.status());
    });

    for (const tc of apiAf200Data.uploadValidationCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF200GiftCreateAPI(authenticatedRequest);
        const res = await api.uploadAsset({
          multipart: { file: { name: tc.filename, mimeType: tc.mimeType, buffer: tc.buffer } },
        });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }
  });
});
