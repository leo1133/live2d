import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF200GiftCreateAPI } from "../../src/api/AF200API.js";
import { apiAf200Data } from "../../src/test-data/apiAf200Data.js";
import { createAuthTestCases } from "../../src/test-data/commonApiData.js";

test.describe("API AF200: Gift Create (POST /gift/ & POST /gift/category/)", () => {
  test.describe("1. Auth & Body Structure (AUTH / BODY)", () => {
    for (const tc of createAuthTestCases()) {
      test(`[AF200-API-AUTH] ${tc.tcId}: ${tc.title}`, async ({ unauthenticatedRequest }) => {
        const api = new AF200GiftCreateAPI(unauthenticatedRequest);
        const res = await api.createGift({ payload: { name: "Test" }, headers: tc.headers });
        expect([401, 403]).toContain(res.status());
      });
    }

    for (const tc of apiAf200Data.bodyStructureCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF200GiftCreateAPI(authenticatedRequest);
        const res = await api.createGift({ payload: tc.payload });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }
  });

  test.describe("2. AF500 Animation Type & Required/Field Validation", () => {
    for (const tc of apiAf200Data.animationTypeInvalidCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF200GiftCreateAPI(authenticatedRequest);
        const res = await api.createGift({
          payload: { name: "AnimTest", animation_type: tc.animation_type, price: tc.price, sort_order: 1 },
        });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    for (const tc of apiAf200Data.fieldValidationCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF200GiftCreateAPI(authenticatedRequest);
        const res = await api.createGift({ payload: tc.payload });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }
  });

  test.describe("3. Inline Category Create (POST /gift/category/)", () => {
    test("[AF200-API-62] (AUTH-001): Thiếu token khi tạo category inline -> 401", async ({ unauthenticatedRequest }) => {
      const api = new AF200GiftCreateAPI(unauthenticatedRequest);
      const res = await api.createCategory({ payload: { name: "EventGift" } });
      expect([401, 403]).toContain(res.status());
    });

    for (const tc of apiAf200Data.categoryInlineCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF200GiftCreateAPI(authenticatedRequest);
        const res = await api.createCategory({ payload: tc.payload });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }
  });

  test.describe("4. Database Verification (API vs DB) - AF200", () => {
    let isDbAvailable = false;

    test.beforeAll(async () => {
      const { DBHelper } = await import("../../src/utils/db.helper.js");
      isDbAvailable = await DBHelper.isConnected();
    });

    test("TC_DB01: Tạo mới quà qua POST /gift/ lưu đúng bản ghi vào bảng gifts và cleanup", async ({ authenticatedRequest, db }) => {
      test.skip(!isDbAvailable, "⚠️ Bỏ qua DB tests: Database offline");
      const { buildGiftPayload } = await import("../../src/test-data/apiAf200Data.js");
      const { AF300GiftDetailAPI } = await import("../../src/api/AF300API.js");
      const api = new AF200GiftCreateAPI(authenticatedRequest);
      const detailApi = new AF300GiftDetailAPI(authenticatedRequest);
      const payload = buildGiftPayload();

      const createRes = await api.createGift({ payload });
      expect([200, 201]).toContain(createRes.status());

      const dbRes = await db.query(
        "SELECT id, name, price, sort_order, status, animation_type, is_deleted FROM gifts WHERE name = $1 AND is_deleted = false ORDER BY id DESC LIMIT 1",
        [payload.name]
      );
      expect(dbRes.rows.length).toBe(1);
      const row = dbRes.rows[0];
      expect(row.name).toBe(payload.name);
      expect(row.price).toBe(payload.price);
      expect(row.animation_type).toBe(payload.animation_type);
      expect(row.status).toBe(payload.status);

      await detailApi.deleteGift(row.id);
    });
  });
});
