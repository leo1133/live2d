// src/utils/csvHelper.js
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

/**
 * Chuyển đổi chuỗi từ CSV sang kiểu dữ liệu JavaScript tương ứng
 */
function parseCsvQueryValue(val) {
  if (val === undefined || val === "" || val === "__EMPTY__") return undefined;
  if (val === "__BLANK__") return "";
  if (val === "__NULL__") return null;
  if (val === "true" || val === "__BOOL_TRUE__") return true;
  if (val === "false" || val === "__BOOL_FALSE__") return false;

  // Tự động ép kiểu số nếu chuỗi thuần số
  if (!isNaN(val) && val.trim() !== "") {
    return Number(val);
  }
  return val;
}

/**
 * Đọc file CSV và trả về mảng dữ liệu testcases
 */
export function loadUserListCsvCases(csvRelativePath) {
  const absolutePath = path.resolve(process.cwd(), csvRelativePath);
  const fileContent = fs.readFileSync(absolutePath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((row, index) => {
    // 1. Dựng Headers nếu có
    const headers = {};
    const accept = parseCsvQueryValue(row.accept);
    if (accept !== undefined) headers["Accept"] = accept;

    // 2. Dựng Query Parameters từ các cột trong CSV
    const rawQueryParams = {
      page: parseCsvQueryValue(row.page),
      items_per_page: parseCsvQueryValue(row.items_per_page),
      sort_field: parseCsvQueryValue(row.sort_field),
      sort_order: parseCsvQueryValue(row.sort_order),
      keyword: parseCsvQueryValue(row.keyword),
      user_status: parseCsvQueryValue(row.user_status),
      agency_status: parseCsvQueryValue(row.agency_status),
      streamer_type: parseCsvQueryValue(row.streamer_type),
      can_livestream: parseCsvQueryValue(row.can_livestream),
    };

    // Loại bỏ các trường undefined (không gửi param đó)
    const queryParams = {};
    Object.keys(rawQueryParams).forEach((key) => {
      if (rawQueryParams[key] !== undefined) {
        queryParams[key] = rawQueryParams[key];
      }
    });

    return {
      tcId: row.tcId || row.tc_id || `TC_${index + 1}`,
      testName: row.testName || row.test_name || `Testcase ${index + 1}`,
      method: (row.method || "GET").toUpperCase(),
      headers,
      queryParams,
      expectedStatus: Number(row.expectedStatus || row.expected_status || 200),
    };
  });
}
