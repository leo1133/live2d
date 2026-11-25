/**
 * API Test Data cho AF200 — POST /gift/, POST /gift/category/
 */
export const buildGiftPayload = (overrides = {}) => ({
  name: `G${Date.now().toString().slice(-6)}`,
  price: 250,
  sort_order: 1,
  status: "public",
  animation_type: "normal",
  ...overrides,
});

export const apiAf200Data = {
  bodyStructureCases: [
    { tcId: "[AF200-API-07]", vpId: "BODY-002", title: "Body là plain text", payload: "hello world", expectedStatus: [400, 415, 422] },
    { tcId: "[AF200-API-08]", vpId: "BODY-003", title: "JSON thiếu ngoặc đóng", payload: '{"name":"Star"', expectedStatus: [400, 422] },
    { tcId: "[AF200-API-09]", vpId: "BODY-004", title: "JSON trailing comma", payload: '{"name":"Star",}', expectedStatus: [400, 422] },
    { tcId: "[AF200-API-11]", vpId: "BODY-008", title: "Body = null", payload: null, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-12]", vpId: "BODY-009", title: "Body = Array", payload: [{ name: "Star" }], expectedStatus: [400, 422] },
  ],
  animationTypeValidCases: [
    { tcId: "[AF200-API-15]", vpId: "BIZ-01", title: "shutter giá 5000", animation_type: "shutter", price: 5000, expectedStatus: [200, 201] },
    { tcId: "[AF200-API-16]", vpId: "BIZ-01", title: "shutter giá 10000", animation_type: "shutter", price: 10000, expectedStatus: [200, 201] },
    { tcId: "[AF200-API-18]", vpId: "BIZ-03", title: "continuous giá 1000", animation_type: "continuous", price: 1000, expectedStatus: [200, 201] },
    { tcId: "[AF200-API-19]", vpId: "BIZ-03", title: "continuous giá 3000", animation_type: "continuous", price: 3000, expectedStatus: [200, 201] },
    { tcId: "[AF200-API-20]", vpId: "BIZ-03", title: "continuous giá 5000", animation_type: "continuous", price: 5000, expectedStatus: [200, 201] },
    { tcId: "[AF200-API-21]", vpId: "BIZ-03", title: "continuous giá 10000", animation_type: "continuous", price: 10000, expectedStatus: [200, 201] },
  ],
  animationTypeInvalidCases: [
    { tcId: "[AF200-API-17]", vpId: "BIZ-02", title: "shutter giá ngoài [5000, 10000] (250)", animation_type: "shutter", price: 250, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-22]", vpId: "BIZ-04", title: "continuous giá ngoài list (2000)", animation_type: "continuous", price: 2000, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-46]", vpId: "ENUM-005", title: "animation_type ngoài enum (special)", animation_type: "special", price: 1000, expectedStatus: [400, 422] },
  ],
  fieldValidationCases: [
    { tcId: "[AF200-API-25]", vpId: "REQ-001", title: "Thiếu name", payload: { price: 100, sort_order: 1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-26]", vpId: "REQ-002", title: "Thiếu price", payload: { name: "Star", sort_order: 1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-27]", vpId: "REQ-003", title: "Thiếu sort_order", payload: { name: "Star", price: 100 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-30]", vpId: "STR-001", title: "name rỗng", payload: { name: "", price: 100, sort_order: 1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-31]", vpId: "STR-002", title: "name toàn space", payload: { name: "   ", price: 100, sort_order: 1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-33]", vpId: "STR-009", title: "name vượt 10 ký tự (11)", payload: { name: "12345678901", price: 100, sort_order: 1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-36]", vpId: "INT-006", title: "price = 0", payload: { name: "Star", price: 0, sort_order: 1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-37]", vpId: "INT-007", title: "price = -1", payload: { name: "Star", price: -1, sort_order: 1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-38]", vpId: "INT-008", title: "price = 1.5", payload: { name: "Star", price: 1.5, sort_order: 1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-39]", vpId: "INT-009", title: 'price = "abc"', payload: { name: "Star", price: "abc", sort_order: 1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-40]", vpId: "INT-012", title: "price overflow 32-bit", payload: { name: "Star", price: 2147483648, sort_order: 1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-41]", vpId: "INT-007", title: "sort_order = -1", payload: { name: "Star", price: 100, sort_order: -1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-42]", vpId: "INT-009", title: 'sort_order = "abc"', payload: { name: "Star", price: 100, sort_order: "abc" }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-43]", vpId: "CRE-005", title: "category_id=999999 không tồn tại", payload: { name: "Star", price: 100, sort_order: 1, category_id: 999999 }, expectedStatus: [400, 404, 422] },
    { tcId: "[AF200-API-45]", vpId: "ENUM-004", title: "status ngoài enum (UNKNOWN)", payload: { name: "Star", price: 100, sort_order: 1, status: "UNKNOWN" }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-48]", vpId: "SEC-001", title: "SQLi trong name", payload: { name: "'; DROP TABLE gifts;--", price: 100, sort_order: 1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-49]", vpId: "SEC-007", title: "XSS trong name", payload: { name: "<script>alert(1)</script>", price: 100, sort_order: 1 }, expectedStatus: [400, 422] },
  ],
  categoryInlineCases: [
    { tcId: "[AF200-API-64]", vpId: "STR-008", title: "name đúng 20 ký tự", payload: { name: "12345678901234567890" }, expectedStatus: [200, 201] },
    { tcId: "[AF200-API-65]", vpId: "STR-009", title: "name vượt 20 ký tự (21)", payload: { name: "123456789012345678901" }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-66]", vpId: "STR-001", title: "name toàn space", payload: { name: "   " }, expectedStatus: [400, 422] },
  ],
};
