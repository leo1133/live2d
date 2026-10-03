import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

/**
 * Chuyển đổi chuỗi từ CSV sang kiểu dữ liệu JavaScript tương ứng
 */
function parseCsvQueryValue(val) {
  if (val === undefined || val === "" || val === "__EMPTY__") return undefined;
  if (val === "<empty>" || val === "__BLANK__") return "";
  if (val === "null" || val === "__NULL__") return null;
  if (val === "true" || val === "__BOOL_TRUE__") return true;
  if (val === "false" || val === "__BOOL_FALSE__") return false;

  if (!isNaN(val) && val.trim() !== "") {
    return Number(val);
  }
  return val;
}

/**
 * Đọc file CSV và trả về mảng dữ liệu testcases cho User List
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
    const headers = {};
    const accept = parseCsvQueryValue(row.accept);
    if (accept !== undefined) headers["Accept"] = accept;

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

/**
 * Đọc file CSV và trả về mảng dữ liệu testcases cho Gacha List
 */
export function loadGachaListCsvCases(csvRelativePath) {
  const absolutePath = path.resolve(process.cwd(), csvRelativePath);
  const fileContent = fs.readFileSync(absolutePath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((row, index) => {
    const headers = {};
    const accept = parseCsvQueryValue(row.accept);
    if (accept !== undefined) headers["Accept"] = accept;

    const rawQueryParams = {
      page: parseCsvQueryValue(row.page),
      items_per_page: parseCsvQueryValue(row.items_per_page),
      keyword: parseCsvQueryValue(row.keyword),
      status: parseCsvQueryValue(row.status),
    };

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
