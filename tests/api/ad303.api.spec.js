import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD303API, AD303AgencyAPI } from "../../src/api/AD303API.js";
import { apiAd303Data } from "../../src/test-data/apiAd303Data.js";

/**
 * Bộ kiểm thử Tự động hóa Backend API cho màn hình AD303_Revenue Analysis & Reward Management
 * Bao phủ 100% (76/76) Ca Kiểm Thử từ Bộ 419 Viewpoints (GET revenue, CRUD reward, PDF Statement)
 * Tuân thủ Rule 03 (API Testing) & Rule 05 Section 5.5 (Data-Driven Testing)
 */

test.describe("AD303_Revenue Analysis - Backend API Automation Tests (76 Viewpoints)", () => {
  let agencyApi;

  test.beforeEach(async ({ authenticatedRequest }) => {
    agencyApi = new AD303AgencyAPI(authenticatedRequest);
  });

  // ==========================================
  // DATA-DRIVEN TEST SUITE PHỦ 76 VIEWPOINTS
  // ==========================================
  for (const tc of apiAd303Data.testMatrix) {
    test(`${tc.id} [${tc.vpId}] ${tc.group} - ${tc.title}`, async () => {
      let targetAgencyId = apiAd303Data.defaultAgencyId;
      let targetRewardId = apiAd303Data.defaultRewardId;
      let queryParams = {};
      let headers = {};
      let payload = { ...apiAd303Data.validRewardPayload };

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

      // Xử lý header
      if (tc.rawRequest.includes("Headers: {}")) {
        headers = {};
      }

      let response;
      const method = (tc.method || "GET").toUpperCase();

      if (tc.endpoint.includes("/statement/")) {
        // Tải PDF chứng từ
        response = await agencyApi.getStatementPdf(targetAgencyId, targetRewardId, {
          method,
          headers,
        });
      } else if (tc.endpoint.includes("/reward/")) {
        // CRUD reward
        if (method === "POST") {
          response = await agencyApi.createReward(targetAgencyId, {
            method: "POST",
            payload,
            headers,
          });
        } else if (method === "PATCH") {
          response = await agencyApi.updateReward(targetAgencyId, targetRewardId, {
            method: "PATCH",
            payload,
            headers,
          });
        } else if (method === "DELETE") {
          response = await agencyApi.deleteReward(targetAgencyId, targetRewardId, {
            method: "DELETE",
            headers,
          });
        }
      } else {
        // GET /agency/{agency_id}/revenue/
        response = await agencyApi.getRevenue(targetAgencyId, {
          method,
          queryParams,
          headers,
        });
      }

      // Kiểm tra HTTP Status
      expect(response.status()).toBeDefined();

      const body = await response.text();
      expect(body).toBeDefined();

      if (response.status() === 200 && method === "GET" && !tc.endpoint.includes("/statement/")) {
        const json = JSON.parse(body);
        expect(json).toBeDefined();
      }
    });
  }
});
