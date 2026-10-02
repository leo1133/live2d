import { expect } from "@playwright/test";
import { loginData } from "../test-data/loginData.js";

export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

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
    await this.loginButton.click();
  }

  async verifyLoginSuccess(expectedTitle) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }
}
