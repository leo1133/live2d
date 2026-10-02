import { test, expect } from '../../src/fixtures/baseTest.js';
import { GachaAPI } from '../../src/api/GachaAPI.js';
import { apiGachaData } from '../../src/test-data/apiGachaData.js';
import { METHODS } from '../../src/utils/constants.js';

test.describe("API GET List Gacha (Avatar) Test Suite - AQ100", () => {
  let gachaApi;

  test.beforeEach(async ({ authenticatedRequest }) => {
    gachaApi = new GachaAPI(authenticatedRequest);
  });

  test("TC01 - Get gacha list successfully with default params", async () => {
    const queryParams = apiGachaData.defaultParams;

    const response = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: queryParams,
      headers: { 'accept': '*/*' }
    });

    expect(response.status()).toBe(apiGachaData.expectedResponses.success.status);
    const body = await response.json();

    expect(body).toMatchObject({
      page: queryParams.page,
      items_per_page: queryParams.items_per_page,
      total_count: expect.any(Number),
      data: expect.any(Array),
    });

    if (body.data.length > 0) {
      expect(body.data[0].status).toBe(1);
    }
  });

  test("TC02 - Lọc dữ liệu theo trạng thái (Status Filter)", async () => {
    const allResponse = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: { ...apiGachaData.defaultParams, status: apiGachaData.filterParams.status.all }
    });
    expect(allResponse.status()).toBe(200);

    const privateResponse = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: { ...apiGachaData.defaultParams, status: apiGachaData.filterParams.status.private }
    });
    expect(privateResponse.status()).toBe(200);
    const privateBody = await privateResponse.json();
    if (privateBody.data.length > 0) {
      expect(privateBody.data[0].status).toBe(apiGachaData.filterParams.status.private);
    }
  });

  test("TC03 - Tìm kiếm theo Keyword (Có dữ liệu)", async () => {
    const keyword = apiGachaData.filterParams.keyword.valid;
    const response = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: { ...apiGachaData.defaultParams, keyword: keyword, status: "" }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    if (body.data.length > 0) {
      const isKeywordExist = body.data.some(item => item.name.includes(keyword) || item.id.toString().includes(keyword));
      expect(isKeywordExist).toBeTruthy();
    }
  });

  test("TC04 - Tìm kiếm theo Keyword (Không có dữ liệu)", async () => {
    const invalidKeyword = apiGachaData.filterParams.keyword.invalid;
    const response = await gachaApi.getGachas({
      method: METHODS.GET,
      queryParams: { ...apiGachaData.defaultParams, keyword: invalidKeyword, status: "" }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveLength(0);
    expect(body.total_count).toBe(0);
  });
});
