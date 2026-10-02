import { test, expect } from '../../src/fixtures/baseTest.js';
import { loginData } from '../../src/test-data/loginData.js';

/**
 * UI LOGIN SUITE
 * Case 1 - 13: Chỉ test thao tác DOM, nhập liệu, hiển thị giao diện
 * Không gọi API -> Không cần authAPI
 */
test.describe('UI Login Suite: Kiểm tra thao tác giao diện DOM', () => {

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  // ------------------------------------------------------------------
  // 1. HIỂN THỊ FORM
  // ------------------------------------------------------------------
  test('Case 1: Test hiển thị của form login', async ({ loginPage }) => {
    await expect(loginPage.accountInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  // ------------------------------------------------------------------
  // 2. VALIDATE Ô EMAIL (UI - toHaveValue)
  // ------------------------------------------------------------------
  test('Case 2: Ô Email cho phép nhập chữ cái', async ({ loginPage }) => {
    await loginPage.accountInput.fill(loginData.validateEmail.alphabet);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.alphabet);
  });

  test('Case 3: Ô Email cho phép nhập số', async ({ loginPage }) => {
    await loginPage.accountInput.fill(loginData.validateEmail.numeric);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.numeric);
  });

  test('Case 4: Ô Email cho phép nhập ký tự đặc biệt', async ({ loginPage }) => {
    await loginPage.accountInput.fill(loginData.validateEmail.specialCharacters);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.specialCharacters);
  });

  test('Case 5: Ô Email cho phép nhập email có khoảng trắng đầu cuối', async ({ loginPage }) => {
    await loginPage.accountInput.fill(loginData.validateEmail.spaceBeginEnd);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.spaceBeginEnd);
  });

  test('Case 6: Ô Email cho phép nhập email có khoảng trắng ở giữa', async ({ loginPage }) => {
    await loginPage.accountInput.fill(loginData.validateEmail.spaceBetween);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.spaceBetween);
  });

  test('Case 7: Ô Email cho phép nhập email thiếu ký tự @', async ({ loginPage }) => {
    await loginPage.accountInput.fill(loginData.validateEmail.missingAt);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.missingAt);
  });

  test('Case 8: Ô Email cho phép nhập email thiếu domain', async ({ loginPage }) => {
    await loginPage.accountInput.fill(loginData.validateEmail.missingDomain);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.missingDomain);
  });

  test('Case 9: Ô Email cho phép nhập email thiếu local part', async ({ loginPage }) => {
    await loginPage.accountInput.fill(loginData.validateEmail.missingLocalPart);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.missingLocalPart);
  });

  test('Case 10: Ô Email cho phép nhập email có 2 ký tự @', async ({ loginPage }) => {
    await loginPage.accountInput.fill(loginData.validateEmail.duplicateAt);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.duplicateAt);
  });

  test('Case 11: Ô Email cho phép nhập email có domain không hợp lệ', async ({ loginPage }) => {
    await loginPage.accountInput.fill(loginData.validateEmail.invalidDomain);
    await expect(loginPage.accountInput).toHaveValue(loginData.validateEmail.invalidDomain);
  });

  // ------------------------------------------------------------------
  // 3. VALIDATE Ô PASSWORD (UI - toHaveValue)
  // ------------------------------------------------------------------
  test('Case 12: Ô Password cho phép nhập chữ cái', async ({ loginPage }) => {
    await loginPage.passwordInput.fill(loginData.validatePassword.alphabet);
    await expect(loginPage.passwordInput).toHaveValue(loginData.validatePassword.alphabet);
  });

  test('Case 13: Ô Password cho phép nhập số', async ({ loginPage }) => {
    await loginPage.passwordInput.fill(loginData.validatePassword.numeric);
    await expect(loginPage.passwordInput).toHaveValue(loginData.validatePassword.numeric);
  });

  test('Case 14: Ô Password cho phép nhập ký tự đặc biệt', async ({ loginPage }) => {
    await loginPage.passwordInput.fill(loginData.validatePassword.specialCharacters);
    await expect(loginPage.passwordInput).toHaveValue(loginData.validatePassword.specialCharacters);
  });

  test('Case 15: Ô Password cho phép nhập password có khoảng trắng đầu cuối', async ({ loginPage }) => {
    await loginPage.passwordInput.fill(loginData.validatePassword.spaceBeginEnd);
    await expect(loginPage.passwordInput).toHaveValue(loginData.validatePassword.spaceBeginEnd);
  });

  test('Case 16: Ô Password cho phép nhập password có khoảng trắng', async ({ loginPage }) => {
    await loginPage.passwordInput.fill(loginData.validatePassword.space);
    await expect(loginPage.passwordInput).toHaveValue(loginData.validatePassword.space);
  });

  test('Case 17: Ô Password cho phép nhập dữ liệu dài', async ({ loginPage }) => {
    await loginPage.passwordInput.fill(loginData.validatePassword.longPassword);
    await expect(loginPage.passwordInput).toHaveValue(loginData.validatePassword.longPassword);
  });

  // ------------------------------------------------------------------
  // 4. KIỂM TRA FORGOT PASSWORD LINK (UI)
  // ------------------------------------------------------------------
  test('Case 18: Kiểm tra khi click hyperlink Forgot password', async ({ page, loginPage }) => {
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await loginPage.forgotPasswordLink.click();
    
    // Kiểm tra đã redirect sang màn Forgot password chưa (bằng title)
    await expect(page).toHaveTitle(loginData.forgotPasswordScreen.title);
  });

});
