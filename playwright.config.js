// @ts-check
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

/**
 * Tải biến môi trường dựa trên biến ENV (Mặc định là 'dev' nếu không truyền)
 * Ví dụ: ENV=staging npx playwright test -> Đọc file .env.staging
 */
const ENV = process.env.ENV || "dev";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${ENV}`) });

const UI_SESSION_STORAGE = path.resolve(
  process.cwd(),
  `tests/auth/ui_session_${ENV}.json`,
);

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Thư mục chứa các file test (*.spec.js)
  testDir: "./tests",

  /* Thời gian tối đa cho 1 test case (Mặc định Playwright là 30s) */
  timeout: 30 * 1000,

  /* Thời gian chờ cho lệnh expect() lên 10s */
  expect: {
    timeout: 10 * 1000,
  },

  /* Mặc định giữ false cho các UI test suite tuần tự, API tests bật fullyParallel */
  fullyParallel: false,

  /* Báo lỗi trên CI nếu lỡ quên test.only */
  forbidOnly: !!process.env.CI,

  /* Số lần thử lại (Retry) khi test bị fail */
  retries: process.env.CI ? 2 : 0,

  /* Số luồng chạy */
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : 1,

  /* Khai báo loại Báo cáo (Reporter) */
  reporter: [["html", { open: "never" }], ["list"]],

  /* Cấu hình chung cho toàn bộ dự án */
  use: {
    /* Ghi trace khi test thất bại lần đầu để debug */
    trace: "on-first-retry",
    /* Tự động điền Basic Auth (chống kẹt màn hình popup của browser) */
    httpCredentials: process.env.BASIC_AUTH_USER
      ? {
          username: process.env.BASIC_AUTH_USER,
          password: process.env.BASIC_AUTH_PASS || "",
        }
      : undefined,
  },

  /* Phân chia Projects với Setup Dependency */
  projects: [
    // 0. Global Setup: Đăng nhập UI Admin một lần và lưu storageState
    {
      name: "setup",
      testDir: "./tests/auth",
      testMatch: /.*\.setup\.js/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.UI_BASE_URL,
      },
    },

    // 1. Project chạy Test Admin UI trên Chrome (Case 1 - 18)
    {
      name: "Admin UI Tests - Chrome",
      testDir: "./tests/ui",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.UI_BASE_URL,
        storageState: UI_SESSION_STORAGE,
      },
    },

    // 2. Project chạy Test API (Case 19 - 49) - Chạy song song (Parallel)
    {
      name: "API Tests",
      testDir: "./tests/api",
      fullyParallel: true,
      use: {
        baseURL: process.env.API_BASE_URL,
        extraHTTPHeaders: {
          Accept: "application/json",
        },
      },
    },

    // 3. Project chạy Test E2E (Case 50 - 57)
    {
      name: "E2E Tests",
      testDir: "./tests/e2e",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.UI_BASE_URL,
        storageState: UI_SESSION_STORAGE,
      },
    },
  ],
});
