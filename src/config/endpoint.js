import dotenv from "dotenv";
import path from "path";

// Xác định môi trường thực thi (Mặc định: 'dev')
export const getEnv = () => process.env.ENV || "dev";

// Tự động nạp file .env tương ứng nếu chưa được nạp
dotenv.config({ path: path.resolve(process.cwd(), `.env.${getEnv()}`) });

// Lấy trực tiếp từ file .env.<env> (Single Source of Truth)
export const getApiBaseUrl = () => {
  const url = process.env.API_BASE_URL;
  if (!url) {
    throw new Error(`⚠️ [CONFIG ERROR] Thiếu "API_BASE_URL" trong file .env.${getEnv()}`);
  }
  return url;
};

export const getUiBaseUrl = () => {
  const url = process.env.UI_BASE_URL;
  if (!url) {
    throw new Error(`⚠️ [CONFIG ERROR] Thiếu "UI_BASE_URL" trong file .env.${getEnv()}`);
  }
  return url;
};

export const getUiSessionFile = () =>
  path.join(process.cwd(), "tests", "auth", `ui_session_${getEnv()}.json`);

export const getApiTokenFile = () =>
  path.join(process.cwd(), "tests", "auth", `api_token_${getEnv()}.json`);

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login/",
    REFRESH_TOKEN: "/api/v1/auth/refresh/",
  },
  USER: {
    GET_LIST: "/api/v1/user/",
  },
  GACHA: {
    GET_LIST: "/api/v1/model-gacha/",
  },
  GACHA_LIMITED: {
    PACKAGE_DETAIL: (modelId) => `/api/v1/model-gacha/${modelId}`,
    PACKAGE_ITEMS: (packageId) => `/api/v1/model-gacha/model-gacha-items/${packageId}`,
    UPDATE_PITY: (packageId) => `/api/v1/model-gacha/${packageId}/pity`,
    UPDATE_IMAGE: (packageId) => `/api/v1/model-gacha/package/${packageId}/image`,
    ITEM: (itemId) => `/api/v1/model-gacha/items/${itemId}`,
    CREATE_ITEM: "/api/v1/model-gacha/items",
    SUB_MODEL_LIST: (packageId) => `/api/v1/model-gacha/package/${packageId}/three-d-sub-model`,
  },
  COMMON: {
    VERSION: "/api/v1/common/version",
  },
  AGENCY: {
    GET_LIST: "/agency/",
    CREATE: "/agency/create/",
    DETAIL: (id) => `/agency/${id}/`,
    UPDATE: (id) => `/agency/${id}/`,
    DELETE: (id) => `/agency/${id}/`,
    VERIFY_EMAIL: "/agency/auth/verify-email-change/",
    LIVER_LIST: (id) => `/agency/list/${id}`,
    USER_APPROVE: (agencyId, userId) => `/agency/${agencyId}/user/${userId}`,
    REVENUE: (id) => `/agency/${id}/revenue/`,
    REWARD_CREATE: (id) => `/agency/${id}/reward/`,
    REWARD_UPDATE: (agencyId, rewardId) => `/agency/${agencyId}/reward/${rewardId}/`,
    REWARD_DELETE: (agencyId, rewardId) => `/agency/${agencyId}/reward/${rewardId}/`,
    STATEMENT_PDF: (agencyId, rewardId) => `/agency/${agencyId}/statement/${rewardId}/pdf`,
  },
  GIFT: {
    GET_LIST: "/api/v1/admin/gifts",
    CREATE: "/api/v1/admin/gifts",
    DETAIL: (id) => `/api/v1/admin/gifts/${id}`,
    UPDATE: (id) => `/api/v1/admin/gifts/${id}`,
    DELETE: (id) => `/api/v1/admin/gifts/${id}`,
    TOGGLE_STATUS: (id) => `/api/v1/admin/gifts/${id}/status`,
    UPLOAD_ASSET: "/api/v1/admin/gifts/upload-asset",
    CATEGORY_LIST: "/api/v1/admin/gift-categories",
    CATEGORY_CREATE: "/api/v1/admin/gift-categories",
    CATEGORY_DETAIL: (id) => `/api/v1/admin/gift-categories/${id}`,
    CATEGORY_UPDATE: (id) => `/api/v1/admin/gift-categories/${id}`,
    CATEGORY_DELETE: (id) => `/api/v1/admin/gift-categories/${id}`,
    HIGH_VALUE_CONFIG: "/api/v1/admin/high-value-gift/config",
  },
};
