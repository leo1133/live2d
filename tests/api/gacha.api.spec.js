import { test, expect } from "../../src/fixtures/baseTest.js";
import { GachaAPI } from "../../src/api/GachaAPI.js";
import { apiGachaData } from "../../src/test-data/apiGachaData.js";
import { loadGachaListCsvCases } from "../../src/utils/csvHelper.js";
import { METHODS } from "../../src/utils/constants.js";
import { generateOtherMethodNotChoose } from "../../src/utils/helpers.js";

const csvTestCases = loadGachaListCsvCases("src/test-data/csv/getListGacha.csv");

test.describe("API Gacha List", () => {
  // =========================================================================
  // 1. HAPPY PATH CASES
  // =========================================================================
  test.describe("1. Happy Path", () => {
    let gachaApi;

    test.beforeEach(async ({ authenticatedRequest }) => {
      gachaApi = new GachaAPI(authenticatedRequest);
    });

    test("TC01: Lấy danh sách thành công (Full Schema & Data)", async () => {
      const queryParams = apiGachaData.defaultParams;

      const response = await gachaApi.getGachas({
        method: METHODS.GET,
        queryParams: queryParams,
      });

      expect(response.status()).toBe(apiGachaData.expectedResponses.success.status);
      expect(response.headers()["content-type"]).toContain("application/json");

      const body = await response.json();

      expect(body).toMatchObject(apiGachaData.expectedResponses.success.bodySchema);
      expect(body.page).toBe(queryParams.page);
      expect(body.items_per_page).toBe(queryParams.items_per_page);
      expect(body.total_count).toBeGreaterThanOrEqual(0);

      if (body.data.length > 0) {
        expect(body.data.length).toBeLessThanOrEqual(queryParams.items_per_page);

        const randomIndex = Math.floor(Math.random() * body.data.length);
        const gachaItem = body.data[randomIndex];

        expect(gachaItem).toMatchObject({
          id: expect.any(Number),
          name: expect.any(String),
          status: expect.any(Number),
          created_at: expect.any(String),
          updated_at: expect.any(String),
        });
      }
    });

    test("TC02: Lọc theo Status (公開 / 非公開)", async () => {
      const publicResponse = await gachaApi.getGachas({
        method: METHODS.GET,
        queryParams: {
          ...apiGachaData.defaultParams,
          status: apiGachaData.filterParams.status.public,
        },
      });
      expect(publicResponse.status()).toBe(200);
      const publicBody = await publicResponse.json();
      if (publicBody.data.length > 0) {
        expect(publicBody.data[0].status).toBe(apiGachaData.filterParams.status.public);
      }

      const privateResponse = await gachaApi.getGachas({
        method: METHODS.GET,
        queryParams: {
          ...apiGachaData.defaultParams,
          status: apiGachaData.filterParams.status.private,
        },
      });
      expect(privateResponse.status()).toBe(200);
      const privateBody = await privateResponse.json();
      if (privateBody.data.length > 0) {
        expect(privateBody.data[0].status).toBe(apiGachaData.filterParams.status.private);
      }
    });

    test("TC03: Tìm kiếm theo Keyword (Có dữ liệu)", async () => {
      const listResponse = await gachaApi.getGachas({
        method: METHODS.GET,
        queryParams: apiGachaData.defaultParams,
      });
      const listBody = await listResponse.json();
      const keyword = listBody.data.length > 0 ? listBody.data[0].name : apiGachaData.filterParams.keyword.valid;

      const response = await gachaApi.getGachas({
        method: METHODS.GET,
        queryParams: {
          ...apiGachaData.defaultParams,
          keyword: keyword,
          status: undefined,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      if (body.data.length > 0) {
        const isKeywordExist = body.data.some(
          (item) =>
            item.name.toLowerCase().includes(keyword.toLowerCase()) ||
            item.id.toString().includes(keyword),
        );
        expect(isKeywordExist).toBeTruthy();
      }
    });
  });

  // =========================================================================
  // 2. INVALID METHOD CASES (405)
  // =========================================================================
  test.describe("2. Invalid Method (405)", () => {
    let gachaApi;

    test.beforeEach(async ({ authenticatedRequest }) => {
      gachaApi = new GachaAPI(authenticatedRequest);
    });

    const invalidMethods = generateOtherMethodNotChoose(METHODS.GET);

    invalidMethods.forEach((method, index) => {
      test(`Case ${index + 1}: Từ chối method ${method} (405)`, async () => {
        const response = await gachaApi.getGachas({
          method,
          queryParams: apiGachaData.defaultParams,
        });

        const {
          status,
          contentType,
          body: expectedBody,
        } = apiGachaData.expectedResponses.invalidMethod;

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
  // 3. HEADERS (ACCEPT & AUTH)
  // =========================================================================
  test.describe("3. Headers (Accept & Auth)", () => {
    test.describe("3.1. Accept Header", () => {
      let gachaApi;

      test.beforeEach(async ({ authenticatedRequest }) => {
        gachaApi = new GachaAPI(authenticatedRequest);
      });

      (apiGachaData.acceptTestCases || []).forEach(
        ({ tcId, title, headers, expectedStatus }) => {
          test(`[${tcId}] ${title}`, async () => {
            const response = await gachaApi.getGachas({
              method: "GET",
              queryParams: apiGachaData.defaultParams,
              headers,
            });

            expect(expectedStatus).toContain(response.status());
          });
        },
      );
    });

    test.describe("3.2. Auth & Role", () => {
      let gachaApi;

      test.beforeEach(async ({ unauthenticatedRequest }) => {
        gachaApi = new GachaAPI(unauthenticatedRequest);
      });

      (apiGachaData.authTestCases || []).forEach(
        ({ tcId, title, headers, expectedStatus }) => {
          test(`[${tcId}] ${title} -> ${expectedStatus}`, async () => {
            const response = await gachaApi.getGachas({
              method: "GET",
              queryParams: apiGachaData.defaultParams,
              headers,
            });

            expect(response.status()).toBe(expectedStatus);
            const body = await response.json();
            expect(body).toHaveProperty("detail");
          });
        },
      );
    });
  });

  // =========================================================================
  // 4. QUERY PARAMETERS (CSV DATA-DRIVEN)
  // =========================================================================
  test.describe("4. Query Parameters (CSV)", () => {
    let gachaApi;

    test.beforeEach(async ({ authenticatedRequest }) => {
      gachaApi = new GachaAPI(authenticatedRequest);
    });

    csvTestCases.forEach(
      ({ tcId, testName, method, headers, queryParams, expectedStatus }) => {
        test(`[${tcId}] ${testName}`, async () => {
          const response = await gachaApi.getGachas({
            method,
            queryParams,
            headers,
          });

          expect(response.status()).toBe(expectedStatus);

          if (expectedStatus === apiGachaData.expectedResponses.success.status) {
            const body = await response.json();
            expect(body).toMatchObject(
              apiGachaData.expectedResponses.success.bodySchema,
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
