import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF100GiftListAPI } from "../../src/api/AF100API.js";
import { apiAf100Data } from "../../src/test-data/apiAf100Data.js";
import { createAuthTestCases, commonAcceptTestCases } from "../../src/test-data/commonApiData.js";

test.describe("API AF100: Gift List & Delete (GET /gift/, DELETE /gift/{gift_id}/, GET /gift/category/)", () => {
  test.describe("1. Header, Accept & Auth Matrix (HDR / ACC / AUTH / PERM)", () => {
    for (const tc of createAuthTestCases()) {
      test(`[AF100-API-AUTH] ${tc.tcId}: ${tc.title}`, async ({ unauthenticatedRequest }) => {
        const api = new AF100GiftListAPI(unauthenticatedRequest);
        const res = await api.getGiftList({ headers: tc.headers });
        expect([401, 403]).toContain(res.status());
      });
    }

    for (const tc of commonAcceptTestCases) {
      test(`[AF100-API-ACC] ${tc.tcId}: ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ headers: tc.headers });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }
  });

  test.describe("2. HTTP Methods & Query Keys (MTD / KEY)", () => {
    for (const tc of apiAf100Data.invalidMethods) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ method: tc.method });
        expect([405, 404, 400]).toContain(res.status());
      });
    }

    for (const tc of apiAf100Data.queryKeyCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ queryParams: tc.params || {}, rawQuery: tc.rawQuery || "" });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }
  });

  test.describe("3. Search, Category, Status & Animation Type Filters", () => {
    for (const tc of apiAf100Data.searchQueryCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ queryParams: { keyword: tc.keyword } });
        expect(tc.expectedStatus).toContain(res.status());
        if (tc.expectEmpty && res.status() === 200) {
          const body = await res.json();
          const items = body.data || body.items || [];
          expect(items.length).toBe(0);
        }
      });
    }

    for (const tc of apiAf100Data.categoryFilterCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ queryParams: { category: tc.category } });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    for (const tc of apiAf100Data.statusFilterCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ queryParams: { status: tc.status } });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    for (const tc of apiAf100Data.animationTypeFilterCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ queryParams: { animation_type: tc.animation_type } });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }
  });

  test.describe("4. Pagination, Sorting, Delete & Category List", () => {
    for (const tc of apiAf100Data.paginationCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ queryParams: tc.params });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    for (const tc of apiAf100Data.sortCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ queryParams: tc.params });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    for (const tc of apiAf100Data.deleteInvalidCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.deleteGift(tc.giftId);
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    test("[AF100-API-62] (AUTH-001): GET /gift/category/ thiếu Authorization -> 401", async ({ unauthenticatedRequest }) => {
      const api = new AF100GiftListAPI(unauthenticatedRequest);
      const res = await api.getCategoryList();
      expect([401, 403]).toContain(res.status());
    });

    test("[AF100-API-64] (RESP-001): GET /gift/category/ trả về danh sách category -> 200", async ({ authenticatedRequest }) => {
      const api = new AF100GiftListAPI(authenticatedRequest);
      const res = await api.getCategoryList();
      expect(res.status()).toBe(200);
    });
  });
});
