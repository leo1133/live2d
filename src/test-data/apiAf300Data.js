/**
 * API Test Data cho AF300 — GET/PATCH/DELETE /gift/{gift_id}/
 */
export const apiAf300Data = {
  defaultGiftId: 1,
  validPatchPayload: {
    name: "Upd_Gift",
    price: 600,
    sort_order: 2,
    status: "public",
  },
  invalidDetailIds: [
    { tcId: "[AF300-API-05]", vpId: "PATH-002", title: "ID không tồn tại (999999)", id: 999999, expectedStatus: [404] },
    { tcId: "[AF300-API-06]", vpId: "PATH-004", title: "ID âm (-1)", id: -1, expectedStatus: [400, 404, 422] },
    { tcId: "[AF300-API-07]", vpId: "PATH-005", title: "ID là chữ (abc)", id: "abc", expectedStatus: [400, 422] },
    { tcId: "[AF300-API-08]", vpId: "PATH-011", title: "SQLi trong Path", id: "1%20OR%201=1", expectedStatus: [400, 404, 422] },
  ],
  patchInvalidCases: [
    { tcId: "[AF300-API-15]", vpId: "BODY-003", title: "JSON thiếu ngoặc đóng", payload: '{"name":"X"', expectedStatus: [400, 422] },
    { tcId: "[AF300-API-16]", vpId: "BODY-004", title: "JSON trailing comma", payload: '{"name":"X",}', expectedStatus: [400, 422] },
    { tcId: "[AF300-API-17]", vpId: "UPD-009", title: "PATCH body rỗng {}", payload: {}, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-21]", vpId: "BIZ-02", title: "shutter giá ngoài [5000,10000] (250)", payload: { animation_type: "shutter", price: 250 }, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-23]", vpId: "BIZ-04", title: "continuous giá ngoài list (2000)", payload: { animation_type: "continuous", price: 2000 }, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-25]", vpId: "STR-009", title: "name vượt 10 ký tự (11)", payload: { name: "12345678901" }, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-26]", vpId: "UPD-013", title: "name = null", payload: { name: null }, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-27]", vpId: "STR-001", title: 'name = ""', payload: { name: "" }, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-28]", vpId: "INT-007", title: "price = -50", payload: { price: -50 }, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-29]", vpId: "INT-008", title: "price = 12.5", payload: { price: 12.5 }, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-30]", vpId: "INT-009", title: 'price = "abc"', payload: { price: "abc" }, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-31]", vpId: "INT-007", title: "sort_order = -1", payload: { sort_order: -1 }, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-32]", vpId: "ENUM-004", title: "status ngoài enum (UNKNOWN)", payload: { status: "UNKNOWN" }, expectedStatus: [400, 422] },
    { tcId: "[AF300-API-40]", vpId: "SEC-007", title: "Stored XSS trong name", payload: { name: "<img src=x onerror=alert(1)>" }, expectedStatus: [400, 422] },
  ],
  deleteInvalidCases: [
    { tcId: "[AF300-API-46]", vpId: "DEL-004", title: "Xóa ID không tồn tại (999999)", id: 999999, expectedStatus: [404] },
    { tcId: "[AF300-API-47]", vpId: "DEL-005", title: "Xóa ID sai định dạng (abc)", id: "abc", expectedStatus: [400, 422] },
  ],
};
