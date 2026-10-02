import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { AuthAPI } from '../api/AuthAPI.js';

export const test = base.extend({
  // Tiêm UI Pages
  loginPage: async ({ page }, use) => {
    // Khởi tạo instance và truyền vào test
    await use(new LoginPage(page));
  },
  
  // Tiêm API Controllers (sử dụng context 'request' có sẵn của Playwright)
  authAPI: async ({ request }, use) => {
    // Khởi tạo instance và truyền vào test
    await use(new AuthAPI(request));
  }
});

// Export lại expect để các file test không cần import lại từ '@playwright/test'
export const expect = base.expect;
