import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "../../src/pages/LoginPage.js";
import { loginData } from "../../src/test-data/loginData.js";
import { userData } from "../../src/test-data/userData.js";
import path from "path";
import fs from "fs";

const authDir = path.resolve(process.cwd(), "tests/auth");
const authFile = path.join(authDir, "ui_admin.json");

/**
 * [ADVANCED FEATURE] UI Authentication Setup
 * Thực hiện đăng nhập 1 lần duy nhất trên UI và lưu trạng thái phiên (Cookies, Local Storage)
 * vào file tests/auth/ui_admin.json để tất cả các UI tests khác tái sử dụng mà không cần login lại.
 */
setup("Authenticate UI Admin and save storageState", async ({ page }) => {
  setup.setTimeout(60000);

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(
    loginData.credentials.account,
    loginData.credentials.password,
  );

  // Đảm bảo đăng nhập thành công
  await loginPage.verifyLoginSuccess(new RegExp(userData.titles.dashboard));

  // Tạo thư mục nếu chưa tồn tại và lưu session storageState
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  await page.context().storageState({ path: authFile });
  console.log(`[STORAGE STATE] UI Admin session saved successfully to ${authFile}`);
});
