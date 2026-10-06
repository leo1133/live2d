import { expect } from "@playwright/test";
import { HTTP_STATUS_CODE, CONTENT_TYPE } from "../utils/constants.js";
import {
  COMMON_API_ERROR_MESSAGES,
  testTokens,
  commonAcceptTestCases,
  createAuthTestCases,
  commonExpectedResponses,
} from "./commonApiData.js";

export const ERROR_MESSAGES = {
  ...COMMON_API_ERROR_MESSAGES,
  PAGE_MIN: "UserListRequest.pageは1以上の値を入力してください。",
  ITEMS_PER_PAGE_MIN: "UserListRequest.items_per_pageは1以上の値を入力してください。",
  INVALID_BOOLEAN: "value is not a valid boolean",
  INVALID_ENUM: "value is not a valid enumeration member",
};

export const userData = {
  defaultParams: {
    page: 1,
    items_per_page: 10,
    sort_field: "id",
    sort_order: "desc",
    keyword: "nga",
    user_status: 1,
    agency_status: 0,
    streamer_type: 1,
    can_livestream: true,
  },

  testTokens,

  acceptTestCases: commonAcceptTestCases,

  get authTestCases() {
    return createAuthTestCases(this.testTokens);
  },

  expectedResponses: {
    ...commonExpectedResponses,

    success: {
      status: HTTP_STATUS_CODE.OK,
      contentType: CONTENT_TYPE.JSON,
      bodySchema: {
        page: expect.any(Number),
        items_per_page: expect.any(Number),
        data: expect.any(Array),
      },
    },

    getParamErrorResponse: (paramName, overrideMsg = null) => {
      const errorMap = {
        page: ERROR_MESSAGES.PAGE_MIN,
        items_per_page: ERROR_MESSAGES.ITEMS_PER_PAGE_MIN,
      };

      return {
        status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY || 422,
        contentType: CONTENT_TYPE.JSON,
        detail: [
          {
            loc: ["query", paramName],
            msg: overrideMsg || errorMap[paramName] || expect.any(String),
          },
        ],
      };
    },
  },
};