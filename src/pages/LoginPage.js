import { expect } from "@playwright/test";
import { loginData } from "../test-data/loginData.js";
import { ENDPOINTS } from "../config/endpoint.js";
import { HTTP_STATUS_CODE } from "../utils/constants.js";

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
    this.toastNotifications = page.locator(
      loginData.selectors.toastNotifications,
    );
  }

  async goto() {
    try {
      await this.page.goto(loginData.url, { waitUntil: "load" });
    } catch {
      await this.page.waitForTimeout(1000);
      await this.page.goto(loginData.url, { waitUntil: "load" });
    }
    await this.accountInput.waitFor({ state: "visible" });
    await this.loginButton.waitFor({ state: "visible" });

    // Ensure Next.js client component hydration has completed before interaction
    await this.page
      .waitForFunction(
        () => {
          const input = document.querySelector("input");
          return (
            input &&
            Object.keys(input).some((k) => k.startsWith("__react"))
          );
        },
        { timeout: 7000 },
      )
      .catch(() => null);
  }

  async login(account, password) {
    if (account !== undefined) {
      await this.accountInput.fill(account);
    }
    if (password !== undefined) {
      await this.passwordInput.fill(password);
    }

    // Guard: React hydration in Next.js can reset inputs if mounting coincided with fill
    if (account && (await this.accountInput.inputValue()) !== account) {
      await this.accountInput.fill(account);
    }
    if (password && (await this.passwordInput.inputValue()) !== password) {
      await this.passwordInput.fill(password);
    }

    const loginResponsePromise = this.page
      .waitForResponse((resp) => resp.url().includes(ENDPOINTS.AUTH.LOGIN), {
        timeout: 10000,
      })
      .catch(() => null);

    await this.loginButton.click();
    const loginResponse = await loginResponsePromise;

    if (loginResponse) {
      const status = loginResponse.status();
      if (status !== HTTP_STATUS_CODE.OK) {
        const respText = await loginResponse.text().catch(() => "");
        console.error(
          `\n[LOGIN API ERROR] Status: ${status}, Body: ${respText}\n`,
        );
      }
    }
  }

  async verifyLoginSuccess(expectedTitle) {
    let clientAuthError = null;
    let checkInterval = null;
    const errorHandler = (msg) => {
      const text = msg.text();
      if (
        text.includes("Firebaseでのログイン中にエラーが発生しました") ||
        text.includes("auth/network-request-failed")
      ) {
        clientAuthError = text;
      }
    };
    this.page.on("console", errorHandler);

    try {
      const waitAuth = Promise.all([
        expect(this.page).not.toHaveURL(new RegExp(loginData.url), {
          timeout: 8000,
        }),
        expectedTitle
          ? expect(this.page).toHaveTitle(expectedTitle, { timeout: 8000 })
          : Promise.resolve(),
      ]);

      const abortOnClientError = new Promise((_, reject) => {
        checkInterval = setInterval(() => {
          if (clientAuthError) {
            clearInterval(checkInterval);
            reject(
              new Error(`[CLIENT FIREBASE AUTH FAILED]: ${clientAuthError}`),
            );
          }
        }, 150);
      });

      await Promise.race([waitAuth, abortOnClientError]);
    } catch (e) {
      const texts = await this.toastNotifications.allInnerTexts().catch(() => []);
      const uniqueTexts = [
        ...new Set(texts.map((t) => (t || "").trim()).filter(Boolean)),
      ];
      console.error("\n[LOGIN FAILED - URL]:", this.page.url());
      console.error("[LOGIN FAILED - TOASTS]:", uniqueTexts, "\n");
      throw e;
    } finally {
      if (checkInterval) clearInterval(checkInterval);
      this.page.off("console", errorHandler);
    }
  }
}
