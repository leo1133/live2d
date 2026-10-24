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
  }

  async goto() {
    try {
      await this.page.goto(loginData.url, { waitUntil: "domcontentloaded" });
    } catch {
      await this.page.waitForTimeout(loginData.timeouts.retryDelay);
      await this.page.goto(loginData.url, { waitUntil: "domcontentloaded" });
    }
    await this.accountInput.waitFor({ state: "visible" });
    await this.loginButton.waitFor({ state: "visible" });
    // Đảm bảo Next.js React hydration hoàn tất và gắn xong event listener
    await this.page
      .waitForFunction(
        () => {
          const input = document.querySelector("input");
          const btn =
            document.querySelector('button[type="submit"]') ||
            document.querySelector("button");
          return Boolean(
            input &&
              Object.keys(input).some((k) => k.startsWith("__reactFiber")) &&
              btn &&
              Object.keys(btn).some((k) => k.startsWith("__reactFiber")),
          );
        },
        { timeout: 7000 },
      )
      .catch(() => null);
  }

  async login(account, password) {
    await this.accountInput.waitFor({ state: "visible" });
    await this.loginButton.waitFor({ state: "visible" });

    if (account !== undefined) {
      await this.accountInput.click();
      await this.accountInput.fill(account);
      if (account) {
        await expect(this.accountInput)
          .toHaveValue(account, { timeout: loginData.timeouts.inputFill })
          .catch(async () => {
            await this.accountInput.click();
            await this.accountInput.fill(account);
          });
      }
    }
    if (password !== undefined) {
      await this.passwordInput.click();
      await this.passwordInput.fill(password);
      if (password) {
        await expect(this.passwordInput)
          .toHaveValue(password, { timeout: loginData.timeouts.inputFill })
          .catch(async () => {
            await this.passwordInput.click();
            await this.passwordInput.fill(password);
          });
      }
    }

    // Double-check inputs are still filled before submitting (guard against delayed React hydration reset)
    if (account && (await this.accountInput.inputValue()) !== account) {
      await this.accountInput.click();
      await this.accountInput.fill(account);
    }
    if (password && (await this.passwordInput.inputValue()) !== password) {
      await this.passwordInput.click();
      await this.passwordInput.fill(password);
    }

    let loginResponse = null;
    try {
      const loginRespPromise = this.page.waitForResponse(
        (resp) => resp.url().includes(ENDPOINTS.AUTH.LOGIN),
        { timeout: loginData.timeouts.loginResponse },
      );
      await this.loginButton.click();
      loginResponse = await loginRespPromise;
    } catch {
      // Nếu click đầu tiên bị trôi do React chưa hydrate xong onSubmit, click lại lần 2
      try {
        const retryRespPromise = this.page.waitForResponse(
          (resp) => resp.url().includes(ENDPOINTS.AUTH.LOGIN),
          { timeout: loginData.timeouts.loginResponseRetry },
        );
        await this.loginButton.click();
        loginResponse = await retryRespPromise;
      } catch {}
    }

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
    try {
      const racePromises = [
        this.page.waitForURL((url) => !url.pathname.includes(loginData.url), {
          timeout: loginData.timeouts.redirect,
          waitUntil: "domcontentloaded",
        }),
      ];
      if (expectedTitle) {
        racePromises.push(
          expect(this.page).toHaveTitle(expectedTitle, {
            timeout: loginData.timeouts.redirect,
          }),
        );
      }
      await Promise.race(racePromises);
    } catch (e) {
      const toastLocators = this.page.locator(loginData.selectors.toast);
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

