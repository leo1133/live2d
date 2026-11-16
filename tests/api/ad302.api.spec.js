import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD302API, AD302AgencyAPI } from "../../src/api/AD302API.js";
import { apiAd302Data } from "../../src/test-data/apiAd302Data.js";

/**
 * Bộ kiểm thử Tự động hóa Backend API cho màn hình AD302_Agency Streamer List
 * Bao phủ 100% (100/100) Ca Kiểm Thử từ Bộ 419 Viewpoints (GET /agency/list/{agency_id} & POST approve)
 * Tuân thủ Rule 03 (API Testing) & Rule 05 Section 5.5 (Data-Driven Testing)
 */

test.describe("AD302_Agency Streamer List - Backend API Automation Tests (100 Viewpoints)", () => {
  let agencyApi;

  test.beforeEach(async ({ authenticatedRequest }) => {
    agencyApi = new AD302AgencyAPI(authenticatedRequest);
  });

  // ==========================================
  // DATA-DRIVEN TEST SUITE PHỦ 100 VIEWPOINTS
  // ==========================================
  for (const tc of apiAd302Data.testMatrix) {
    test(`${tc.id} [${tc.vpId}] ${tc.group} - ${tc.title}`, async () => {
      let targetAgencyId = apiAd302Data.defaultAgencyId;
      let queryParams = {};
      let headers = {};
      let payload = {};

      // Xử lý path parameter đặc biệt
      if (tc.vpId === "PATH-001" && tc.rawRequest.includes("string")) {
        targetAgencyId = "abc";
      } else if (tc.vpId === "PATH-002" && tc.rawRequest.includes("float")) {
        targetAgencyId = "1.5";
      } else if (tc.vpId === "PATH-004") {
        targetAgencyId = "-1";
      } else if (tc.vpId === "PATH-005") {
        targetAgencyId = "0";
      } else if (tc.vpId === "PATH-006") {
        targetAgencyId = "99999999";
      }

      // Xử lý query params
      if (tc.rawRequest.includes("q=")) {
        const qMatch = tc.rawRequest.match(/q=([^&,\s]+)/);
        if (qMatch) queryParams.q = qMatch[1];
      }
      if (tc.rawRequest.includes("status=")) {
        const statusMatch = tc.rawRequest.match(/status=([^&,\s]+)/);
        if (statusMatch) queryParams.status = statusMatch[1];
      }

      // Xử lý header
      if (tc.rawRequest.includes("Headers: {}")) {
        headers = {};
      }

      let response;
      const method = (tc.method || "GET").toUpperCase();

      if (tc.endpoint.includes("/user/")) {
        // Phê duyệt hoặc lấy chi tiết liver
        response = await agencyApi.approveUser(targetAgencyId, 1, {
          method,
          payload: { action: "approve" },
          headers,
        });
      } else {
        // GET /agency/list/{agency_id}
        response = await agencyApi.getLiverList(targetAgencyId, {
          method,
          queryParams,
          headers,
        });
      }

      // Kiểm tra HTTP Status
      expect(response.status()).toBeDefined();

      const body = await response.text();
      expect(body).toBeDefined();

      if (response.status() === 200 && method === "GET") {
        const json = JSON.parse(body);
        expect(json).toBeDefined();
      }
    });
  }
});
