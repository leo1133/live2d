import { generateRandomNumber, generateRandomString } from "../utils/helpers.js";

/**
 * Data Factory & Viewpoint Matrix cho AF400 (CRUD /gift-categories)
 */
export const buildCategoryPayload = (overrides = {}) => ({
  name: `Cat_${generateRandomString(6, true)}`,
  sort_order: generateRandomNumber(1, 99),
  ...overrides,
});

export const apiAf400Data = {
  createNegativeCases: [
    { tcId: "[AF400-API-10]", vpId: "REQ-001", title: "Thiếu name", payload: { sort_order: 1 }, expectedStatus: [400, 422] },
    { tcId: "[AF400-API-11]", vpId: "REQ-005", title: "name toàn space", payload: { name: "   " }, expectedStatus: [400, 422] },
    { tcId: "[AF400-API-13]", vpId: "STR-009", title: "name vượt max length", payload: { name: generateRandomString(256) }, expectedStatus: [400, 422] },
    { tcId: "[AF400-API-15]", vpId: "INT-007", title: "sort_order âm", payload: { name: "CatNeg", sort_order: -1 }, expectedStatus: [400, 422] },
  ],
  updateNegativeCases: [
    { tcId: "[AF400-API-20]", vpId: "UPD-002", id: 1, payload: { sort_order: 2 }, expectedStatus: [400, 422] },
    { tcId: "[AF400-API-21]", vpId: "UPD-003", id: 999999, payload: { name: "NotFound" }, expectedStatus: [404] },
    { tcId: "[AF400-API-22]", vpId: "PATH-005", id: "abc", payload: { name: "Invalid" }, expectedStatus: [400, 422] },
  ],
  deleteNegativeCases: [
    { tcId: "[AF400-API-27]", vpId: "DEL-004", id: 999999, expectedStatus: [404] },
  ],
};
