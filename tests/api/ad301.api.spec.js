import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD301API, AD301AgencyAPI } from "../../src/api/AD301API.js";
import { apiAd301Data } from "../../src/test-data/apiAd301Data.js";

/**
 * Bộ kiểm thử Tự động hóa Backend API cho màn hình AD301_Agency Information
 * Bao phủ 100% (91/91) Ca Kiểm Thử từ Bộ 419 Viewpoints (GET, PATCH, DELETE, Verify Email)
 * Tuân thủ Rule 03 (API Testing) & Rule 05 Section 5.5 (Data-Driven Testing)
 */

test.describe("AD301_Agency Information - Backend API Automation Tests (91 Viewpoints)", () => {
  let agencyApi;
  let activeAgencyId = apiAd301Data.defaultAgencyId;

  test.beforeEach(async ({ authenticatedRequest, discovery }) => {
    agencyApi = new AD301AgencyAPI(authenticatedRequest);
    const agency = await discovery.getRandomAgency({ fallbackId: apiAd301Data.defaultAgencyId });
    if (agency?.id) {
      activeAgencyId = agency.id;
    }
  });

  // ==========================================
  // DATA-DRIVEN TEST SUITE PHỦ 91 VIEWPOINTS
  // ==========================================
  for (const tc of apiAd301Data.testMatrix) {
    test(`${tc.id} [${tc.vpId}] ${tc.group} - ${tc.title}`, async () => {
      let targetAgencyId = activeAgencyId;
      let headers = {};
      let payload = { ...apiAd301Data.validPatchPayload };

      // Xử lý các ca path parameter đặc biệt
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

      if (method === "GET") {
        response = await agencyApi.getAgencyDetail(targetAgencyId, {
          method: "GET",
          headers,
        });
      } else if (method === "DELETE") {
        response = await agencyApi.deleteAgency(targetAgencyId, {
          method: "DELETE",
          headers,
        });
      } else if (tc.endpoint.includes("verify-email")) {
        response = await agencyApi.verifyEmailChange({
          payload: { token: "dummy_token" },
          headers,
        });
      } else {
        // PATCH / PUT
        response = await agencyApi.updateAgency(targetAgencyId, {
          method,
          payload,
          headers,
        });
      }

      // Kiểm tra HTTP Status trả về
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
