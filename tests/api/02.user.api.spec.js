import { test, expect } from "../../src/fixtures/baseTest.js";
import { UserAPI } from "../../src/api/UserAPI.js";
import { userData } from "../../src/test-data/apiUserData.js";
import { loadUserListCsvCases } from "../../src/utils/csvHelper.js";
import { METHODS } from "../../src/utils/constants.js";
import { generateOtherMethodNotChoose } from "../../src/utils/helpers.js";

const csvTestCases = loadUserListCsvCases("src/test-data/csv/getListUser.csv");

test.describe("API GET List User Test Suite", () => {
  test.describe("1. Happy Path Cases", () => {
    let userApi;

    test.beforeEach(async ({ authenticatedRequest }) => {
      userApi = new UserAPI(authenticatedRequest);
    });

    test("Get user list successfully and verify full integrity (Schema, Pagination, DB)", async () => {
      const queryParams = userData.defaultParams;

      const response = await userApi.getUsers({
        method: METHODS.GET,
        queryParams: queryParams,
      });

      expect(response.status()).toBe(userData.expectedResponses.success.status);
      expect(response.headers()["content-type"]).toContain("application/json");

      const body = await response.json();

      expect(body).toMatchObject({
        page: queryParams.page,
        items_per_page: queryParams.items_per_page,
        total_count: expect.any(Number),
        has_more: expect.any(Boolean),
        data: expect.any(Array),
      });
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data.length).toBeLessThanOrEqual(queryParams.items_per_page);

      const randomIndex = Math.floor(Math.random() * body.data.length);
      const apiUser = body.data[randomIndex];

      expect(apiUser).toMatchObject({
        user_id: expect.any(Number),
        user_uid: expect.any(String),
        user_name: expect.any(String),
        agency_id: apiUser.agency_id === null ? null : expect.any(Number),
        agency_name: apiUser.agency_name === null ? null : expect.any(String),
        streamer_type: expect.any(Number),
        agency_status: expect.any(Number),
        created_at: expect.any(String),
        last_login_at: expect.any(String),
        last_livestream_at:
          apiUser.last_livestream_at === null ? null : expect.any(String),
        status: expect.any(Number),
        can_livestream: expect.any(Boolean),
        following_count: expect.any(Number),
        follower_count: expect.any(Number),
        familia_member_count: expect.any(Number),
        livestream_like_count: expect.any(Number),
        livestream_duration: expect.any(Number),
        normal_livestream_duration: expect.any(Number),
        two_shot_livestream_duration: expect.any(Number),
        familia_livestream_duration: expect.any(Number),
        karaoke_livestream_duration: expect.any(Number),
        broadcast_livestream_duration: expect.any(Number),
        obs_livestream_duration: expect.any(Number),
        point_sales: expect.any(Number),
        two_shot_sales: expect.any(Number),
        gift_sales: expect.any(Number),
        whisper_sales: expect.any(Number),
        yell_sales: expect.any(Number),
        familia_sales: expect.any(Number),
        total_sales: expect.any(Number),
        ekyc_status: expect.any(Number),
        ocr_status: apiUser.ocr_status === null ? null : expect.any(Number),
      });
    });
  });

  test.describe("2. Invalid Method Cases (405 Method Not Allowed)", () => {
    let userApi;

    test.beforeEach(async ({ authenticatedRequest }) => {
      userApi = new UserAPI(authenticatedRequest);
    });

    const invalidMethods = generateOtherMethodNotChoose(METHODS.GET);

    invalidMethods.forEach((method, index) => {
      test(`Case ${index + 1}: Get user list failed with ${method} method`, async () => {
        const response = await userApi.getUsers({
          method,
          queryParams: userData.defaultParams,
        });

        const {
          status,
          contentType,
          body: expectedBody,
        } = userData.expectedResponses.invalidMethod;

        expect(response.status()).toBe(status);
        if (contentType) {
          expect(response.headers()["content-type"]).toContain(contentType);
        }
        if (expectedBody) {
          const body = await response.json();
          expect(body.detail).toBe(expectedBody.detail);
        }
      });
    });
  });

  // =========================================================================
  // 3. ACCEPT & AUTHORIZATION HEADERS TESTING (Data-Driven from userData.js)
  // =========================================================================
  test.describe("3. Accept & Authorization Header Cases", () => {
    // -----------------------------------------------------------------------
    // 3.1. Accept Header Cases (Dùng authenticatedRequest)
    // -----------------------------------------------------------------------
    test.describe("3.1. Accept Header Cases", () => {
      let userApi;

      test.beforeEach(async ({ authenticatedRequest }) => {
        userApi = new UserAPI(authenticatedRequest);
      });

      (userData.acceptTestCases || []).forEach(
        ({ tcId, title, headers, expectedStatus }) => {
          test(`[${tcId}] ${title}`, async () => {
            const response = await userApi.getUsers({
              method: "GET",
              queryParams: userData.defaultParams,
              headers,
            });

            // Assert Status Code thuộc mảng cho phép (vd: [200] hoặc [200, 406])
            expect(expectedStatus).toContain(response.status());
          });
        },
      );
    });

    // -----------------------------------------------------------------------
    // 3.2. Authorization & Role Cases (Dùng unauthenticatedRequest)
    // -----------------------------------------------------------------------
    test.describe("3.2. Authorization & Role Cases", () => {
      let userApi;

      test.beforeEach(async ({ unauthenticatedRequest }) => {
        // Dùng unauthenticatedRequest để chủ động ghi đè/bỏ qua Authorization Header
        userApi = new UserAPI(unauthenticatedRequest);
      });

      (userData.authTestCases || []).forEach(
        ({ tcId, title, headers, expectedStatus }) => {
          test(`[${tcId}] ${title} should return ${expectedStatus}`, async () => {
            const response = await userApi.getUsers({
              method: "GET",
              queryParams: userData.defaultParams,
              headers,
            });

            // Assert Status Code (401 Unauthorized / 403 Forbidden)
            expect(response.status()).toBe(expectedStatus);

            // Assert Response Body chứa thông báo lỗi detail
            const body = await response.json();
            expect(body).toHaveProperty("detail");
          });
        },
      );
    });
  });

  // =========================================================================
  // 4. QUERY PARAMETERS TESTING (Data-Driven from CSV)
  // =========================================================================
  test.describe("4. Query Parameters Cases (Data-Driven from CSV)", () => {
    let userApi;

    test.beforeEach(async ({ authenticatedRequest }) => {
      userApi = new UserAPI(authenticatedRequest);
    });

    csvTestCases.forEach(
      ({ tcId, testName, method, headers, queryParams, expectedStatus }) => {
        test(`[${tcId}] ${testName}`, async () => {
          const response = await userApi.getUsers({
            method,
            queryParams,
            headers,
          });

          // 4.1. Assert Status Code
          expect(response.status()).toBe(expectedStatus);

          // 4.2. Dynamic Assert Response Body theo Status Code
          if (expectedStatus === userData.expectedResponses.success.status) {
            const body = await response.json();
            expect(body).toMatchObject(
              userData.expectedResponses.success.bodySchema,
            );
          } else if (expectedStatus === 422) {
            const body = await response.json();
            expect(body.detail[0]).toMatchObject({
              loc: ["query", expect.any(String)],
              msg: expect.any(String),
            });
          }
        });
      },
    );
  });
});
