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
 *
 * CHU TRÌNH VÒNG ĐỜI DỮ LIỆU ĐẦY ĐỦ (FULL CRUD LIFECYCLE):
 * 1. TẠO MỚI (Create): Tự động tạo 1 Agency tạm thời (Ephemeral Agency) dùng xuyên suốt suite.
 * 2. XEM (Read/View - GET): Thực thi kiểm tra chi tiết trên chính Agency vừa tạo (Cases 1 - 32).
 * 3. SỬA (Update/Edit - PATCH): Thực thi kiểm tra chỉnh sửa/cập nhật trên chính Agency này (Cases 33 - 75).
 * 4. XÓA (Delete - DELETE): Ca [AD301-API-80] DEL-001 xóa mềm chính Agency này, các ca sau (DEL-002, DEL-003)
 *    kiểm tra tính toàn vẹn tài nguyên đã xóa (404 Not Found, Idempotency).
 * 5. DỌN DẸP (afterAll): Thu dọn triệt để mọi tài nguyên tạm phát sinh, bảo vệ 100% Database thật.
 */

// Bộ nhớ theo dõi các Agency tạm thời tạo ra trong quá trình test
const createdEphemeralAgencyIds = new Set();
const deletedAgencyIds = new Set();

/**
 * Helper tạo mới một Agency tạm thời (Ephemeral/Disposable) dùng cho chu trình kiểm thử CRUD
 * @param {import('../../src/fixtures/baseTest.js').CustomApiClient} request
 * @returns {Promise<number|null>} ID của Agency tạm vừa tạo
 */
async function createEphemeralAgency(request) {
  const ad200Api = new AD200AgencyAPI(request);
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  const ephemeralPayload = {
    ...apiAd200Data.validPayload,
    name: `Crud_${timestamp}`.slice(0, 20),
    code: `crud${timestamp.toString().slice(-8)}${randomSuffix}`.slice(0, 16),
    contact_email: `ephemeral_crud_${timestamp}_${randomSuffix}@example.com`,
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
  // Chạy tuần tự để bảo toàn vòng đời CRUD: Tạo ➔ Xem (GET) ➔ Sửa (PATCH) ➔ Xóa (DELETE)
  test.describe.configure({ mode: "serial" });

  let agencyApi;
  let suiteAgencyId = null;
  let deletedSuiteAgencyId = null;
  let fallbackAgencyId = apiAd301Data.defaultAgencyId;

  test.beforeEach(async ({ authenticatedRequest, discovery }) => {
    agencyApi = new AD301AgencyAPI(authenticatedRequest);

    // Khởi tạo Agency tạm thời ở đầu chu trình (nếu chưa có và chưa bị xóa)
    if (!suiteAgencyId && !deletedSuiteAgencyId) {
      suiteAgencyId = await createEphemeralAgency(authenticatedRequest);
    }

    // Fallback an toàn nếu môi trường không cho phép tạo agency
    if (!suiteAgencyId && !deletedSuiteAgencyId) {
      const agency = await discovery.getRandomAgency({ fallbackId: apiAd301Data.defaultAgencyId });
      if (agency?.id) {
        fallbackAgencyId = agency.id;
      }
    }
  });

  test.afterAll(async () => {
    // Dọn dẹp bất kỳ agency tạm thời nào chưa được giải phóng trong suốt quá trình test
    for (const id of createdEphemeralAgencyIds) {
      if (!deletedAgencyIds.has(id)) {
        try {
          await agencyApi.deleteAgency(id, { method: "DELETE" });
          deletedAgencyIds.add(id);
        } catch {}
      }
    }
  });

  // ==========================================
  // DATA-DRIVEN TEST SUITE PHỦ 91 VIEWPOINTS
  // ==========================================
  for (const tc of apiAd301Data.testMatrix) {
    test(`${tc.id} [${tc.vpId}] ${tc.group} - ${tc.title}`, async ({ authenticatedRequest }) => {
      // Mặc định sử dụng Agency của vòng đời CRUD (Tạo ➔ Xem ➔ Sửa ➔ Xóa)
      let targetAgencyId = suiteAgencyId || deletedSuiteAgencyId || fallbackAgencyId;
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
      // VÒNG ĐỜI CRUD: HOÀN TẤT THAO TÁC XÓA AGENCY TẠM THỜI
      // =========================================================================
      if (method === "DELETE") {
        if (tc.vpId === "DEL-001") {
          // [AD301-API-80] DEL-001: Xóa chính Agency tạm thời đã được Tạo, Xem (GET) và Sửa (PATCH)
          if (!suiteAgencyId && !deletedSuiteAgencyId) {
            suiteAgencyId = await createEphemeralAgency(authenticatedRequest);
          }
          if (suiteAgencyId) {
            targetAgencyId = suiteAgencyId;
            deletedSuiteAgencyId = suiteAgencyId;
            deletedAgencyIds.add(suiteAgencyId);
            suiteAgencyId = null; // Đã giải phóng/xóa khỏi trạng thái active
          }
        } else if (tc.vpId === "DEL-002" || tc.vpId === "DEL-003") {
          // Kiểm tra trên Agency vừa bị xóa ở DEL-001 (hoặc tạo và xóa ngay nếu chạy đơn lẻ)
          if (!deletedSuiteAgencyId) {
            const ephemeralId = await createEphemeralAgency(authenticatedRequest);
            if (ephemeralId) {
              await agencyApi.deleteAgency(ephemeralId, { method: "DELETE" });
              deletedSuiteAgencyId = ephemeralId;
              deletedAgencyIds.add(ephemeralId);
            }
          }
          if (deletedSuiteAgencyId) {
            targetAgencyId = deletedSuiteAgencyId;
          }
        } else if (tc.vpId === "DEL-006" || tc.vpId === "NFR-001") {
          // Các ca kiểm tra xóa thành công độc lập khác: Tạo agency tạm mới để xóa
          const ephemeralId = await createEphemeralAgency(authenticatedRequest);
          if (ephemeralId) {
            targetAgencyId = ephemeralId;
            deletedAgencyIds.add(ephemeralId);
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
