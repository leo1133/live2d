import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { AuthAPI } from '../api/AuthAPI.js';
import { ENDPOINTS, getApiBaseUrl, getApiTokenFile } from '../config/endpoint.js';
import fs from "fs";
import path from "path";

const authDir = path.join(process.cwd(), "tests", "auth");
const authFile = getApiTokenFile();

let inMemoryToken = null;

export class CustomApiClient {
  constructor(requestContext, isAuthRequest = true) {
    this.requestContext = requestContext;
    this.isAuthRequest = isAuthRequest;
  }

  async handleRequest(requestFn) {
    const response = await requestFn();
    if (this.isAuthRequest && (response.status() === 401 || response.status() === 403)) {
      inMemoryToken = null;
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

  async get(url, options) { return this.handleRequest(() => this.requestContext.get(url, options)); }
  async post(url, options) { return this.handleRequest(() => this.requestContext.post(url, options)); }
  async put(url, options) { return this.handleRequest(() => this.requestContext.put(url, options)); }
  async patch(url, options) { return this.handleRequest(() => this.requestContext.patch(url, options)); }
  async delete(url, options) { return this.handleRequest(() => this.requestContext.delete(url, options)); }
  async fetch(urlOrRequest, options) { return this.handleRequest(() => this.requestContext.fetch(urlOrRequest, options)); }
}

function saveTokenToFile(tokenData) {
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
  const tempFile = `${authFile}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(tokenData, null, 2));
  fs.renameSync(tempFile, authFile);
}

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return Boolean(payload.exp && payload.exp * 1000 > Date.now() + 15000);
  } catch {
    return false;
  }
}

async function getOrFetchToken(playwright) {
  // 1. In-memory cache check
  if (isTokenValid(inMemoryToken)) {
    return inMemoryToken;
  }

  // 2. File cache check
  let cachedRefreshToken = null;
  if (fs.existsSync(authFile)) {
    try {
      const fileContent = fs.readFileSync(authFile, "utf-8");
      const data = JSON.parse(fileContent);
      const { access_token, refresh_token } = data;
      cachedRefreshToken = refresh_token;

      if (isTokenValid(access_token)) {
        inMemoryToken = access_token;
        return access_token;
      }
    } catch (e) {
      if (fs.existsSync(authFile)) {
        try { fs.unlinkSync(authFile); } catch {}
      }
    }
  }

  const apiBaseUrl = getApiBaseUrl();
  const requestContext = await playwright.request.newContext({ baseURL: apiBaseUrl });

  // 3. Try refresh token if available
  if (cachedRefreshToken) {
    try {
      const refreshResponse = await requestContext.post(ENDPOINTS.AUTH.REFRESH_TOKEN, {
        data: { refresh_token: cachedRefreshToken },
      });
      if (refreshResponse.status() === 200) {
        const body = await refreshResponse.json();
        if (body.access_token) {
          saveTokenToFile({
            access_token: body.access_token,
            refresh_token: body.refresh_token || cachedRefreshToken,
          });
          inMemoryToken = body.access_token;
          await requestContext.dispose();
          return body.access_token;
        }
      }
    } catch {
      // Fall through to full login
    }
  }

  // 4. Full Login
  const response = await requestContext.post(ENDPOINTS.AUTH.LOGIN, {
    data: {
      email_user_id: process.env.ADMIN_EMAIL || process.env.ADMIN_ID,
      password: process.env.ADMIN_PASSWORD,
      login_type: process.env.LOGIN_TYPE ? parseInt(process.env.LOGIN_TYPE, 10) : 1,
    },
  });

  if (response.status() !== 200) {
    await requestContext.dispose();
    throw new Error(`Auto-login failed with status ${response.status()}`);
  }

  const body = await response.json();
  saveTokenToFile({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  });
  inMemoryToken = body.access_token;

  await requestContext.dispose();
  return body.access_token;
}

export const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  
  authAPI: async ({ request }, use) => {
    await use(new AuthAPI(request));
  },

  authenticatedRequest: async ({ playwright }, use) => {
    const access_token = await getOrFetchToken(playwright);
    const rawContext = await playwright.request.newContext({
      baseURL: getApiBaseUrl(),
      extraHTTPHeaders: { Authorization: `Bearer ${access_token}` },
    });
    await use(new CustomApiClient(rawContext, true));
    await rawContext.dispose();
  },

  unauthenticatedRequest: async ({ playwright }, use) => {
    const rawContext = await playwright.request.newContext({
      baseURL: getApiBaseUrl(),
      extraHTTPHeaders: {},
    });
    await use(new CustomApiClient(rawContext, false));
    await rawContext.dispose();
  },

  db: async ({}, use) => {
    const { DBHelper } = await import('../utils/db.helper.js');
    await use(DBHelper);
  }
});

export const expect = base.expect;
