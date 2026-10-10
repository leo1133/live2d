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

  // =========================================================================
  // [ADVANCED UPGRADE 1 & 2]: Parallel Execution & Workers
  // =========================================================================
  /* [CŨ - CHẠY TUẦN TỰ ĐƠN LUỒNG]:
  fullyParallel: false,
  workers: 1,
  */
  // [MỚI - CHẠY SONG SONG TỐI ƯU HIỆU NĂNG]:
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,

  /* Báo lỗi trên CI nếu lỡ quên test.only */
  forbidOnly: !!process.env.CI,

  /* Số lần thử lại (Retry) khi test bị fail */
  retries: process.env.CI ? 2 : 0,

  /* Khai báo loại Báo cáo (Reporter) */
  reporter: [["html", { open: "never" }], ["list"]],

  /* Cấu hình chung cho toàn bộ dự án */
  use: {
    // =========================================================================
    // [ADVANCED UPGRADE 3]: Screenshot, Video & Trace Debugging
    // =========================================================================
    /* [CŨ - CHỈ CÓ TRACE]:
    trace: "on-first-retry",
    */
    // [MỚI - ĐẦY ĐỦ ARTIFACTS KHI TEST THẤT BẠI]:
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    /* Tự động điền Basic Auth (chống kẹt màn hình popup của browser) */
    httpCredentials: process.env.BASIC_AUTH_USER
      ? {
          username: process.env.BASIC_AUTH_USER,
          password: process.env.BASIC_AUTH_PASS || "",
        }
      : undefined,
  },

  // =========================================================================
  // [ADVANCED UPGRADE 4]: UI Authentication via StorageState & Project Dependencies
  // =========================================================================
  projects: [
    // 0. Project Setup chạy trước 1 lần duy nhất để tạo file session tests/auth/ui_admin.json
    {
      name: "setup",
      testMatch: /.*admin\.setup\.js/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.UI_BASE_URL,
      },
    },

    // 1. Project chạy Test Admin UI trên Chrome (Case 1 - 18)
    /* [CŨ - CHƯA CÓ STORAGE STATE]:
    {
      name: "Admin UI Tests - Chrome",
      testDir: "./tests/ui",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.UI_BASE_URL,
      },
    },
    */
    // [MỚI - TÁI SỬ DỤNG STORAGE STATE & DEPENDENCY SETUP]:
    {
      name: "Admin UI Tests - Chrome",
      testDir: "./tests/ui",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.UI_BASE_URL,
        storageState: "tests/auth/ui_admin.json",
      },
    },

    // 2. Project chạy Test API (Case 19 - 49)
    {
      name: "API Tests",
      testDir: "./tests/api",
      use: {
        baseURL: process.env.API_BASE_URL,
        extraHTTPHeaders: {
          Accept: "application/json",
        },
      },
    },

    // 3. Project chạy Test E2E (Case 50 - 57)
    /* [CŨ - CHƯA CÓ STORAGE STATE]:
    {
      name: "E2E Tests",
      testDir: "./tests/e2e",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.UI_BASE_URL,
      },
    },
    */
    // [MỚI - TÁI SỬ DỤNG STORAGE STATE & DEPENDENCY SETUP]:
    {
      name: "E2E Tests",
      testDir: "./tests/e2e",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.UI_BASE_URL,
        storageState: "tests/auth/ui_admin.json",
      },
    },
  ],
});
