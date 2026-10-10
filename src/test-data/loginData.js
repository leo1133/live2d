import dotenv from "dotenv";
import path from "path";
import { HTTP_STATUS_CODE, CONTENT_TYPE } from "../utils/constants.js";

const ENV = process.env.ENV || "dev";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${ENV}`) });

export const ERROR_MESSAGES = {
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

export const loginData = {
  url: "/sign-in",

  items: {
    email: "メール/ID",
    password: "パスワード",
    loginButton: "ログイン",
    forgotPassword: "パスワードを忘れた方",
  },

  forgotPasswordScreen: {
    url: "/forgot-password",
    title: "Surreal Dolls - パスワードを忘れた方",
  },

  showToastMgs: {
    msg: "listitem",
  },

  credentials: {
    get account() {
      return process.env.ADMIN_EMAIL || "admin@admin.com";
    },
    get password() {
      return process.env.ADMIN_PASSWORD || "!Ch4ng3Th1sP4ssW0rd!";
    },
    get accountId() {
      return process.env.ADMIN_ID || "admin";
    },
    textLoginSuccess: "Surreal Dolls - ダッシュボード",
    wrongPassword: "12345678",
    wrongEmail: "admin1@gmail.com",
  },

  apiCredentials: {
    get email_user_id() {
      return process.env.ADMIN_EMAIL || "admin@admin.com";
    },
    get password() {
      return process.env.ADMIN_PASSWORD || "!Ch4ng3Th1sP4ssW0rd!";
    },
    get login_type() {
      return Number(process.env.LOGIN_TYPE) || 1;
    },
  },

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

  validatePassword: {
    emptyPassword: "",
    alphabet: "password",
    numeric: "123456",
    specialCharacters: "password#$",
    spaceBeginEnd: "  password  ",
    space: "password with space",
    longPassword: "ThisIsAVeryLongPasswordThatExceedsNormalLength12345!",
  },

  messages: {
    accountRequired: ERROR_MESSAGES.EMAIL_REQUIRED,
    passwordRequired: ERROR_MESSAGES.PASSWORD_REQUIRED,
    invalidCredentials: ERROR_MESSAGES.UNAUTHORIZED,
  },

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

export const invalidContentTypePayloads = [
  { type: "text/plain", payload: "email=admin@example.com&password=123" },
  {
    type: "application/x-www-form-urlencoded",
    get payload() {
      return `email_user_id=${loginData.apiCredentials.email_user_id}&password=${loginData.apiCredentials.password}`;
    },
  },
  {
    type: "application/xml",
    get payload() {
      return `<xml><email>${loginData.apiCredentials.email_user_id}</email><password>${loginData.apiCredentials.password}</password></xml>`;
    },
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
    expectedStatus: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
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
  {
    title: "Login type null",
    override: { login_type: null },
    expectedStatus: HTTP_STATUS_CODE.OK,
  },
];
