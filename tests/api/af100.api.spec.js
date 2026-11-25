import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF100GiftListAPI } from "../../src/api/AF100API.js";
import { apiAf100Data } from "../../src/test-data/apiAf100Data.js";
import { createAuthTestCases, commonAcceptTestCases } from "../../src/test-data/commonApiData.js";

test.describe("API AF100: Gift List & Toggle Status (GET /gifts & PATCH /gifts/:id/status)", () => {
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
    for (const method of ["PUT", "DELETE", "OPTIONS"]) {
      test(`[AF100-API-MTD] Method ${method} trên collection /gifts`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ method });
        if (method === "OPTIONS") {
          expect([200, 204]).toContain(res.status());
        } else {
          expect([405, 404, 400]).toContain(res.status());
        }
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

  test.describe("3. Search, Category & Status Filters (STR / INT / ENUM)", () => {
    for (const tc of apiAf100Data.searchQueryCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ queryParams: { q: tc.q } });
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
        const res = await api.getGiftList({ queryParams: { category_id: tc.category_id } });
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
  });

  test.describe("4. Pagination, Sorting, Schema & Security (LIM / PAGE / SORT / RESP / SEC)", () => {
    for (const tc of apiAf100Data.paginationCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ queryParams: tc.params });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    for (const tc of apiAf100Data.sortingCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ queryParams: tc.params });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    for (const tc of apiAf100Data.securityCases) {
      test(`${tc.tcId} (${tc.vpId}): ${tc.title}`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.getGiftList({ queryParams: tc.params });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }

    test("[AF100-API-61] (RESP-001): Kiểm tra Schema & Response Time (NFR-001)", async ({ authenticatedRequest }) => {
      const api = new AF100GiftListAPI(authenticatedRequest);
      const start = Date.now();
      const res = await api.getGiftList({ queryParams: { page: 1, limit: 10 } });
      expect(Date.now() - start).toBeLessThan(5000);
      expect(res.status()).toBe(200);
      const body = await res.json();
      const items = body.data || body.items || [];
      if (items.length > 0) {
        expect(items[0]).toMatchObject(apiAf100Data.giftItemSchema);
      }
    });
  });

  test.describe("5. PATCH /api/v1/admin/gifts/:id/status — Toggle ON/OFF", () => {
    test("[AF100-API-68]: Thiếu Authorization khi PATCH status trả 401", async ({ unauthenticatedRequest }) => {
      const api = new AF100GiftListAPI(unauthenticatedRequest);
      const res = await api.toggleGiftStatus(1, { payload: { status: "inactive" } });
      expect(res.status()).toBe(401);
    });

    for (const tc of apiAf100Data.patchStatusInvalidCases) {
      test(`${tc.tcId} (${tc.vpId}): PATCH status negative`, async ({ authenticatedRequest }) => {
        const api = new AF100GiftListAPI(authenticatedRequest);
        const res = await api.toggleGiftStatus(tc.id, {
          payload: tc.rawBody !== undefined ? tc.rawBody : tc.body,
          headers: { "Content-Type": "application/json" },
        });
        expect(tc.expectedStatus).toContain(res.status());
      });
    }
  });
});
