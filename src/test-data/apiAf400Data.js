/**
 * API Test Data cho AF400 — /gift/category/ & /gift/category/sort-order/{category_id}
 */
export const apiAf400Data = {
  createValidationCases: [
    { tcId: "[AF400-API-06]", vpId: "STR-008", title: "name đúng 20 ký tự", payload: { name: "12345678901234567890" }, expectedStatus: [200, 201] },
    { tcId: "[AF400-API-07]", vpId: "STR-009", title: "name vượt 21 ký tự", payload: { name: "123456789012345678901" }, expectedStatus: [400, 422] },
    { tcId: "[AF400-API-08]", vpId: "STR-002", title: "name toàn space", payload: { name: "   " }, expectedStatus: [400, 422] },
    { tcId: "[AF400-API-09]", vpId: "REQ-001", title: "Thiếu trường name", payload: {}, expectedStatus: [400, 422] },
    { tcId: "[AF400-API-11]", vpId: "SEC-007", title: "XSS trong name", payload: { name: "<script>alert(1)</script>" }, expectedStatus: [201, 400, 422] },
    { tcId: "[AF400-API-13]", vpId: "BODY-003", title: "JSON lỗi cú pháp", payload: '{"name":"X"', expectedStatus: [400, 422] },
  ],
  updateInvalidCases: [
    { tcId: "[AF400-API-15]", vpId: "REQ-002", title: "Thiếu name khi cập nhật", id: 1, payload: {}, expectedStatus: [400, 422] },
    { tcId: "[AF400-API-16]", vpId: "STR-010", title: "name > 20 ký tự (21)", id: 1, payload: { name: "123456789012345678901" }, expectedStatus: [400, 422] },
    { tcId: "[AF400-API-17]", vpId: "PATH-003", title: "category_id=999999 không tồn tại", id: 999999, payload: { name: "NewCat" }, expectedStatus: [404] },
    { tcId: "[AF400-API-18]", vpId: "PATH-002", title: "category_id sai kiểu (abc)", id: "abc", payload: { name: "NewCat" }, expectedStatus: [400, 422] },
  ],
  sortOrderInvalidCases: [
    { tcId: "[AF400-API-20]", vpId: "INT-007", title: "sort_order âm (-1)", id: 1, payload: { sort_order: -1 }, expectedStatus: [400, 422] },
    { tcId: "[AF400-API-21]", vpId: "INT-003", title: 'sort_order sai kiểu ("abc")', id: 1, payload: { sort_order: "abc" }, expectedStatus: [400, 422] },
    { tcId: "[AF400-API-23]", vpId: "PATH-004", title: "category_id=999999 khi sort-order", id: 999999, payload: { sort_order: 1 }, expectedStatus: [404] },
  ],
  deleteInvalidCases: [
    { tcId: "[AF400-API-26]", vpId: "PATH-005", title: "Xóa category_id=999999 không tồn tại", id: 999999, expectedStatus: [404] },
    { tcId: "[AF400-API-27]", vpId: "PATH-006", title: "Xóa category_id sai kiểu (abc)", id: "abc", expectedStatus: [400, 422] },
  ],
};
