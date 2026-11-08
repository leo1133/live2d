import { test as setup } from "@playwright/test";
import { LoginPage } from "../../src/pages/LoginPage.js";
import { loginData } from "../../src/test-data/loginData.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";
import fs from "fs";
import path from "path";

const authDir = path.join(process.cwd(), "tests", "auth");
export const STORAGE_STATE_PATH = getUiSessionFile();

/**
 * Kiểm tra xem session đã lưu trong file còn hạn sử dụng hay không
 */
function isSessionValid() {
  if (!fs.existsSync(STORAGE_STATE_PATH)) return false;
  try {
    const stat = fs.statSync(STORAGE_STATE_PATH);
    // Nếu file session đã lưu hơn 2 tiếng thì login lại để bảo đảm token luôn tươi mới
    if (Date.now() - stat.mtimeMs > 2 * 60 * 60 * 1000) return false;

    const data = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, "utf-8"));
    if (!data.cookies || data.cookies.length === 0) return false;

    const tokenCookies = data.cookies.filter((c) => c.name === "access_token");
    if (tokenCookies.length === 0) return false;

    for (const cookie of tokenCookies) {
      if (!cookie.value) return false;
      const payload = JSON.parse(
        Buffer.from(cookie.value.split(".")[1], "base64").toString(),
      );
      // Còn hạn sử dụng ít nhất 5 phút
      if (!payload.exp || payload.exp * 1000 <= Date.now() + 5 * 60 * 1000) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

setup("Authenticate UI Admin & Cache Session", async ({ page }) => {
  setup.setTimeout(60000);

  // 1. Tối ưu tốc độ: Nếu session đã có và còn hạn thì bỏ qua bước mở browser login
  if (isSessionValid()) {
    console.log(
      `[AUTH SETUP] Session còn hạn sử dụng, tái sử dụng: ${STORAGE_STATE_PATH}`,
    );
    return;
  }

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(
    loginData.credentials.account,
    loginData.credentials.password,
  );

  try {
    await loginPage.verifyLoginSuccess(loginData.credentials.textLoginSuccess);
  } catch (err) {
    console.warn("[AUTH SETUP] Retrying login after transient delay...");
    await page.waitForTimeout(1000);
    await loginPage.goto();
    await loginPage.login(
      loginData.credentials.account,
      loginData.credentials.password,
    );
    await loginPage.verifyLoginSuccess(loginData.credentials.textLoginSuccess);
  }

  // 2. Tối ưu dung lượng: Lọc bỏ các cache video/asset rác trong localStorage, đồng bộ expires cookie
  const rawState = await page.context().storageState();
  const cleanState = {
    cookies: (rawState.cookies || []).map((cookie) => {
      // Đồng bộ thời hạn lưu cookie trên browser khớp với thời hạn exp của JWT token (tránh browser tự drop cookie sau 3 phút)
      if (cookie.value && cookie.value.includes(".")) {
        try {
          const payload = JSON.parse(
            Buffer.from(cookie.value.split(".")[1], "base64").toString(),
          );
          if (payload.exp && typeof payload.exp === "number") {
            return {
              ...cookie,
              expires: payload.exp,
            };
          }
        } catch {}
      }
      return cookie;
    }),
    origins: (rawState.origins || []).map((origin) => ({
      origin: origin.origin,
      // Lọc bỏ toàn bộ cache asset/video rác và admin_last_activity_at cũ (để app tự khởi tạo phiên mới, tránh bị timeout do nhàn rỗi)
      localStorage: (origin.localStorage || []).filter(
        (item) =>
          !item.name.startsWith("surreal-resource-") &&
          item.name !== "admin_last_activity_at",
      ),
    })),
  };

  fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(cleanState, null, 2));
  console.log(
    `[AUTH SETUP] Đã tối ưu và lưu UI session gọn nhẹ vào: ${STORAGE_STATE_PATH}`,
  );
});
