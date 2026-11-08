import { test, expect } from "../../src/fixtures/baseTest.js";
import { GachaLimitedAPI } from "../../src/api/GachaLimitedAPI.js";
import { apiGachaLimitedData, ERROR_MESSAGES } from "../../src/test-data/apiGachaLimitedData.js";
import { loadGachaLimitedItemsCsvCases } from "../../src/utils/csvHelper.js";
import { METHODS, HTTP_STATUS_CODE } from "../../src/utils/constants.js";
import { generateOtherMethodNotChoose } from "../../src/utils/helpers.js";

const csvTestCases = loadGachaLimitedItemsCsvCases(apiGachaLimitedData.csvPath);

test.describe("API Limited Gacha (期間限定アバターガチャ)", () => {
  const modelId = apiGachaLimitedData.defaultModelId;
  const packageId = apiGachaLimitedData.defaultPackageId;
  const itemId = apiGachaLimitedData.defaultItemId;

  // =========================================================================
  // 1. HAPPY PATH CASES
  // =========================================================================
  test.describe("1. Happy Path", () => {
    let api;

    test.beforeEach(async ({ authenticatedRequest }) => {
      api = new GachaLimitedAPI(authenticatedRequest);
    });

    test("TC01: Lấy chi tiết Limited Gacha Package thành công (type=2) & Schema Integrity", async () => {
      const response = await api.getPackageDetail({
        modelId,
        queryParams: { type: apiGachaLimitedData.packageTypes.LIMITED },
      });

      expect(response.status()).toBe(apiGachaLimitedData.expectedResponses.packageDetailSuccess.status);
      expect(response.headers()["content-type"]).toContain("application/json");

      const body = await response.json();
      expect(body).toMatchObject(apiGachaLimitedData.expectedResponses.packageDetailSuccess.bodySchema);
      expect(body.id).toBe(packageId);
      expect(body.type).toBe(apiGachaLimitedData.packageTypes.LIMITED);
      expect(body.model_name).toBeDefined();
      expect(body.hard_pity).toBeGreaterThanOrEqual(0);
      expect(body.soft_pity).toBeGreaterThanOrEqual(0);
      expect(body.gift_hard_pity).toBeGreaterThanOrEqual(0);
      expect(body.gift_soft_pity).toBeGreaterThanOrEqual(0);
    });

    test("TC02: Lấy danh sách Items của Limited Gacha Package thành công & Schema Integrity", async () => {
      const queryParams = apiGachaLimitedData.defaultParams;

      const response = await api.getPackageItems({
        packageId,
        queryParams,
      });

      expect(response.status()).toBe(apiGachaLimitedData.expectedResponses.packageItemsSuccess.status);
      expect(response.headers()["content-type"]).toContain("application/json");

      const body = await response.json();
      expect(body).toMatchObject(apiGachaLimitedData.expectedResponses.packageItemsSuccess.bodySchema);
      expect(body.page).toBe(queryParams.page);
      expect(body.items_per_page).toBe(queryParams.items_per_page);
      expect(body.total_count).toBeGreaterThanOrEqual(0);

      if (body.data.length > 0) {
        expect(body.data.length).toBeLessThanOrEqual(queryParams.items_per_page);

        const sampleItem = body.data[0];
        expect(sampleItem).toMatchObject({
          id: expect.any(Number),
          category: expect.any(Number),
          name: expect.any(String),
          type: expect.any(Number),
        });
      }
    });

    test("TC03: Lấy thông tin chi tiết của Gacha Item theo itemId thành công", async () => {
      const response = await api.getItem({ itemId });

      expect(response.status()).toBe(apiGachaLimitedData.expectedResponses.itemDetailSuccess.status);
      expect(response.headers()["content-type"]).toContain("application/json");

      const body = await response.json();
      expect(body).toMatchObject(apiGachaLimitedData.expectedResponses.itemDetailSuccess.bodySchema);
      expect(body.id).toBe(itemId);
    });

    test("TC04: Lấy danh sách Sub-model phục vụ cài đặt Gacha (type=2)", async () => {
      const response = await api.getSubModelList({
        packageId,
        queryParams: { type: apiGachaLimitedData.packageTypes.LIMITED },
      });

      expect(response.status()).toBe(apiGachaLimitedData.expectedResponses.subModelSuccess.status);
      const body = await response.json();
      expect(body).toMatchObject(apiGachaLimitedData.expectedResponses.subModelSuccess.bodySchema);
      expect(Array.isArray(body.data)).toBeTruthy();
    });
  });

  // =========================================================================
  // 2. INVALID METHOD CASES (405)
  // =========================================================================
  test.describe("2. Invalid Method (405)", () => {
    let api;

    test.beforeEach(async ({ authenticatedRequest }) => {
      api = new GachaLimitedAPI(authenticatedRequest);
    });

    const invalidMethodsForGet = generateOtherMethodNotChoose(METHODS.GET);

    invalidMethodsForGet.forEach((method, index) => {
      test(`Case 2.${index + 1}: Từ chối method ${method} trên Package Detail (405)`, async () => {
        const response = await api.getPackageDetail({
          modelId,
          method,
          queryParams: { type: apiGachaLimitedData.packageTypes.LIMITED },
        });

        expect(response.status()).toBe(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED);
        const body = await response.json();
        expect(body.detail).toBe(ERROR_MESSAGES.METHOD_NOT_ALLOWED);
      });
    });

    invalidMethodsForGet.forEach((method, index) => {
      test(`Case 2.b.${index + 1}: Từ chối method ${method} trên Package Items (405)`, async () => {
        const response = await api.getPackageItems({
          packageId,
          method,
          queryParams: apiGachaLimitedData.defaultParams,
        });

        expect(response.status()).toBe(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED);
        const body = await response.json();
        expect(body.detail).toBe(ERROR_MESSAGES.METHOD_NOT_ALLOWED);
      });
    });
  });

  // =========================================================================
  // 3. HEADERS (ACCEPT & AUTH)
  // =========================================================================
  test.describe("3. Headers (Accept & Auth)", () => {
    test.describe("3.1. Accept Header", () => {
      let api;

      test.beforeEach(async ({ authenticatedRequest }) => {
        api = new GachaLimitedAPI(authenticatedRequest);
      });

      (apiGachaLimitedData.acceptTestCases || []).forEach(
        ({ tcId, title, headers, expectedStatus }) => {
          test(`[${tcId}] ${title}`, async () => {
            const response = await api.getPackageDetail({
              modelId,
              queryParams: { type: apiGachaLimitedData.packageTypes.LIMITED },
              headers,
            });

            expect(expectedStatus).toContain(response.status());
          });
        },
      );
    });

    test.describe("3.2. Auth & Role", () => {
      let api;

      test.beforeEach(async ({ unauthenticatedRequest }) => {
        api = new GachaLimitedAPI(unauthenticatedRequest);
      });

      (apiGachaLimitedData.authTestCases || []).forEach(
        ({ tcId, title, headers, expectedStatus }) => {
          test(`[${tcId}] ${title} -> ${expectedStatus}`, async () => {
            const response = await api.getPackageDetail({
              modelId,
              queryParams: { type: apiGachaLimitedData.packageTypes.LIMITED },
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
  // 4. QUERY PARAMETERS (CSV DATA-DRIVEN & PAGINATION)
  // =========================================================================
  test.describe("4. Query Parameters (CSV)", () => {
    let api;

    test.beforeEach(async ({ authenticatedRequest }) => {
      api = new GachaLimitedAPI(authenticatedRequest);
    });

    csvTestCases.forEach(({ tcId, testName, method, headers, queryParams, expectedStatus }) => {
      test(`[${tcId}] ${testName}`, async () => {
        const response = await api.getPackageItems({
          packageId,
          method,
          queryParams,
          headers,
        });

        expect(response.status()).toBe(expectedStatus);

        if (expectedStatus === HTTP_STATUS_CODE.OK) {
          const body = await response.json();
          expect(body).toMatchObject(apiGachaLimitedData.expectedResponses.packageItemsSuccess.bodySchema);

          if (queryParams.page !== undefined && queryParams.page !== null && !isNaN(Number(queryParams.page)) && Number(queryParams.page) >= 1) {
            expect(body.page).toBe(Number(queryParams.page));
          }
          if (queryParams.items_per_page !== undefined && queryParams.items_per_page !== null && !isNaN(Number(queryParams.items_per_page)) && Number(queryParams.items_per_page) >= 1) {
            expect(body.items_per_page).toBe(Number(queryParams.items_per_page));
          }
        } else if (expectedStatus === 422) {
          const body = await response.json();
          expect(body.detail).toBeDefined();
          expect(Array.isArray(body.detail)).toBeTruthy();
          expect(body.detail[0]).toHaveProperty("msg");
        }
      });
    });
  });

  // =========================================================================
  // 5. PITY CONFIGURATION (PATCH)
  // =========================================================================
  test.describe("5. Pity Configuration (PATCH)", () => {
    let api;

    test.beforeEach(async ({ authenticatedRequest }) => {
      api = new GachaLimitedAPI(authenticatedRequest);
    });

    test("TC_PITY_01: Cập nhật thông số Pity thành công và khôi phục giá trị ban đầu", async () => {
      // 1. Cập nhật giá trị pity mới
      const updatePayload = apiGachaLimitedData.pityPayloads.validUpdate;
      const patchResponse = await api.updatePity({
        packageId,
        payload: updatePayload,
      });

      expect(patchResponse.status()).toBe(HTTP_STATUS_CODE.OK);
      const patchBody = await patchResponse.json();
      expect(patchBody.detail).toBe(apiGachaLimitedData.expectedResponses.pityUpdateSuccess.body.detail);

      // 2. Kiểm tra package detail phản ánh đúng thông số mới
      const detailResponse = await api.getPackageDetail({
        modelId,
        queryParams: { type: apiGachaLimitedData.packageTypes.LIMITED },
      });
      expect(detailResponse.status()).toBe(HTTP_STATUS_CODE.OK);
      const detailBody = await detailResponse.json();
      expect(detailBody.hard_pity).toBe(updatePayload.hard_pity);
      expect(detailBody.soft_pity).toBe(updatePayload.soft_pity);
      expect(detailBody.gift_hard_pity).toBe(updatePayload.gift_hard_pity);
      expect(detailBody.gift_soft_pity).toBe(updatePayload.gift_soft_pity);

      // 3. Rollback về giá trị chuẩn
      const rollbackPayload = apiGachaLimitedData.pityPayloads.defaultPity;
      const rollbackResponse = await api.updatePity({
        packageId,
        payload: rollbackPayload,
      });
      expect(rollbackResponse.status()).toBe(HTTP_STATUS_CODE.OK);
    });

    test("TC_PITY_02: Từ chối cập nhật Pity khi giá trị âm (422)", async () => {
      const response = await api.updatePity({
        packageId,
        payload: apiGachaLimitedData.pityPayloads.negative,
      });

      expect(response.status()).toBe(HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY);
      const body = await response.json();
      expect(body.detail).toBeDefined();
      expect(Array.isArray(body.detail)).toBeTruthy();
      expect(body.detail[0].msg).toContain(ERROR_MESSAGES.MIN_VALUE_ZERO);
    });

    test("TC_PITY_03: Từ chối cập nhật Pity khi giá trị không phải số (422)", async () => {
      const response = await api.updatePity({
        packageId,
        payload: apiGachaLimitedData.pityPayloads.invalidType,
      });

      expect(response.status()).toBe(HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY);
      const body = await response.json();
      expect(body.detail).toBeDefined();
      expect(Array.isArray(body.detail)).toBeTruthy();
      expect(body.detail[0].msg).toContain(ERROR_MESSAGES.INVALID_FORMAT);
    });
  });

  // =========================================================================
  // 6. ITEM MANAGEMENT (GET & PATCH)
  // =========================================================================
  test.describe("6. Item Management (GET & PATCH)", () => {
    let api;

    test.beforeEach(async ({ authenticatedRequest }) => {
      api = new GachaLimitedAPI(authenticatedRequest);
    });

    test("TC_ITEM_01: Cập nhật cấu hình của Item thành công (PATCH)", async () => {
      const response = await api.updateItem({
        itemId,
        payload: apiGachaLimitedData.itemPayloads.validUpdate,
      });

      expect(response.status()).toBe(HTTP_STATUS_CODE.OK);
      const body = await response.json();
      expect(body.detail).toBe(apiGachaLimitedData.expectedResponses.itemUpdateSuccess.body.detail);
    });

    test("TC_ITEM_02: Từ chối cập nhật Item khi fragment_count âm (422)", async () => {
      const response = await api.updateItem({
        itemId,
        payload: apiGachaLimitedData.itemPayloads.invalidNegative,
      });

      expect([HTTP_STATUS_CODE.BAD_REQUEST, HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY]).toContain(response.status());
      const body = await response.json();
      expect(body.detail).toBeDefined();
    });

    test("TC_ITEM_03: Trả về lỗi khi truy vấn Item không tồn tại", async () => {
      const nonExistentItemId = apiGachaLimitedData.nonExistentItemId;
      const response = await api.getItem({ itemId: nonExistentItemId });

      expect([HTTP_STATUS_CODE.BAD_REQUEST, HTTP_STATUS_CODE.NOT_FOUND, HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY]).toContain(response.status());
    });
  });
});

