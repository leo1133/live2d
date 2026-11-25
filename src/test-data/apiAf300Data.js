import { generateRandomNumber, generateRandomString } from "../utils/helpers.js";

/**
 * Data Factory & Viewpoint Matrix cho AF300 (GET/PUT/PATCH/DELETE /gifts/:id)
 */
export const buildGiftUpdatePayload = (overrides = {}) => ({
  name: `UpdatedGift_${generateRandomString(6, true)}`,
  coin_price: generateRandomNumber(20, 800),
  category_id: Number(process.env.TEST_GIFT_CATEGORY_ID || 1),
  sort_order: generateRandomNumber(1, 99),
  status: "active",
  ...overrides,
});

export const apiAf300Data = {
  invalidPathIdCases: [
    { tcId: "[AF300-API-04]", vpId: "PATH-002", id: 999999, expectedStatus: [404] },
    { tcId: "[AF300-API-05]", vpId: "PATH-003", id: 0, expectedStatus: [400, 404] },
    { tcId: "[AF300-API-06]", vpId: "PATH-004", id: -1, expectedStatus: [400, 404] },
    { tcId: "[AF300-API-07]", vpId: "PATH-005", id: "abc", expectedStatus: [400, 422] },
    { tcId: "[AF300-API-08]", vpId: "PATH-006", id: "1.5", expectedStatus: [400, 422] },
    { tcId: "[AF300-API-09]", vpId: "PATH-011", id: "1 OR 1=1", expectedStatus: [400, 404] },
  ],
  putInvalidJsonCases: [
    { tcId: "[AF300-API-15]", vpId: "BODY-003", title: "JSON thiếu ngoặc", raw: '{"name":"New"', expectedStatus: [400] },
    { tcId: "[AF300-API-16]", vpId: "BODY-004", title: "Trailing comma", raw: '{"name":"New",}', expectedStatus: [400] },
  ],
  patchNegativeCases: [
    { tcId: "[AF300-API-24]", vpId: "UPD-009", title: "PATCH body rỗng {}", payload: {}, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-25]", vpId: "UPD-010", title: "PATCH coin_price âm", payload: { coin_price: -50 }, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-28]", vpId: "UPD-013", title: "PATCH name = null", payload: { name: null }, expectedStatus: [400, 422] },
  ],
  deleteInvalidCases: [
    { tcId: "[AF300-API-37]", vpId: "DEL-004", id: 999999, expectedStatus: [404] },
    { tcId: "[AF300-API-38]", vpId: "DEL-005", id: "abc", expectedStatus: [400, 422] },
  ],
};
