import { test as setup } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { loginData } from '../../src/test-data/loginData.js';
import { getUiSessionFile } from '../../src/config/endpoint.js';
import fs from 'fs';
import path from 'path';

const authDir = path.join(process.cwd(), 'tests', 'auth');
export const STORAGE_STATE_PATH = getUiSessionFile();

/**
 * Kiểm tra xem session đã lưu trong file còn hạn sử dụng hay không
 */
function isSessionValid() {
  if (!fs.existsSync(STORAGE_STATE_PATH)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'));
    const tokenCookie = data.cookies?.find((c) => c.name === 'access_token');
    if (!tokenCookie?.value) return false;

    const payload = JSON.parse(
      Buffer.from(tokenCookie.value.split('.')[1], 'base64').toString()
    );
    // Còn hạn sử dụng ít nhất 60 giây
    return Boolean(payload.exp && payload.exp * 1000 > Date.now() + 60000);
  } catch {
    return false;
  }
}

setup('Authenticate UI Admin & Cache Session', async ({ page }) => {
  setup.setTimeout(60000);

  // 1. Tối ưu tốc độ: Nếu session đã có và còn hạn thì bỏ qua bước mở browser login
  if (isSessionValid()) {
    console.log(`[AUTH SETUP] Session còn hạn sử dụng, tái sử dụng: ${STORAGE_STATE_PATH}`);
    return;
  }

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(
    loginData.credentials.account,
    loginData.credentials.password
  );

  try {
    await loginPage.verifyLoginSuccess(loginData.credentials.textLoginSuccess);
  } catch (err) {
    console.warn('[AUTH SETUP] Retrying login after transient delay...');
    await page.waitForTimeout(1000);
    await loginPage.goto();
    await loginPage.login(
      loginData.credentials.account,
      loginData.credentials.password
    );
    await loginPage.verifyLoginSuccess(loginData.credentials.textLoginSuccess);
  }

  // 2. Tối ưu dung lượng: Lọc bỏ các cache video/asset rác trong localStorage, chỉ giữ session sạch
  const rawState = await page.context().storageState();
  const cleanState = {
    cookies: rawState.cookies || [],
    origins: (rawState.origins || []).map((origin) => ({
      origin: origin.origin,
      // Lọc bỏ toàn bộ cache asset/video nặng nề không liên quan đến phiên xác thực
      localStorage: (origin.localStorage || []).filter(
        (item) => !item.name.startsWith('surreal-resource-')
      ),
    })),
  };

  fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(cleanState, null, 2));
  console.log(`[AUTH SETUP] Đã tối ưu và lưu UI session gọn nhẹ vào: ${STORAGE_STATE_PATH}`);
});
