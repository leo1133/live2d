import { expect } from "@playwright/test";
import { loginData } from "../test-data/loginData.js";

export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Form Inputs & Links dựa trên Page_Object_Model
    this.accountInput = page.getByRole("textbox", {
      name: loginData.items.email,
    });
    this.passwordInput = page.getByRole("textbox", {
      name: loginData.items.password,
    });
    this.loginButton = page.getByRole("button", {
      name: loginData.items.loginButton,
    });
    this.forgotPasswordLink = page.getByRole("link", {
      name: loginData.items.forgotPassword,
    });

    // Toast error khi sai credentials (dùng role 'listitem' giống POM gốc)
    this.toastErrorMsg = page
      .getByRole("listitem")
      .filter({ hasText: loginData.messages.invalidCredentials });
  }

  async goto() {
    await this.page.goto(loginData.url);
  }

  async login(account, password) {
    if (account !== undefined) {
      await this.accountInput.fill(account);
    }
    if (password !== undefined) {
      await this.passwordInput.fill(password);
    }
    // Click bình thường, để các assertion tự chờ kết quả
    await this.loginButton.click();
  }

  async verifyLoginSuccess(expectedTitle) {
    // Dùng expect().toHaveTitle() có cơ chế tự động thử lại (auto-retrying) 
    // thay vì waitForURL để tránh lỗi race condition gây timeout.
    await expect(this.page).toHaveTitle(expectedTitle);
  }
}
