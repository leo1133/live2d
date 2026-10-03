import { HTTP_STATUS_CODE, CONTENT_TYPE } from "../utils/constants.js";

/**
 * Common API error message constants
 */
export const COMMON_API_ERROR_MESSAGES = {
  UNAUTHORIZED: "Not authenticated",
  FORBIDDEN: "Permission denied",
  METHOD_NOT_ALLOWED: "Method Not Allowed",
};

/**
 * Reusable JWT and Auth tokens for API testing
 */
export const testTokens = {
  get expiredToken() {
    return (
      process.env.TEST_EXPIRED_TOKEN ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDA0MDAwMDB9.invalid_sig"
    );
  },
  invalidToken: "invalid_bearer_format_12345",
  get nonAdminToken() {
    return (
      process.env.NON_ADMIN_TOKEN ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_non_admin_payload.mock_signature"
    );
  },
};

/**
 * Common Accept header test cases
 */
export const commonAcceptTestCases = [
  {
    tcId: "TC_HEADER_01",
    title: "Default headers / No header",
    headers: {},
    expectedStatus: [HTTP_STATUS_CODE.OK],
  },
  {
    tcId: "TC_HEADER_02",
    title: "No Accept header (With Content-Type)",
    headers: { "Content-Type": CONTENT_TYPE.JSON },
    expectedStatus: [HTTP_STATUS_CODE.OK],
  },
  {
    tcId: "TC_HEADER_03",
    title: "Empty Accept header",
    headers: { Accept: "" },
    expectedStatus: [HTTP_STATUS_CODE.OK],
  },
  {
    tcId: "TC_HEADER_04",
    title: "Unsupported Accept header (application/xml)",
    headers: { Accept: "application/xml" },
    expectedStatus: [HTTP_STATUS_CODE.OK, HTTP_STATUS_CODE.NOT_ACCEPTABLE || 406],
  },
];

/**
 * Generates common Authorization header test cases using provided or default tokens
 * @param {typeof testTokens} [tokens=testTokens]
 */
export const createAuthTestCases = (tokens = testTokens) => [
  {
    tcId: "TC_AUTH_01",
    title: "No Authorization header",
    headers: {},
    expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
  },
  {
    tcId: "TC_AUTH_02",
    title: "Empty Authorization header",
    headers: { Authorization: "" },
    expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
  },
  {
    tcId: "TC_AUTH_03",
    title: "Invalid Authorization format (Not Bearer)",
    headers: { Authorization: "Basic invalid_format_123" },
    expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
  },
  {
    tcId: "TC_AUTH_04",
    title: "Malformed / Invalid JWT Token",
    headers: { Authorization: `Bearer ${tokens.invalidToken}` },
    expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
  },
  {
    tcId: "TC_AUTH_05",
    title: "Expired JWT Token",
    headers: { Authorization: `Bearer ${tokens.expiredToken}` },
    expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
  },
  {
    tcId: "TC_AUTH_06",
    title: "Non-Admin role access",
    headers: { Authorization: `Bearer ${tokens.nonAdminToken}` },
    expectedStatus: HTTP_STATUS_CODE.UNAUTHORIZED,
  },
];

/**
 * Common expected responses for standard HTTP status codes
 */
export const commonExpectedResponses = {
  unauthorized: {
    status: HTTP_STATUS_CODE.UNAUTHORIZED,
    contentType: CONTENT_TYPE.JSON,
    body: { detail: COMMON_API_ERROR_MESSAGES.UNAUTHORIZED },
  },
  forbidden: {
    status: HTTP_STATUS_CODE.FORBIDDEN,
    contentType: CONTENT_TYPE.JSON,
    body: { detail: COMMON_API_ERROR_MESSAGES.FORBIDDEN },
  },
  invalidMethod: {
    status: HTTP_STATUS_CODE.METHOD_NOT_ALLOWED,
    contentType: CONTENT_TYPE.JSON,
    body: { detail: COMMON_API_ERROR_MESSAGES.METHOD_NOT_ALLOWED },
  },
};
