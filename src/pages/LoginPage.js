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
    try {
      await this.page.goto(loginData.url, { waitUntil: "domcontentloaded" });
    } catch {
      await this.page.waitForTimeout(1000);
      await this.page.goto(loginData.url, { waitUntil: "domcontentloaded" });
    }
    await this.accountInput.waitFor({ state: "visible" });
    await this.loginButton.waitFor({ state: "visible" });

    // Wait for version check or initial hydration request
    await this.page
      .waitForResponse(
        (resp) => resp.url().includes("/api/v1/common/version"),
        { timeout: 3500 },
      )
      .catch(() => null);

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
    await this.accountInput.waitFor({ state: "visible" });
    await this.loginButton.waitFor({ state: "visible" });

    if (account !== undefined) {
      await this.accountInput.click();
      await this.accountInput.fill(account);
      if (account) {
        await expect(this.accountInput)
          .toHaveValue(account, { timeout: 3000 })
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
          .toHaveValue(password, { timeout: 3000 })
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

    const loginResponsePromise = this.page
      .waitForResponse((resp) => resp.url().includes("/api/v1/auth/login/"), {
        timeout: 15000,
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
      const racePromises = [
        this.page.waitForURL((url) => !url.pathname.includes("/sign-in"), {
          timeout: 15000,
          waitUntil: "domcontentloaded",
        }),
      ];
      if (expectedTitle) {
        racePromises.push(
          expect(this.page).toHaveTitle(expectedTitle, { timeout: 15000 }),
        );
      }
      await Promise.race(racePromises);
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
