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
      exact: true,
    });
    this.forgotPasswordLink = page.getByRole("link", {
      name: loginData.items.forgotPassword,
      exact: true,
    });

    this.toastErrorMsg = page.getByText(loginData.messages.invalidCredentials);
  }

  async goto() {
    await this.page.goto(loginData.url, { waitUntil: "domcontentloaded" });
    await this.accountInput.waitFor({ state: "visible" });
    await this.loginButton.waitFor({ state: "visible" });
    await this.page.waitForTimeout(500);
  }

  async login(account, password) {
    await this.accountInput.waitFor({ state: "visible" });
    await this.page.waitForTimeout(300);

    if (account !== undefined) {
      await this.accountInput.click();
      await this.accountInput.fill(account);
    }
    if (password !== undefined) {
      await this.passwordInput.click();
      await this.passwordInput.fill(password);
    }
    await this.page.waitForTimeout(300);

    const loginResponsePromise = this.page
      .waitForResponse((resp) => resp.url().includes("/api/v1/auth/login/"), {
        timeout: 20000,
      })
      .catch(() => null);

    await this.loginButton.click();
    const loginResponse = await loginResponsePromise;
    if (loginResponse) {
      const status = loginResponse.status();
      if (status !== 200) {
        const respText = await loginResponse.text().catch(() => "");
        console.error(
          `\n[LOGIN API ERROR] Status: ${status}, Body: ${respText}\n`,
        );
      }
    }
  }

  async verifyLoginSuccess(expectedTitle) {
    try {
      await Promise.race([
        this.page.waitForURL((url) => !url.pathname.includes("/sign-in"), {
          timeout: 15000,
          waitUntil: "domcontentloaded",
        }),
        expect(this.page).toHaveTitle(expectedTitle, { timeout: 15000 }),
      ]);
      await this.page.waitForTimeout(500);
    } catch (e) {
      const toastLocators = this.page.locator(
        '[data-sonner-toast], [data-title], [data-description], [role="alert"], [role="status"], section[aria-label*="Notifications"] *',
      );
      const texts = await toastLocators.allInnerTexts().catch(() => []);
      const uniqueTexts = [
        ...new Set(texts.map((t) => t.trim()).filter(Boolean)),
      ];
      console.error("\n[LOGIN FAILED - URL]:", this.page.url());
      console.error("[LOGIN FAILED - TOASTS]:", uniqueTexts, "\n");
      throw e;
    }
  }
}
