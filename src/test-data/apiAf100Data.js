/**
 * API Test Data cho AF100 — GET /gift/, DELETE /gift/{gift_id}/, GET /gift/category/
 */
export const apiAf100Data = {
  invalidMethods: [
    { tcId: "[AF100-API-09]", vpId: "MTD-002", method: "PUT", title: "Gửi PUT lên collection /gift/" },
    { tcId: "[AF100-API-10]", vpId: "MTD-004", method: "PATCH", title: "Gửi PATCH lên collection /gift/" },
    { tcId: "[AF100-API-11]", vpId: "MTD-006", method: "DELETE", title: "Gửi DELETE lên collection /gift/" },
  ],
  queryKeyCases: [
    { tcId: "[AF100-API-12]", vpId: "KEY-002", title: "Query key sai chính tả (?keywordx=Heart)", params: { keywordx: "Heart" }, expectedStatus: [200] },
    { tcId: "[AF100-API-13]", vpId: "KEY-005", title: "Truyền trùng key (?status=public&status=private)", rawQuery: "?status=public&status=private", expectedStatus: [200] },
  ],
  searchQueryCases: [
    { tcId: "[AF100-API-14]", vpId: "STR-001", title: "keyword rỗng", keyword: "", expectedStatus: [200] },
    { tcId: "[AF100-API-15]", vpId: "STR-021", title: "Partial match theo name (Ear)", keyword: "Ear", expectedStatus: [200] },
    { tcId: "[AF100-API-16]", vpId: "STR-002", title: "Exact match theo id (15)", keyword: "15", expectedStatus: [200] },
    { tcId: "[AF100-API-17]", vpId: "STR-003", title: "Exact match theo price (5000)", keyword: "5000", expectedStatus: [200] },
    { tcId: "[AF100-API-18]", vpId: "STR-005", title: "Khoảng trắng đầu/cuối (  Heart  )", keyword: "  Heart  ", expectedStatus: [200] },
    { tcId: "[AF100-API-19]", vpId: "STR-010", title: "Ký tự tiếng Nhật UTF-8 (ハート)", keyword: "ハート", expectedStatus: [200] },
    { tcId: "[AF100-API-20]", vpId: "STR-015", title: "Ký tự wildcard SQL LIKE (%)", keyword: "%", expectedStatus: [200] },
    { tcId: "[AF100-API-21]", vpId: "STR-020", title: "Không khớp bản ghi nào", keyword: `ZZZZ_${Date.now()}`, expectedStatus: [200], expectEmpty: true },
    { tcId: "[AF100-API-49]", vpId: "SEC-001", title: "SQLi trong keyword", keyword: "' OR 1=1 --", expectedStatus: [200, 400] },
    { tcId: "[AF100-API-50]", vpId: "SEC-007", title: "XSS trong keyword", keyword: "<script>alert(1)</script>", expectedStatus: [200, 400] },
  ],
  categoryFilterCases: [
    { tcId: "[AF100-API-22]", vpId: "INT-001", title: "Lọc theo category=1 hợp lệ", category: 1, expectedStatus: [200] },
    { tcId: "[AF100-API-23]", vpId: "INT-006", title: "category=0", category: 0, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-24]", vpId: "INT-007", title: "category=-1", category: -1, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-25]", vpId: "INT-009", title: "category=abc", category: "abc", expectedStatus: [400, 422] },
    { tcId: "[AF100-API-26]", vpId: "INT-011", title: "category=999999 không tồn tại", category: 999999, expectedStatus: [200], expectEmpty: true },
  ],
  statusFilterCases: [
    { tcId: "[AF100-API-27]", vpId: "ENUM-001", title: "Lọc status=public", status: "public", expectedStatus: [200] },
    { tcId: "[AF100-API-28]", vpId: "ENUM-002", title: "Lọc status=private", status: "private", expectedStatus: [200] },
    { tcId: "[AF100-API-29]", vpId: "ENUM-004", title: "status ngoài enum (unknown)", status: "unknown", expectedStatus: [400, 422] },
  ],
  animationTypeFilterCases: [
    { tcId: "[AF100-API-30]", vpId: "ENUM-001", title: "Lọc animation_type=normal", animation_type: "normal", expectedStatus: [200] },
    { tcId: "[AF100-API-31]", vpId: "ENUM-002", title: "Lọc animation_type=shutter", animation_type: "shutter", expectedStatus: [200] },
    { tcId: "[AF100-API-32]", vpId: "ENUM-003", title: "Lọc animation_type=continuous", animation_type: "continuous", expectedStatus: [200] },
    { tcId: "[AF100-API-33]", vpId: "ENUM-004", title: "animation_type ngoài enum", animation_type: "invalid_type", expectedStatus: [400, 422] },
  ],
  paginationCases: [
    { tcId: "[AF100-API-35]", vpId: "LIM-001", title: "Default page=1, items_per_page=10", params: {}, expectedStatus: [200] },
    { tcId: "[AF100-API-36]", vpId: "LIM-003", title: "items_per_page=-1", params: { items_per_page: -1 }, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-37]", vpId: "LIM-004", title: "items_per_page=0", params: { items_per_page: 0 }, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-38]", vpId: "LIM-005", title: "items_per_page=abc", params: { items_per_page: "abc" }, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-39]", vpId: "LIM-008", title: "items_per_page=1000 vượt giới hạn", params: { items_per_page: 1000 }, expectedStatus: [200, 400, 422] },
    { tcId: "[AF100-API-40]", vpId: "PAGE-001", title: "page=0", params: { page: 0 }, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-41]", vpId: "PAGE-002", title: "page=-1", params: { page: -1 }, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-43]", vpId: "PAGE-005", title: "page=abc", params: { page: "abc" }, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-44]", vpId: "PAGE-007", title: "page=99999 vượt tổng số trang", params: { page: 99999 }, expectedStatus: [200], expectEmpty: true },
  ],
  sortCases: [
    { tcId: "[AF100-API-45]", vpId: "SORT-001", title: "Sort price asc", params: { sort: "price", order: "asc" }, expectedStatus: [200] },
    { tcId: "[AF100-API-46]", vpId: "SORT-002", title: "Sort price desc", params: { sort: "price", order: "desc" }, expectedStatus: [200] },
    { tcId: "[AF100-API-47]", vpId: "SORT-004", title: "Sort cột không hợp lệ (unknown_col)", params: { sort: "unknown_col" }, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-48]", vpId: "SORT-005", title: "SQLi trong sort", params: { sort: "price;DROP TABLE gifts" }, expectedStatus: [400, 422] },
  ],
  deleteInvalidCases: [
    { tcId: "[AF100-API-59]", vpId: "DEL-004", title: "Xóa gift_id không tồn tại (999999)", giftId: 999999, expectedStatus: [404] },
    { tcId: "[AF100-API-60]", vpId: "PATH-005", title: "Xóa gift_id sai định dạng (abc)", giftId: "abc", expectedStatus: [400, 422] },
    { tcId: "[AF100-API-61]", vpId: "PATH-004", title: "Xóa gift_id âm (-1)", giftId: -1, expectedStatus: [400, 404, 422] },
  ],
};
