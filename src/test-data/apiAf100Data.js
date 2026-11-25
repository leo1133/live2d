import { expect } from "@playwright/test";
import { HTTP_STATUS_CODE } from "../utils/constants.js";
import { generateRandomString } from "../utils/helpers.js";

/**
 * Ma trận kiểm thử API cho AF100 (GET /gifts & PATCH /gifts/:id/status)
 */
export const apiAf100Data = {
  giftItemSchema: {
    id: expect.any(Number),
    name: expect.any(String),
    coin_price: expect.any(Number),
    category_id: expect.any(Number),
    status: expect.any(String),
  },
  queryKeyCases: [
    { tcId: "[AF100-API-25]", vpId: "KEY-001", title: "Query key rỗng", rawQuery: "?=abc", expectedStatus: [400, 200] },
    { tcId: "[AF100-API-26]", vpId: "KEY-002", title: "Query key sai chính tả", params: { namex: "Heart" }, expectedStatus: [200] },
    { tcId: "[AF100-API-27]", vpId: "KEY-006", title: "Query key sai hoa thường", params: { STATUS: "active" }, expectedStatus: [200] },
    { tcId: "[AF100-API-28]", vpId: "KEY-007", title: "Trùng lặp query key", rawQuery: "?status=active&status=inactive", expectedStatus: [200] },
  ],
  searchQueryCases: [
    { tcId: "[AF100-API-29]", vpId: "STR-001", title: "Tìm kiếm chữ Latin", q: "Heart", expectedStatus: [200] },
    { tcId: "[AF100-API-30]", vpId: "STR-002", title: "Tìm kiếm chuỗi số", q: "10", expectedStatus: [200] },
    { tcId: "[AF100-API-31]", vpId: "STR-003", title: "Ký tự đặc biệt", q: "@#$%", expectedStatus: [200, 400] },
    { tcId: "[AF100-API-32]", vpId: "STR-005", title: "Khoảng trắng đầu/cuối", q: "  Heart  ", expectedStatus: [200] },
    { tcId: "[AF100-API-33]", vpId: "STR-010", title: "Ký tự tiếng Nhật UTF-8", q: "ハート", expectedStatus: [200] },
    { tcId: "[AF100-API-34]", vpId: "STR-012", title: "Emoji 4-byte", q: "🎁", expectedStatus: [200, 400] },
    { tcId: "[AF100-API-35]", vpId: "STR-019", title: "SQL wildcard % và _", q: "%", expectedStatus: [200] },
    { tcId: "[AF100-API-36]", vpId: "STR-020", title: "Không khớp bản ghi nào", q: `ZZZZ_${generateRandomString(6)}`, expectEmpty: true, expectedStatus: [200] },
    { tcId: "[AF100-API-37]", vpId: "STR-021", title: "Partial match", q: "Star", expectedStatus: [200] },
    { tcId: "[AF100-API-38]", vpId: "STR-024", title: "Toàn khoảng trắng", q: "   ", expectedStatus: [200] },
  ],
  categoryFilterCases: [
    { tcId: "[AF100-API-39]", vpId: "INT-001", title: "category_id hợp lệ", category_id: 1, expectedStatus: [200] },
    { tcId: "[AF100-API-40]", vpId: "INT-007", title: "category_id âm", category_id: -1, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-41]", vpId: "INT-008", title: "category_id thập phân", category_id: 1.5, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-42]", vpId: "INT-009", title: "category_id là chữ", category_id: "abc", expectedStatus: [400, 422] },
  ],
  statusFilterCases: [
    { tcId: "[AF100-API-43a]", vpId: "ENUM-001", title: "status=active", status: "active", expectedStatus: [200] },
    { tcId: "[AF100-API-43b]", vpId: "ENUM-001", title: "status=inactive", status: "inactive", expectedStatus: [200] },
    { tcId: "[AF100-API-44]", vpId: "ENUM-004", title: "status ngoài enum", status: "unknown", expectedStatus: [400, 422] },
    { tcId: "[AF100-API-45]", vpId: "ENUM-006", title: "status sai hoa/thường", status: "ACTIVE", expectedStatus: [400, 422] },
  ],
  paginationCases: [
    { tcId: "[AF100-API-46]", vpId: "LIM-001", title: "Default không truyền limit", params: {}, expectedStatus: [200] },
    { tcId: "[AF100-API-47]", vpId: "LIM-003", title: "limit = -1", params: { limit: -1 }, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-48]", vpId: "LIM-004", title: "limit = 0", params: { limit: 0 }, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-49]", vpId: "LIM-007", title: "limit = 100 (max)", params: { limit: 100 }, expectedStatus: [200] },
    { tcId: "[AF100-API-50]", vpId: "LIM-008", title: "limit = 101 (max+1)", params: { limit: 101 }, expectedStatus: [400, 422, 200] },
    { tcId: "[AF100-API-51]", vpId: "LIM-010", title: "limit overflow 32-bit", params: { limit: 2147483648 }, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-52]", vpId: "LIM-013", title: "limit = abc", params: { limit: "abc" }, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-55]", vpId: "PAGE-005", title: "page vượt tổng số trang", params: { page: 99999 }, expectedStatus: [200] },
  ],
  sortingCases: [
    { tcId: "[AF100-API-57]", vpId: "SORT-001", title: "Sort coin_price asc", params: { sort_by: "coin_price", order: "asc" }, expectedStatus: [200] },
    { tcId: "[AF100-API-58]", vpId: "SORT-002", title: "Sort created_at desc", params: { sort_by: "created_at", order: "desc" }, expectedStatus: [200] },
    { tcId: "[AF100-API-59]", vpId: "SORT-004", title: "sort_by cột không tồn tại", params: { sort_by: "non_exist_col" }, expectedStatus: [400, 422] },
    { tcId: "[AF100-API-60]", vpId: "SORT-005", title: "SQLi trong sort_by", params: { sort_by: "name;DROP TABLE gifts" }, expectedStatus: [400, 422] },
  ],
  securityCases: [
    { tcId: "[AF100-API-64]", vpId: "SEC-001", title: "SQL Injection trong q", params: { q: "' OR 1=1 --" }, expectedStatus: [200, 400] },
    { tcId: "[AF100-API-65]", vpId: "SEC-006", title: "Reflected XSS trong q", params: { q: "<script>alert(1)</script>" }, expectedStatus: [200, 400] },
  ],
  patchStatusInvalidCases: [
    { tcId: "[AF100-API-74]", vpId: "PATH-002", id: 999999, body: { status: "inactive" }, expectedStatus: [HTTP_STATUS_CODE.NOT_FOUND] },
    { tcId: "[AF100-API-75]", vpId: "PATH-005", id: "abc", body: { status: "inactive" }, expectedStatus: [HTTP_STATUS_CODE.BAD_REQUEST, 422] },
    { tcId: "[AF100-API-77]", vpId: "BODY-003", id: 1, rawBody: '{"status":"inactive"', expectedStatus: [HTTP_STATUS_CODE.BAD_REQUEST] },
    { tcId: "[AF100-API-78]", vpId: "UPD-009", id: 1, body: {}, expectedStatus: [HTTP_STATUS_CODE.BAD_REQUEST, 422] },
    { tcId: "[AF100-API-79]", vpId: "ENUM-004", id: 1, body: { status: "PENDING" }, expectedStatus: [HTTP_STATUS_CODE.BAD_REQUEST, 422] },
  ],
};
