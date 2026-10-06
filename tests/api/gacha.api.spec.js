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

    test("TC01: Lấy danh sách thành công (Full Schema & Data Integrity)", async () => {
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
  // 4. QUERY PARAMETERS (CSV DATA-DRIVEN & DEEP ASSERTIONS)
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

            // 1. Kiểm tra nghiệp vụ lọc Status (nếu có truyền)
            if (
              queryParams.status !== undefined &&
              queryParams.status !== null &&
              queryParams.status !== "" &&
              !isNaN(Number(queryParams.status))
            ) {
              const targetStatus = Number(queryParams.status);
              body.data.forEach((item) => {
                expect(item.status).toBe(targetStatus);
              });
            }

            // 2. Kiểm tra nghiệp vụ tìm kiếm Keyword (nếu có truyền)
            if (queryParams.keyword && String(queryParams.keyword).trim() !== "") {
              if (body.data.length > 0) {
                const keywordLower = String(queryParams.keyword).toLowerCase().trim();
                const hasKeyword = body.data.some(
                  (item) =>
                    item.name.toLowerCase().includes(keywordLower) ||
                    item.id.toString().includes(keywordLower),
                );
                expect(hasKeyword).toBeTruthy();
              }
            }

            // 3. Kiểm tra tính đồng bộ phân trang (Page & Items Per Page)
            if (
              queryParams.page !== undefined &&
              queryParams.page !== null &&
              !isNaN(Number(queryParams.page)) &&
              Number(queryParams.page) >= 1
            ) {
              expect(body.page).toBe(Number(queryParams.page));
            }
            if (
              queryParams.items_per_page !== undefined &&
              queryParams.items_per_page !== null &&
              !isNaN(Number(queryParams.items_per_page)) &&
              Number(queryParams.items_per_page) >= 1
            ) {
              expect(body.items_per_page).toBe(Number(queryParams.items_per_page));
            }
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

  // =========================================================================
  // 5. DATABASE VERIFICATION (API VS DB)
  // =========================================================================
  test.describe("5. Database Verification (API vs DB)", () => {
    let gachaApi;
    let isDbAvailable = false;

    test.beforeAll(async () => {
      const { DBHelper } = await import("../../src/utils/db.helper.js");
      isDbAvailable = await DBHelper.isConnected();
    });

    test.beforeEach(async ({ authenticatedRequest }) => {
      test.skip(
        !isDbAvailable,
        "⚠️ Bỏ qua DB tests: Không thể kết nối tới Database (Database offline hoặc chưa bật)",
      );
      gachaApi = new GachaAPI(authenticatedRequest);
    });

    test("TC_DB01: Đồng bộ Total Count và số lượng items giữa API và DB", async ({ db }) => {
      const queryParams = { page: 1, items_per_page: 10 };

      const response = await gachaApi.getGachas({
        method: METHODS.GET,
        queryParams,
      });

      expect(response.status()).toBe(200);
      const body = await response.json();

      // Truy vấn DB tương ứng
      const dbResult = await db.getGachaList({
        page: queryParams.page,
        itemsPerPage: queryParams.items_per_page,
      });

      expect(body.total_count).toBe(dbResult.totalCount);
      expect(body.data.length).toBe(dbResult.rows.length);
    });

    test("TC_DB02: Đồng bộ chi tiết từng trường dữ liệu (Field-by-Field) của Gacha Item", async ({ db }) => {
      const response = await gachaApi.getGachas({
        method: METHODS.GET,
        queryParams: { page: 1, items_per_page: 10 },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();

      if (body.data.length > 0) {
        const randomIndex = Math.floor(Math.random() * body.data.length);
        const apiItem = body.data[randomIndex];

        // Lấy bản ghi tương ứng từ DB theo ID
        const dbItem = await db.getGachaById(apiItem.id);
        expect(dbItem).toBeDefined();

        expect(apiItem.id).toBe(dbItem.id);
        expect(apiItem.name).toBe(dbItem.name);
        expect(apiItem.status).toBe(dbItem.status);

        if (apiItem.created_at && dbItem.created_at) {
          expect(new Date(apiItem.created_at).getTime()).toBe(
            new Date(dbItem.created_at).getTime(),
          );
        }
        if (apiItem.updated_at && dbItem.updated_at) {
          expect(new Date(apiItem.updated_at).getTime()).toBe(
            new Date(dbItem.updated_at).getTime(),
          );
        }
      }
    });

    test("TC_DB03: Đồng bộ dữ liệu khi lọc theo Status (公開 / 非公開)", async ({ db }) => {
      const targetStatus = apiGachaData.filterParams.status.public; // 1: Public

      const response = await gachaApi.getGachas({
        method: METHODS.GET,
        queryParams: {
          ...apiGachaData.defaultParams,
          status: targetStatus,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();

      const dbResult = await db.getGachaList({
        page: apiGachaData.defaultParams.page,
        itemsPerPage: apiGachaData.defaultParams.items_per_page,
        status: targetStatus,
      });

      expect(body.total_count).toBe(dbResult.totalCount);
      expect(body.data.length).toBe(dbResult.rows.length);

      for (const item of body.data) {
        expect(item.status).toBe(targetStatus);
        const dbItem = await db.getGachaById(item.id);
        if (dbItem) {
          expect(dbItem.status).toBe(targetStatus);
          expect(dbItem.name).toBe(item.name);
        }
      }
    });

    test("TC_DB04: Đồng bộ dữ liệu khi tìm kiếm theo Keyword", async ({ db }) => {
      // Lấy 1 tên gacha mẫu từ DB hoặc test data
      const defaultDbData = await db.getGachaList({ page: 1, itemsPerPage: 1 });
      const keyword = defaultDbData.rows.length > 0 ? defaultDbData.rows[0].name : "test";

      const response = await gachaApi.getGachas({
        method: METHODS.GET,
        queryParams: {
          page: 1,
          items_per_page: 10,
          keyword: keyword,
          status: undefined,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();

      const dbResult = await db.getGachaList({
        page: 1,
        itemsPerPage: 10,
        keyword: keyword,
      });

      expect(body.total_count).toBe(dbResult.totalCount);
      expect(body.data.length).toBe(dbResult.rows.length);

      for (const item of body.data) {
        const dbItem = await db.getGachaById(item.id);
        if (dbItem) {
          expect(dbItem.name.toLowerCase()).toContain(keyword.toLowerCase());
        }
      }
    });
  });
});
