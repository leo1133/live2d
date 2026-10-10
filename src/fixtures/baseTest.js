import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { UserPage } from "../pages/UserPage.js";
import { GachaPage } from "../pages/GachaPage.js";
import { AuthAPI } from "../api/AuthAPI.js";
import { UserAPI } from "../api/UserAPI.js";
import { GachaAPI } from "../api/GachaAPI.js";
import fs from "fs";
import path from "path";

const ENV = process.env.ENV || "dev";
const authDir = path.join(process.cwd(), "tests", "auth");
const authFile = path.join(authDir, `user_${ENV}.json`);

export class CustomApiClient {
  constructor(requestContext, isAuthRequest = true) {
    this.requestContext = requestContext;
    this.isAuthRequest = isAuthRequest;
  }

  async handleRequest(requestFn) {
    const response = await requestFn();
    if (
      this.isAuthRequest &&
      (response.status() === 401 || response.status() === 403)
    ) {
      if (fs.existsSync(authFile)) {
        try {
          fs.unlinkSync(authFile);
          console.log("Token expired/invalid. Token file deleted.");
        } catch (e) {
          console.error("Failed to delete token file:", e);
        }
      }
    }
    return response;
  }

  async get(url, options) {
    return this.handleRequest(() => this.requestContext.get(url, options));
  }
  async post(url, options) {
    return this.handleRequest(() => this.requestContext.post(url, options));
  }
  async put(url, options) {
    return this.handleRequest(() => this.requestContext.put(url, options));
  }
  async patch(url, options) {
    return this.handleRequest(() => this.requestContext.patch(url, options));
  }
  async delete(url, options) {
    return this.handleRequest(() => this.requestContext.delete(url, options));
  }
  async fetch(urlOrRequest, options) {
    return this.handleRequest(() =>
      this.requestContext.fetch(urlOrRequest, options),
    );
  }
}

async function getOrFetchToken(playwright) {
  if (fs.existsSync(authFile)) {
    try {
      const fileContent = fs.readFileSync(authFile, "utf-8");
      const { access_token } = JSON.parse(fileContent);
      if (access_token) {
        try {
          const payload = JSON.parse(
            Buffer.from(access_token.split(".")[1], "base64").toString(),
          );
          if (payload.exp && payload.exp * 1000 > Date.now() + 10000) {
            return access_token;
          }
        } catch {
          return access_token;
        }
      }
    } catch (e) {
      if (fs.existsSync(authFile)) fs.unlinkSync(authFile);
    }
  }

  const requestContext = await playwright.request.newContext();
  const apiBaseUrl =
    process.env.API_BASE_URL || "https://api-admin-dev.surrealdolls.com";
  const response = await requestContext.post(
    `${apiBaseUrl}/api/v1/auth/login/`,
    {
      data: {
        email_user_id: process.env.ADMIN_EMAIL || process.env.ADMIN_ID,
        password: process.env.ADMIN_PASSWORD,
        login_type: process.env.LOGIN_TYPE
          ? parseInt(process.env.LOGIN_TYPE, 10)
          : 1,
      },
    },
  );

  if (response.status() !== 200)
    throw new Error(`Auto-login failed with status ${response.status()}`);

  const body = await response.json();
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
  fs.writeFileSync(
    authFile,
    JSON.stringify({ access_token: body.access_token }, null, 2),
  );

  await requestContext.dispose();
  return body.access_token;
}

export const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // =========================================================================
  // [ADVANCED UPGRADE]: Custom Page Fixtures tự động nạp session và navigate
  // =========================================================================
  userPage: async ({ page }, use) => {
    const userPage = new UserPage(page);
    await userPage.navigateToUser();
    await use(userPage);
  },

  gachaPage: async ({ page }, use) => {
    const gachaPage = new GachaPage(page);
    await gachaPage.navigateToGachaList();
    await use(gachaPage);
  },

  authAPI: async ({ request }, use) => {
    await use(new AuthAPI(request));
  },

  userAPI: async ({ authenticatedRequest }, use) => {
    await use(new UserAPI(authenticatedRequest));
  },

  gachaAPI: async ({ authenticatedRequest }, use) => {
    await use(new GachaAPI(authenticatedRequest));
  },

  authenticatedRequest: async ({ playwright }, use) => {
    const access_token = await getOrFetchToken(playwright);
    const rawContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${access_token}` },
    });
    await use(new CustomApiClient(rawContext, true));
    await rawContext.dispose();
  },

  unauthenticatedRequest: async ({ playwright }, use) => {
    const rawContext = await playwright.request.newContext({
      extraHTTPHeaders: {},
    });
    await use(new CustomApiClient(rawContext, false));
    await rawContext.dispose();
  },

  db: async ({}, use) => {
    const { DBHelper } = await import("../utils/db.helper.js");
    await use(DBHelper);
  },
});

export const expect = base.expect;
