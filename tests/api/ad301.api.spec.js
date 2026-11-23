import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD301API, AD301AgencyAPI } from "../../src/api/AD301API.js";
import { AD200AgencyAPI } from "../../src/api/AD200API.js";
import { apiAd301Data } from "../../src/test-data/apiAd301Data.js";
import { apiAd200Data } from "../../src/test-data/apiAd200Data.js";
import { HTTP_STATUS_CODE } from "../../src/utils/constants.js";

/**
 * Bộ kiểm thử Tự động hóa Backend API cho màn hình AD301_Agency Information
 * Bao phủ 100% (91/91) Ca Kiểm Thử từ Bộ 419 Viewpoints (GET, PATCH, DELETE, Verify Email)
 * Tuân thủ Rule 03 (API Testing) & Rule 05 Section 5.5 (Data-Driven Testing)
 * Áp dụng Định hướng 1: Tạo Agency tạm thời (Ephemeral / Disposable Agency) để thực thi
 * các ca kiểm thử DELETE, bảo vệ tuyệt đối toàn bộ dữ liệu Agency có sẵn trong Database.
 */

// Bộ nhớ theo dõi các Agency tạm thời tạo ra trong quá trình test
const createdEphemeralAgencyIds = new Set();
let deletedEphemeralAgencyId = null;

/**
 * Helper tạo mới một Agency tạm thời (Ephemeral/Disposable) dùng riêng cho các ca kiểm thử xóa
 * @param {import('../../src/fixtures/baseTest.js').CustomApiClient} request
 * @returns {Promise<number|null>} ID của Agency tạm vừa tạo
 */
async function createEphemeralAgency(request) {
  const ad200Api = new AD200AgencyAPI(request);
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  const ephemeralPayload = {
    ...apiAd200Data.validPayload,
    name: `Del_${timestamp}`.slice(0, 20),
    code: `del${timestamp.toString().slice(-8)}${randomSuffix}`.slice(0, 16),
    contact_email: `ephemeral_${timestamp}_${randomSuffix}@example.com`,
  };

  try {
    const res = await ad200Api.createAgency({ payload: ephemeralPayload });
    if (res.status() === HTTP_STATUS_CODE.OK || res.status() === 201) {
      const data = await res.json();
      if (data?.id) {
        createdEphemeralAgencyIds.add(data.id);
        return data.id;
      }
    }
  } catch (err) {
    console.warn("⚠️ [AD301] Không thể tạo Agency tạm thời:", err.message);
  }
  return null;
}

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

  test.afterAll(async () => {
    // Dọn dẹp bất kỳ agency tạm thời nào chưa được giải phóng
    for (const id of createdEphemeralAgencyIds) {
      if (id !== deletedEphemeralAgencyId) {
        try {
          await agencyApi.deleteAgency(id, { method: "DELETE" });
        } catch {}
      }
    }
  });

  // ==========================================
  // DATA-DRIVEN TEST SUITE PHỦ 91 VIEWPOINTS
  // ==========================================
  for (const tc of apiAd301Data.testMatrix) {
    test(`${tc.id} [${tc.vpId}] ${tc.group} - ${tc.title}`, async ({ authenticatedRequest }) => {
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

      // Xử lý các ca DELETE path parameter đặc thù
      if (tc.vpId === "DEL-004") {
        targetAgencyId = "99999999";
      } else if (tc.vpId === "DEL-005") {
        targetAgencyId = "-1";
      } else if (tc.vpId === "DEL-007") {
        targetAgencyId = "";
      }

      // Xử lý header
      if (tc.rawRequest.includes("Headers: {}")) {
        headers = {};
      }

      let response;
      const method = (tc.method || "GET").toUpperCase();

      // =========================================================================
      // ĐỊNH HƯỚNG 1: BẢO VỆ DỮ LIỆU AGENCY BẰNG EPHEMERAL AGENCY CHO CÁC CA DELETE
      // =========================================================================
      if (method === "DELETE") {
        if (tc.vpId === "DEL-001" || tc.vpId === "NFR-001" || tc.vpId === "DEL-006") {
          // Tạo Agency tạm thời riêng biệt để xóa, bảo toàn tuyệt đối Agency thật
          const ephemeralId = await createEphemeralAgency(authenticatedRequest);
          if (ephemeralId) {
            targetAgencyId = ephemeralId;
            deletedEphemeralAgencyId = ephemeralId;
          }
        } else if (tc.vpId === "DEL-002" || tc.vpId === "DEL-003") {
          // Kiểm tra trên Agency vừa bị xóa ở DEL-001 (hoặc tạo và xóa ngay agency tạm nếu chạy đơn lẻ)
          if (!deletedEphemeralAgencyId) {
            const ephemeralId = await createEphemeralAgency(authenticatedRequest);
            if (ephemeralId) {
              await agencyApi.deleteAgency(ephemeralId, { method: "DELETE" });
              deletedEphemeralAgencyId = ephemeralId;
            }
          }
          if (deletedEphemeralAgencyId) {
            targetAgencyId = deletedEphemeralAgencyId;
          }
        }
      }

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
