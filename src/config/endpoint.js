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
  }
};
