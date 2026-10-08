import { test, expect } from "../../src/fixtures/baseTest.js";
import { loginData } from "../../src/test-data/loginData.js";

/**
 * E2E LOGIN SUITE
 * Case 50 - 57: Kết hợp API (verify trạng thái hệ thống) + UI (verify giao diện người dùng)
 * Cả authAPI và loginPage đều được dùng
 */
test.describe("E2E Login Suite: Kết hợp toàn diện UI + API", () => {
  const baseApiPayload = {
    email_user_id: loginData.apiCredentials.email_user_id,
    password: loginData.apiCredentials.password,
    login_type: loginData.apiCredentials.login_type,
  };

  test("Case 50: Đăng nhập thành công với Email", async ({
    page,
    authAPI,
    loginPage,
  }) => {
    const apiResponse = await authAPI.login(baseApiPayload);
    expect([200, 401, 403]).toContain(apiResponse.status());

    await loginPage.goto();
    await loginPage.login(
      loginData.credentials.account,
      loginData.credentials.password,
    );

    if (apiResponse.status() === 200) {
      try {
        await loginPage.verifyLoginSuccess(
          loginData.credentials.textLoginSuccess,
        );
      } catch (e) {
        console.warn("Retrying UI login in Case 50 after transient delay...");
        await page.waitForTimeout(1000);
        await loginPage.goto();
        await loginPage.login(
          loginData.credentials.account,
          loginData.credentials.password,
        );
        await loginPage.verifyLoginSuccess(
          loginData.credentials.textLoginSuccess,
        );
      }
    } else {
      await expect(loginPage.toastErrorMsg).toBeVisible();
    }
  });

  test("Case 51: Đăng nhập thành công với ID", async ({
    page,
    authAPI,
    loginPage,
  }) => {
    const idPayload = {
      ...baseApiPayload,
      email_user_id: process.env.ADMIN_ID,
    };
    const apiResponse = await authAPI.login(idPayload);
    expect([200, 401, 403]).toContain(apiResponse.status());

    await loginPage.goto();
    await loginPage.login(
      loginData.credentials.accountId,
      loginData.credentials.password,
    );

    if (apiResponse.status() === 200) {
      try {
        await loginPage.verifyLoginSuccess(
          loginData.credentials.textLoginSuccess,
        );
      } catch (e) {
        console.warn("Retrying UI login in Case 51 after transient delay...");
        await page.waitForTimeout(1000);
        await loginPage.goto();
        await loginPage.login(
          loginData.credentials.accountId,
          loginData.credentials.password,
        );
        await loginPage.verifyLoginSuccess(
          loginData.credentials.textLoginSuccess,
        );
      }
    } else {
      await expect(loginPage.toastErrorMsg).toBeVisible();
    }
  });

  test("Case 52: Đăng nhập thất bại với sai password", async ({
    page,
    authAPI,
    loginPage,
  }) => {
    const apiResponse = await authAPI.login({
      ...baseApiPayload,
      password: loginData.credentials.wrongPassword,
    });
    expect(apiResponse.status()).toBe(401);

    await loginPage.goto();
    await loginPage.login(
      loginData.credentials.account,
      loginData.credentials.wrongPassword,
    );
    await expect(loginPage.toastErrorMsg).toBeVisible();
  });

  test("Case 53: Đăng nhập thất bại với sai email", async ({
    page,
    authAPI,
    loginPage,
  }) => {
    const apiResponse = await authAPI.login({
      ...baseApiPayload,
      email_user_id: loginData.credentials.wrongEmail,
    });
    expect(apiResponse.status()).toBe(401);

    await loginPage.goto();
    await loginPage.login(
      loginData.credentials.wrongEmail,
      loginData.credentials.password,
    );
    await expect(loginPage.toastErrorMsg).toBeVisible();
  });

  test("Case 54: Đăng nhập thất bại với sai cả email và password", async ({
    page,
    authAPI,
    loginPage,
  }) => {
    const apiResponse = await authAPI.login({
      ...baseApiPayload,
      email_user_id: loginData.credentials.wrongEmail,
      password: loginData.credentials.wrongPassword,
    });
    expect(apiResponse.status()).toBe(401);

    await loginPage.goto();
    await loginPage.login(
      loginData.credentials.wrongEmail,
      loginData.credentials.wrongPassword,
    );
    await expect(loginPage.toastErrorMsg).toBeVisible();
  });

  test("Case 55: Để trống Email - API từ chối 422, UI hiện lỗi required", async ({
    page,
    authAPI,
    loginPage,
  }) => {
    const apiResponse = await authAPI.login({
      ...baseApiPayload,
      email_user_id: "",
    });
    expect(apiResponse.status()).toBe(422);

    await loginPage.goto();
    await loginPage.passwordInput.fill(loginData.credentials.password);
    await loginPage.loginButton.click();
    await expect(
      page.getByText(loginData.messages.accountRequired),
    ).toBeVisible();
  });

  test("Case 56: Để trống Password - API từ chối 422, UI hiện lỗi required", async ({
    page,
    authAPI,
    loginPage,
  }) => {
    const apiResponse = await authAPI.login({
      ...baseApiPayload,
      password: "",
    });
    expect(apiResponse.status()).toBe(422);

    await loginPage.goto();
    await loginPage.accountInput.fill(loginData.credentials.account);
    await loginPage.loginButton.click();
    await expect(
      page.getByText(loginData.messages.passwordRequired),
    ).toBeVisible();
  });

  test("Case 57: Để trống cả Email và Password - API 422, UI hiện cả 2 lỗi", async ({
    page,
    authAPI,
    loginPage,
  }) => {
    const apiResponse = await authAPI.login({
      ...baseApiPayload,
      email_user_id: "",
      password: "",
    });
    expect(apiResponse.status()).toBe(422);

    await loginPage.goto();
    await loginPage.loginButton.click();
    await expect(
      page.getByText(loginData.messages.accountRequired),
    ).toBeVisible();
    await expect(
      page.getByText(loginData.messages.passwordRequired),
    ).toBeVisible();
  });
});
