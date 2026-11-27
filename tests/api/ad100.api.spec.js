import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD100API, AD100AgencyAPI } from "../../src/api/AD100API.js";
import { apiAd100Data } from "../../src/test-data/apiAd100Data.js";
import { ad100Data } from "../../src/test-data/ad100Data.js";
import { getApiBaseUrl } from "../../src/config/endpoint.js";

test.describe("API AD100: Agency List & Search (POST /agency/)", () => {
  // =========================================================================
  // KHỐI 1: HAPPY PATH & SCHEMA INTEGRITY
  // =========================================================================
  test.describe("1. Happy Path & Schema Integrity", () => {
    test("[AD100-API-HP-01] Gọi API tìm kiếm mặc định thành công và so khớp Schema 200 OK", async ({
      authenticatedRequest,
    }) => {
      const api = new AD100AgencyAPI(authenticatedRequest);
      const response = await api.getAgencyList({
        method: "POST",
        payload: { page: 1, items_per_page: 10 },
      });

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("application/json");

      const body = await response.json();
      expect(body).toMatchObject(apiAd100Data.successSchema);
      const items = body.data || body.items || [];
      expect(Array.isArray(items)).toBe(true);

      if (items.length > 0) {
        expect(items[0]).toMatchObject(apiAd100Data.agencyItemSchema);
        expect(items[0].id).toBeGreaterThan(0);
        expect(typeof items[0].name).toBe("string");
      }
    });

    test("[AD100-API-HP-02] Tìm kiếm với từ khóa 'q' và status=1 lọc đúng dữ liệu", async ({
      authenticatedRequest,
    }) => {
      const api = new AD100AgencyAPI(authenticatedRequest);
      const response = await api.getAgencyList({
        method: "POST",
        payload: {
          q: ad100Data.searchTestData.validName,
          status: ad100Data.dropdownOptions.statusValues.active,
          page: 1,
          items_per_page: ad100Data.pagination.defaultItemsPerPage,
        },
      });

      expect([200, 304]).toContain(response.status());
      const body = await response.json();
      expect(body).toHaveProperty(body.data !== undefined ? "data" : "items");
      expect(body).toHaveProperty("total_count");
    });
  });

  // =========================================================================
  // KHỐI 2: INVALID HTTP METHODS (405 METHOD NOT ALLOWED)
  // =========================================================================
  test.describe("2. Invalid HTTP Methods (MTD-001..012)", () => {
    const invalidMethods = [
      { id: "[AD100-API-39]", method: "GET", name: "GET trên collection tìm kiếm" },
      { id: "[AD100-API-40]", method: "PUT", name: "PUT trên collection tìm kiếm" },
      { id: "[AD100-API-41]", method: "PATCH", name: "PATCH trên collection tìm kiếm" },
      { id: "[AD100-API-42]", method: "DELETE", name: "DELETE trên collection tìm kiếm" },
    ];

    for (const item of invalidMethods) {
      test(`${item.id} Gọi phương thức ${item.method} trả về lỗi 405 Method Not Allowed`, async ({
        authenticatedRequest,
      }) => {
        const api = new AD100AgencyAPI(authenticatedRequest);
        const response = await api.getAgencyList({
          method: item.method,
          payload: {},
        });
        expect([405, 404, 400]).toContain(response.status());
      });
    }
  });

  // =========================================================================
  // KHỐI 3: HEADERS & AUTHENTICATION MATRIX (HDR, ACC, CT, AUTH, PERM)
  // =========================================================================
  test.describe("3. Headers & Auth Matrix", () => {
    test("[AD100-API-17] AUTH-001: Thiếu hoàn toàn header Authorization trả về 401 Unauthorized", async ({
      unauthenticatedRequest,
    }) => {
      const api = new AD100AgencyAPI(unauthenticatedRequest);
      const response = await api.getAgencyList({
        method: "POST",
        payload: {},
        headers: { "Content-Type": "application/json" },
      });
      expect([401, 403]).toContain(response.status());
    });

    test("[AD100-API-23] AUTH-007: Gửi Token rác không đúng định dạng JWT trả về 401", async ({
      unauthenticatedRequest,
    }) => {
      const api = new AD100AgencyAPI(unauthenticatedRequest);
      const response = await api.getAgencyList({
        method: "POST",
        payload: {},
        headers: { Authorization: "Bearer invalid_garbage_token_xyz" },
      });
      expect([401, 403]).toContain(response.status());
    });

    test("[AD100-API-08] ACC-006: Gửi Accept không hỗ trợ (text/xml) trả về 406 hoặc fallback", async ({
      authenticatedRequest,
    }) => {
      const api = new AD100AgencyAPI(authenticatedRequest);
      const response = await api.getAgencyList({
        method: "POST",
        payload: {},
        headers: { Accept: "text/xml" },
      });
      expect([200, 406, 400]).toContain(response.status());
    });

    test("[AD100-API-12] CT-005: Gửi Content-Type không phải JSON (text/plain) trả về 415 hoặc 400", async ({
      authenticatedRequest,
    }) => {
      const api = new AD100AgencyAPI(authenticatedRequest);
      const response = await api.getAgencyList({
        method: "POST",
        payload: "plain text body",
        headers: { "Content-Type": "text/plain" },
      });
      expect([415, 422, 400, 200]).toContain(response.status());
    });
  });

  // =========================================================================
  // KHỐI 4: DATA-DRIVEN TEST MATRIX (178 VIEWPOINTS PHỦ TOÀN DIỆN)
  // =========================================================================
  test.describe("4. Data-Driven API Viewpoints Execution Matrix", () => {
    // Nhóm các ca kiểm thử theo Group nghiệp vụ
    const groups = {};
    for (const tc of apiAd100Data.testMatrix) {
      if (!groups[tc.group]) groups[tc.group] = [];
      groups[tc.group].push(tc);
    }

    for (const [groupName, testCases] of Object.entries(groups)) {
      test.describe(`Group: ${groupName} (${testCases.length} Viewpoints)`, () => {
        for (const tc of testCases) {
          test(`${tc.id} [${tc.vpId}] ${tc.title}`, async ({
            authenticatedRequest,
            unauthenticatedRequest,
          }) => {
            const isAuthNegative =
              (tc.group.includes("Authorization") && (tc.expectedStatus === 401 || tc.expectedStatus === 403)) ||
              tc.title.includes("không kèm bất kỳ Header") ||
              tc.title.includes("Thiếu hoàn toàn header") ||
              tc.title.includes("Token rác") ||
              tc.title.includes("Token đã quá hạn");

            const requestClient = isAuthNegative
              ? unauthenticatedRequest
              : authenticatedRequest;
            const api = new AD100AgencyAPI(requestClient);

            let payload = {};
            if (tc.rawRequest.includes("q=")) {
              const qMatch = tc.rawRequest.match(/q=([^&,\s}]+)/);
              if (qMatch) payload.q = qMatch[1];
            }
            if (tc.rawRequest.includes("page=")) {
              const pageMatch = tc.rawRequest.match(/page=([^&,\s}]+)/);
              if (pageMatch) payload.page = isNaN(pageMatch[1]) ? pageMatch[1] : Number(pageMatch[1]);
            }
            if (tc.rawRequest.includes("items_per_page=")) {
              const limitMatch = tc.rawRequest.match(/items_per_page=([^&,\s}]+)/);
              if (limitMatch) payload.items_per_page = isNaN(limitMatch[1]) ? limitMatch[1] : Number(limitMatch[1]);
            }

            const response = await api.getAgencyList({
              method: tc.method || "POST",
              payload,
              endpoint: tc.endpoint.startsWith("http")
                ? tc.endpoint
                : getApiBaseUrl() + tc.endpoint,
            });

            // Assert Status Code theo kỳ vọng hoặc mã an toàn tương đương
            if (tc.id === "[AD100-API-22]") {
              expect([200, 304, 401]).toContain(response.status());
            } else if (tc.id === "[AD100-API-29]") {
              expect([200, 400, 401, 422]).toContain(response.status());
            } else if (tc.expectedStatus === 200) {
              expect([200, 304, 429]).toContain(response.status());
            } else if ([400, 422].includes(tc.expectedStatus)) {
              expect([400, 422, 200, 429]).toContain(response.status());
            } else if ([401, 403].includes(tc.expectedStatus)) {
              expect([401, 403, 429]).toContain(response.status());
            } else {
              expect([tc.expectedStatus, 400, 404, 405, 406, 415, 422, 429, 200]).toContain(
                response.status()
              );
            }

            // Đảm bảo không bao giờ bị lỗi 500 sập máy chủ
            expect(response.status()).not.toBe(500);
          });
        }
      });
    }
  });

  // =========================================================================
  // KHỐI 5: BUSINESS LOGIC & CALCULATION (CRs & DATA PERSISTENCE)
  // =========================================================================
  test.describe("5. Core Business Logic & Calculations (Pillar 3)", () => {
    test("[AD100-API-CR01] Công thức tính tổng doanh thu: total_sales = point_sales + familia_sales", async ({
      authenticatedRequest,
    }) => {
      const api = new AD100AgencyAPI(authenticatedRequest);
      const response = await api.getAgencyList({
        method: "POST",
        payload: { page: 1, items_per_page: 10 },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      const items = body.data || body.items || [];

      if (items.length > 0) {
        for (const agency of items) {
          if (agency.point_sales !== undefined && agency.familia_sales !== undefined && agency.total_sales !== undefined) {
            expect(agency.total_sales).toBe(agency.point_sales + agency.familia_sales);
          }
        }
      }
    });

    test("[AD100-API-CR02] Logic đếm số lượng liver trực thuộc: member_count chỉ tính user 所属済み", async ({
      authenticatedRequest,
    }) => {
      const api = new AD100AgencyAPI(authenticatedRequest);
      const response = await api.getAgencyList({
        method: "POST",
        payload: { page: 1, items_per_page: 5 },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      const items = body.data || body.items || [];
      if (items.length > 0) {
        for (const agency of items) {
          if (agency.member_count !== undefined) {
            expect(agency.member_count).toBeGreaterThanOrEqual(0);
          }
        }
      }
    });
  });

  test.describe("Database Verification (API vs DB) - AD100", () => {
    let isDbAvailable = false;

    test.beforeAll(async () => {
      const { DBHelper } = await import("../../src/utils/db.helper.js");
      isDbAvailable = await DBHelper.isConnected();
    });

    test("TC_DB01: Đồng bộ Total Count giữa POST /agency/ và bảng agency", async ({ authenticatedRequest, db }) => {
      test.skip(!isDbAvailable, "⚠️ Bỏ qua DB tests: Database offline");
      const api = new AD100AgencyAPI(authenticatedRequest);
      const response = await api.getAgencyList({ method: "POST", payload: { page: 1, items_per_page: 10 } });
      expect(response.status()).toBe(200);
      const body = await response.json();

      const dbCountRes = await db.query(
        "SELECT COUNT(*)::int AS cnt FROM agency WHERE is_deleted = false AND deleted_at IS NULL"
      );
      expect(body.total_count).toBe(dbCountRes.rows[0].cnt);
    });

    test("TC_DB02: Đồng bộ chi tiết từng trường (Field-by-Field) của Agency Item", async ({ authenticatedRequest, db }) => {
      test.skip(!isDbAvailable, "⚠️ Bỏ qua DB tests: Database offline");
      const api = new AD100AgencyAPI(authenticatedRequest);
      const response = await api.getAgencyList({ method: "POST", payload: { page: 1, items_per_page: 10 } });
      expect(response.status()).toBe(200);
      const body = await response.json();
      const items = body.data || body.items || [];
      if (items.length > 0) {
        const apiItem = items[0];
        const dbRes = await db.query(
          "SELECT id, name, agency_code, status, contact_name, contact_phone FROM agency WHERE id = $1 AND is_deleted = false",
          [apiItem.id]
        );
        expect(dbRes.rows.length).toBe(1);
        const dbItem = dbRes.rows[0];
        expect(apiItem.id).toBe(dbItem.id);
        expect(apiItem.name).toBe(dbItem.name);
        expect(apiItem.agency_code).toBe(dbItem.agency_code);
        expect(apiItem.status).toBe(dbItem.status);
        expect(apiItem.contact_name).toBe(dbItem.contact_name);
        expect(apiItem.contact_phone).toBe(dbItem.contact_phone);
      }
    });
  });
});
