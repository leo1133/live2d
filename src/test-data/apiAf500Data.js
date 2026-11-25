import { generateRandomNumber } from "../utils/helpers.js";

/**
 * Data Factory & Viewpoint Matrix cho AF500 (GET/PUT /high-value-gift/config)
 */
export const buildHighValueConfigPayload = (overrides = {}) => ({
  threshold: generateRandomNumber(300, 1000),
  is_enabled: true,
  ...overrides,
});

export const apiAf500Data = {
  thresholdValidationCases: [
    { tcId: "[AF500-API-11]", vpId: "REQ-001", title: "Thiếu threshold", payload: { is_enabled: true }, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-12]", vpId: "INT-002", title: "threshold = 1 (min)", payload: { threshold: 1 }, expectedStatus: [200] },
    { tcId: "[AF500-API-13]", vpId: "INT-006", title: "threshold = 0", payload: { threshold: 0 }, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-14]", vpId: "INT-007", title: "threshold = -100", payload: { threshold: -100 }, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-15]", vpId: "INT-008", title: "threshold = 500.5", payload: { threshold: 500.5 }, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-16]", vpId: "INT-009", title: "threshold = 'abc'", payload: { threshold: "abc" }, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-17]", vpId: "INT-012", title: "threshold overflow 32-bit", payload: { threshold: 2147483648 }, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-18]", vpId: "BOOL-009", title: "is_enabled sai kiểu", payload: { threshold: 500, is_enabled: "abc" }, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-19]", vpId: "ARR-004", title: "gift_ids là string", payload: { threshold: 500, gift_ids: "1" }, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-20]", vpId: "ARR-005", title: "gift_ids chứa ID không tồn tại", payload: { threshold: 500, gift_ids: [999999] }, expectedStatus: [400, 404, 422] },
  ],
};
