import { HTTP_STATUS_CODE, CONTENT_TYPE } from "../utils/constants.js";

// ------------------------------------------------------------------
// 1. ERROR MESSAGES CONSTANTS
// ------------------------------------------------------------------
const ERROR_MESSAGES = {
  UNAUTHORIZED:
    "メールアドレス・IDまたはパスワードが一致しません。もう一度入力してください。",
  EMAIL_REQUIRED: "メール/IDは空欄にできません。",
  PASSWORD_REQUIRED: "パスワードは空欄にできません。",
  DEFAULT_REQUIRED: "Field required",
  INVALID_BODY:
    "Input should be a valid dictionary or object to extract fields from",
  METHOD_NOT_ALLOWED: "Method Not Allowed",
};

const createMissingDetail = (field, msg) => ({
  type: "missing",
  loc: ["body", field],
  msg,
});

// ------------------------------------------------------------------
// 2. MAIN LOGIN DATA
// ------------------------------------------------------------------
export const loginData = {
  url: "/sign-in",

  // UI Labels (tiếng Nhật)
  items: {
    email: "メール/ID",
    password: "パスワード",
    loginButton: "ログイン",
    forgotPassword: "パスワードを忘れた方",
  },

  forgotPasswordScreen: {
    title: "Surreal Dolls - パスワード忘れ",
  },

  showToastMgs: {
    msg: "listitem",
  },

  // Credentials (từ .env)
  credentials: {
    account: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    accountId: process.env.ADMIN_ID,
    textLoginSuccess: "Surreal Dolls - ダッシュボード",
    wrongPassword: "12345678",
    wrongEmail: "admin1@gmail.com",
  },

  // API Credentials (key names theo chuẩn của Backend)
  apiCredentials: {
    email_user_id: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    login_type: Number(process.env.LOGIN_TYPE) || 1,
  },

  // UI Validate Email
  validateEmail: {
    emptyEmail: "",
    alphabet: "email",
    numeric: "123456",
    specialCharacters: "!@#$%^&*()_+=-[]{}|\\;:",
    spaceBeginEnd: " admin@domain.com ",
    spaceBetween: "admin @domain.com",
    missingAt: "admindomain.com",
    missingDomain: "admin@",
    missingLocalPart: "@domain.com",
    duplicateAt: "admin@@domain.com",
    invalidDomain: "admin@admin",
  },

  // UI Validate Password
  validatePassword: {
    emptyPassword: "",
    alphabet: "password",
    numeric: "123456",
    specialCharacters: "password#$",
    spaceBeginEnd: "  password  ",
    space: "password with space",
    longPassword: "ThisIsAVeryLongPasswordThatExceedsNormalLength12345!",
  },

  // UI Messages
  messages: {
    accountRequired: "メール/IDは空欄にできません。",
    passwordRequired: "パスワードは空欄にできません。",
    invalidCredentials:
      "メールアドレス・IDまたはパスワードが一致しません。もう一度入力してください。",
  },

  // API Expected Responses
  expectedResponses: {
    success: {
      status: HTTP_STATUS_CODE.OK,
      contentType: CONTENT_TYPE.JSON,
      body: {
        access_token: "string",
        refresh_token: "string",
        firebase_access_token: "string",
        is_agency: "boolean",
      },
    },
    unauthorized: {
      status: HTTP_STATUS_CODE.UNAUTHORIZED,
      contentType: CONTENT_TYPE.JSON,
      body: { detail: ERROR_MESSAGES.UNAUTHORIZED },
    },
    invalidMethod: {
      status: HTTP_STATUS_CODE.METHOD_NOT_ALLOWED,
      contentType: CONTENT_TYPE.JSON,
      body: { detail: ERROR_MESSAGES.METHOD_NOT_ALLOWED },
    },
    invalidBodyFormat: {
      status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
      contentType: CONTENT_TYPE.JSON,
      detail: [
        {
          type: "model_attributes_type",
          loc: ["body"],
          msg: ERROR_MESSAGES.INVALID_BODY,
        },
      ],
    },
    missingAllFields: {
      status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
      detail: [
        createMissingDetail("email_user_id", ERROR_MESSAGES.EMAIL_REQUIRED),
        createMissingDetail("password", ERROR_MESSAGES.PASSWORD_REQUIRED),
      ],
    },
  },
};

// ------------------------------------------------------------------
// 3. PARAMETERIZED TEST DATA SETS (dùng cho API tests)
// ------------------------------------------------------------------
export const invalidContentTypePayloads = [
  { type: "text/plain", payload: "email=admin@example.com&password=123" },
  {
    type: "application/x-www-form-urlencoded",
    payload: `email_user_id=${loginData.apiCredentials.email_user_id}&password=${loginData.apiCredentials.password}`,
  },
  {
    type: "application/xml",
    payload: `<xml><email>${loginData.apiCredentials.email_user_id}</email><password>${loginData.apiCredentials.password}</password></xml>`,
  },
];

export const headerTestCases = [
  { title: "No header", headers: {}, expectedStatus: HTTP_STATUS_CODE.OK },
  {
    title: "Empty header",
    headers: { accept: "", "Content-Type": "" },
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  {
    title: "No Accept header",
    headers: {},
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  {
    title: "Empty Accept header",
    headers: { accept: "" },
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  {
    title: "Invalid Accept header",
    headers: { accept: "text/html" },
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  {
    title: "No Content-Type header",
    headers: {},
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  {
    title: "Empty Content-Type header",
    headers: { "Content-Type": "" },
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
  {
    title: "Invalid Content-Type header",
    headers: { "Content-Type": "text/plain" },
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY, // Thực tế backend trả về 422 cho invalid content type
  },
];

export const missingFieldCases = [
  {
    field: "email_user_id",
    title: "Missing email field",
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
    isOptional: false,
  },
  {
    field: "password",
    title: "Missing password field",
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
    isOptional: false,
  },
  {
    field: "login_type",
    title: "Missing login_type field (optional)",
    expectedStatus: HTTP_STATUS_CODE.OK,
    isOptional: true,
  },
];

export const invalidValueCases = [
  {
    title: "Email blank",
    override: { email_user_id: "" },
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
  },
  {
    title: "Email null",
    override: { email_user_id: null },
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
  },
  // Server xử lý invalid email format như là sai credentials (401), không phải lỗi validation (422)
  {
    title: "Invalid email format (no @)",
    override: { email_user_id: "invalid-email-format" },
    expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
  },
  {
    title: "Email not string (number)",
    override: { email_user_id: 123456789 },
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
  },
  {
    title: "Password blank",
    override: { password: "" },
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
  },
  {
    title: "Password null",
    override: { password: null },
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
  },
  {
    title: "Password not string (boolean)",
    override: { password: true },
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
  },
  {
    title: "Login type blank",
    override: { login_type: "" },
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
  },
  // Server chấp nhận login_type null và dùng giá trị mặc định, trả về 200
  {
    title: "Login type null",
    override: { login_type: null },
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
];
