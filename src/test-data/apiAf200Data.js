import { generateRandomNumber, generateRandomString } from "../utils/helpers.js";

/**
 * Data Factory & Viewpoint Matrix cho AF200 (POST /gifts & POST /gifts/upload-asset)
 */
export const buildGiftPayload = (overrides = {}) => ({
  name: `Gift_${generateRandomString(6, true)}`,
  coin_price: generateRandomNumber(10, 1000),
  category_id: Number(process.env.TEST_GIFT_CATEGORY_ID || 1),
  sort_order: generateRandomNumber(1, 99),
  status: "active",
  icon_url: "https://cdn.example.com/gifts/default_icon.png",
  ...overrides,
});

export const apiAf200Data = {
  invalidJsonPayloads: [
    { tcId: "[AF200-API-14]", vpId: "BODY-002", title: "Plain text body", raw: "hello world", expectedStatus: [400] },
    { tcId: "[AF200-API-15]", vpId: "BODY-003", title: "Thiếu ngoặc đóng", raw: '{"name": "Star"', expectedStatus: [400] },
    { tcId: "[AF200-API-16]", vpId: "BODY-004", title: "Trailing comma", raw: '{"name": "Star",}', expectedStatus: [400] },
    { tcId: "[AF200-API-17]", vpId: "BODY-005", title: "Single quotes", raw: "{'name': 'Star'}", expectedStatus: [400] },
    { tcId: "[AF200-API-18]", vpId: "BODY-006", title: "Empty body", raw: "", expectedStatus: [400] },
    { tcId: "[AF200-API-19]", vpId: "BODY-008", title: "Body = null", raw: "null", expectedStatus: [400] },
    { tcId: "[AF200-API-20]", vpId: "BODY-009", title: "Body = Array", raw: '[{"name":"Star"}]', expectedStatus: [400] },
  ],
  requiredFieldCases: [
    { tcId: "[AF200-API-23a]", vpId: "REQ-008", title: "Thiếu name", omitField: "name", expectedStatus: [400, 422] },
    { tcId: "[AF200-API-23b]", vpId: "REQ-008", title: "Thiếu coin_price", omitField: "coin_price", expectedStatus: [400, 422] },
    { tcId: "[AF200-API-23c]", vpId: "REQ-008", title: "Thiếu category_id", omitField: "category_id", expectedStatus: [400, 422] },
    { tcId: "[AF200-API-24]", vpId: "REQ-009", title: "Object rỗng {}", payload: {}, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-25]", vpId: "REQ-010", title: "Tất cả required = null", payload: { name: null, coin_price: null, category_id: null }, expectedStatus: [400, 422] },
  ],
  fieldValidationCases: [
    { tcId: "[AF200-API-28]", vpId: "STR-005", title: "name có space đầu/cuối", overrides: { name: `  TrimGift_${generateRandomString(4)}  ` }, expectedStatus: [201, 200] },
    { tcId: "[AF200-API-29]", vpId: "STR-008", title: "name max length (50 chars)", overrides: { name: generateRandomString(50) }, expectedStatus: [201, 200] },
    { tcId: "[AF200-API-30]", vpId: "STR-009", title: "name vượt max length (256 chars)", overrides: { name: generateRandomString(256) }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-31]", vpId: "STR-014", title: "name sai kiểu (number)", overrides: { name: 123 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-32]", vpId: "STR-017", title: "name chứa XSS", overrides: { name: "<script>alert(1)</script>" }, expectedStatus: [201, 400, 422] },
    { tcId: "[AF200-API-33]", vpId: "INT-002", title: "coin_price = 1 (min)", overrides: { coin_price: 1 }, expectedStatus: [201, 200] },
    { tcId: "[AF200-API-34]", vpId: "INT-006", title: "coin_price = 0", overrides: { coin_price: 0 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-35]", vpId: "INT-007", title: "coin_price = -1", overrides: { coin_price: -1 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-36]", vpId: "INT-008", title: "coin_price = 1.5", overrides: { coin_price: 1.5 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-37]", vpId: "INT-009", title: "coin_price = 'abc'", overrides: { coin_price: "abc" }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-38]", vpId: "INT-012", title: "coin_price overflow 32-bit", overrides: { coin_price: 2147483648 }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-39]", vpId: "ENUM-004", title: "status ngoài enum", overrides: { status: "PENDING" }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-40]", vpId: "ENUM-006", title: "status sai hoa/thường", overrides: { status: "ACTIVE" }, expectedStatus: [400, 422] },
    { tcId: "[AF200-API-44]", vpId: "CRE-005", title: "category_id không tồn tại", overrides: { category_id: 999999 }, expectedStatus: [400, 404, 422] },
    { tcId: "[AF200-API-46]", vpId: "SEC-004", title: "SQLi trong name", overrides: { name: "'; DROP TABLE gifts;--" }, expectedStatus: [201, 400, 422] },
  ],
  uploadValidationCases: [
    { tcId: "[AF200-API-53]", vpId: "FILE-003", title: "Đuôi .exe cấm", filename: "malware.exe", mimeType: "application/x-msdownload", buffer: Buffer.from("MZ"), expectedStatus: [400, 415, 422] },
    { tcId: "[AF200-API-55]", vpId: "FILE-005", title: "File không có đuôi", filename: "test", mimeType: "application/octet-stream", buffer: Buffer.from("data"), expectedStatus: [400, 415, 422] },
    { tcId: "[AF200-API-57]", vpId: "FILE-007", title: "Giả mạo magic bytes .png", filename: "fake.png", mimeType: "image/png", buffer: Buffer.from("MZ_FAKE_EXE"), expectedStatus: [400, 415, 422] },
    { tcId: "[AF200-API-61]", vpId: "FILE-012", title: "File rỗng 0 KB", filename: "empty.png", mimeType: "image/png", buffer: Buffer.alloc(0), expectedStatus: [400, 422] },
    { tcId: "[AF200-API-65]", vpId: "FILE-018", title: "Path traversal filename", filename: "../../etc/passwd.png", mimeType: "image/png", buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]), expectedStatus: [200, 201, 400] },
  ],
};
