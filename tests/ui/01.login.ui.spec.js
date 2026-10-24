import { test, expect } from '../../src/fixtures/baseTest.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { loginData } from '../../src/test-data/loginData.js';

/**
 * UI LOGIN SUITE
 * Case 1 - 18: Chỉ test thao tác DOM, nhập liệu, hiển thị giao diện
 * Không gọi API -> Không cần authAPI
 */
test.describe.serial('UI Login Suite: Kiểm tra thao tác giao diện DOM', () => {
  let sharedPage;
  let loginPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60000);
    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      storageState: { cookies: [], origins: [] },
      httpCredentials: process.env.BASIC_AUTH_USER
        ? {
            username: process.env.BASIC_AUTH_USER,
            password: process.env.BASIC_AUTH_PASS,
          }
        : undefined,
    });
    sharedPage = await context.newPage();
    loginPage = new LoginPage(sharedPage);
    await loginPage.goto();
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  test.beforeEach(async () => {
    if (!sharedPage.url().includes(loginData.url)) {
      await loginPage.goto();
    } else {
      await loginPage.accountInput.fill("").catch(() => {});
      await loginPage.passwordInput.fill("").catch(() => {});
    }
  });

  test('Case 1: Test hiển thị của form login', async () => {
    await expect(loginPage.accountInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('Case 2: Ô Email cho phép nhập chữ cái', async () => {
    await loginPage.accountInput.fill(loginData.validateEmail.alphabet);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.alphabet);
  });

  test('Case 3: Ô Email cho phép nhập số', async () => {
    await loginPage.accountInput.fill(loginData.validateEmail.numeric);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.numeric);
  });

  test('Case 4: Ô Email cho phép nhập ký tự đặc biệt', async () => {
    await loginPage.accountInput.fill(loginData.validateEmail.specialCharacters);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.specialCharacters);
  });

  test('Case 5: Ô Email cho phép nhập email có khoảng trắng đầu cuối', async () => {
    await loginPage.accountInput.fill(loginData.validateEmail.spaceBeginEnd);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.spaceBeginEnd);
  });

  test('Case 6: Ô Email cho phép nhập email có khoảng trắng ở giữa', async () => {
    await loginPage.accountInput.fill(loginData.validateEmail.spaceBetween);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.spaceBetween);
  });

  test('Case 7: Ô Email cho phép nhập email thiếu ký tự @', async () => {
    await loginPage.accountInput.fill(loginData.validateEmail.missingAt);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.missingAt);
  });

  test('Case 8: Ô Email cho phép nhập email thiếu domain', async () => {
    await loginPage.accountInput.fill(loginData.validateEmail.missingDomain);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.missingDomain);
  });

  test('Case 9: Ô Email cho phép nhập email thiếu local part', async () => {
    await loginPage.accountInput.fill(loginData.validateEmail.missingLocalPart);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.missingLocalPart);
  });

  test('Case 10: Ô Email cho phép nhập email có 2 ký tự @', async () => {
    await loginPage.accountInput.fill(loginData.validateEmail.duplicateAt);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.duplicateAt);
  });

  test('Case 11: Ô Email cho phép nhập email có domain không hợp lệ', async () => {
    await loginPage.accountInput.fill(loginData.validateEmail.invalidDomain);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.invalidDomain);
  });

  test('Case 12: Ô Password cho phép nhập chữ cái', async () => {
    await loginPage.passwordInput.fill(loginData.validatePassword.alphabet);
    await expect(loginPage.passwordInput).toHaveValue(loginData.validatePassword.alphabet);
  });

  test('Case 13: Ô Password cho phép nhập số', async () => {
    await loginPage.passwordInput.fill(loginData.validatePassword.numeric);
    await expect(loginPage.passwordInput).toHaveValue(loginData.validatePassword.numeric);
  });

  test('Case 14: Ô Password cho phép nhập ký tự đặc biệt', async () => {
    await loginPage.passwordInput.fill(loginData.validatePassword.specialCharacters);
    await expect(loginPage.passwordInput).toHaveValue(loginData.validatePassword.specialCharacters);
  });

  test('Case 15: Ô Password cho phép nhập password có khoảng trắng đầu cuối', async () => {
    await loginPage.passwordInput.fill(loginData.validatePassword.spaceBeginEnd);
    await expect(loginPage.passwordInput).toHaveValue(loginData.validatePassword.spaceBeginEnd);
  });

  test('Case 16: Ô Password cho phép nhập password có khoảng trắng', async () => {
    await loginPage.passwordInput.fill(loginData.validatePassword.space);
    await expect(loginPage.passwordInput).toHaveValue(loginData.validatePassword.space);
  });

  test('Case 17: Ô Password cho phép nhập dữ liệu dài', async () => {
    await loginPage.passwordInput.fill(loginData.validatePassword.longPassword);
    await expect(loginPage.passwordInput).toHaveValue(loginData.validatePassword.longPassword);
  });

  test('Case 18: Kiểm tra khi click hyperlink Forgot password', async () => {
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(async () => {
      if (!sharedPage.url().includes(loginData.forgotPasswordScreen.url)) {
        await loginPage.forgotPasswordLink.click().catch(() => {});
        const confirmBtn = sharedPage.getByRole('button', { name: 'はい' });
        if (await confirmBtn.isVisible({ timeout: 500 }).catch(() => false)) {
          await confirmBtn.click().catch(() => {});
        }
      }
      await expect(sharedPage).toHaveURL(new RegExp(loginData.forgotPasswordScreen.url));
    }).toPass({ timeout: 10000 });
  });

});
