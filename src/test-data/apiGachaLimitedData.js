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
  PAGE_MIN: "PagingParamRequest.pageは1以上の値を入力してください。",
  ITEMS_PER_PAGE_MAX: "PagingParamRequest.items_per_pageは100以下の値を入力してください。",
  PITY_UPDATE_SUCCESS: "正常に更新されました。",
  ITEM_UPDATE_SUCCESS: "正常に更新されました。",
  MIN_VALUE_ZERO: "0以上の値を入力してください",
  INVALID_FORMAT: "入力形式が正しくありません",
};

export const apiGachaLimitedData = {
  csvPath: "src/test-data/csv/getGachaLimitedItems.csv",
  get defaultModelId() {
    return Number(process.env.LIMITED_GACHA_MODEL_ID) || 45;
  },
  get defaultPackageId() {
    return Number(process.env.LIMITED_GACHA_PACKAGE_ID) || 53;
  },
  get defaultItemId() {
    return Number(process.env.LIMITED_GACHA_ITEM_ID) || 133;
  },
  nonExistentItemId: 99999999,
  packageTypes: {
    NORMAL: 1,
    LIMITED: 2,
  },
  defaultParams: {
    page: 1,
    items_per_page: 10,
  },

  testTokens,

  acceptTestCases: commonAcceptTestCases,

  get authTestCases() {
    return createAuthTestCases(this.testTokens);
  },

  expectedResponses: {
    ...commonExpectedResponses,

    packageDetailSuccess: {
      status: HTTP_STATUS_CODE.OK,
      contentType: CONTENT_TYPE.JSON,
      bodySchema: {
        id: expect.any(Number),
        model_name: expect.any(String),
        type: 2,
        hard_pity: expect.any(Number),
        soft_pity: expect.any(Number),
        gift_hard_pity: expect.any(Number),
        gift_soft_pity: expect.any(Number),
      },
    },

    packageItemsSuccess: {
      status: HTTP_STATUS_CODE.OK,
      contentType: CONTENT_TYPE.JSON,
      bodySchema: {
        page: expect.any(Number),
        items_per_page: expect.any(Number),
        total_count: expect.any(Number),
        data: expect.any(Array),
      },
    },

    itemDetailSuccess: {
      status: HTTP_STATUS_CODE.OK,
      contentType: CONTENT_TYPE.JSON,
      bodySchema: {
        id: expect.any(Number),
        category: expect.any(Number),
        name: expect.any(String),
        type: expect.any(Number),
      },
    },

    pityUpdateSuccess: {
      status: HTTP_STATUS_CODE.OK,
      body: { detail: "正常に更新されました。" },
    },

    itemUpdateSuccess: {
      status: HTTP_STATUS_CODE.OK,
      body: { detail: "正常に更新されました。" },
    },

    subModelSuccess: {
      status: HTTP_STATUS_CODE.OK,
      bodySchema: {
        data: expect.any(Array),
      },
    },
  },

  pityPayloads: {
    defaultPity: {
      hard_pity: 100,
      soft_pity: 50,
      gift_hard_pity: 100,
      gift_soft_pity: 50,
    },
    validUpdate: {
      hard_pity: 120,
      soft_pity: 60,
      gift_hard_pity: 90,
      gift_soft_pity: 45,
    },
    negative: {
      hard_pity: -1,
      soft_pity: 50,
      gift_hard_pity: 100,
      gift_soft_pity: 50,
    },
    invalidType: {
      hard_pity: "invalid_value",
    },
  },

  itemPayloads: {
    validUpdate: {
      can_change_color_after_gacha: false,
      can_change_variant_after_gacha: false,
      is_exchange_fragment: true,
      fragment_count: 1,
      type: 5,
      variant: [],
    },
    invalidNegative: {
      fragment_count: -1,
    },
  },
};

