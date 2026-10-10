import { test, expect } from "../../src/fixtures/baseTest.js";
import { loginData } from "../../src/test-data/loginData.js";
import { userData } from "../../src/test-data/userData.js";

test.describe("E2E User List Suite: Kết hợp UI + API", () => {
  // =========================================================================
  // [CŨ]: Phải tự khởi tạo browser.newContext, đọc path/fs, gọi loginPage và try...catch
  // =========================================================================
  /*
  let sharedPage;
  let userPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60000);
    const authPath = path.resolve(process.cwd(), "tests/auth/ui_admin.json");
    const hasStorageState = fs.existsSync(authPath);

    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      storageState: hasStorageState ? authPath : undefined,
      httpCredentials: process.env.BASIC_AUTH_USER
        ? {
            username: process.env.BASIC_AUTH_USER,
            password: process.env.BASIC_AUTH_PASS,
          }
        : undefined,
    });
    sharedPage = await context.newPage();
    userPage = new UserPage(sharedPage);

    // Điền login thủ công và try-catch...
    const loginPage = new LoginPage(sharedPage);
    await loginPage.goto();
    await loginPage.login(loginData.credentials.account, loginData.credentials.password);
    try {
      await loginPage.verifyLoginSuccess(new RegExp(userData.titles.dashboard));
    } catch (err) {
      console.warn("Retrying login after transient failure...");
    }

    await userPage.navigateToUser();
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });
  */

  // =========================================================================
  // [MỚI - CÁCH 2]: Sử dụng trực tiếp Custom Fixture `userPage` từ baseTest.js
  // (Đã tự động nạp storageState session và tự điều hướng navigateToUser)
  // =========================================================================
  test("TC_E2E_01: Kiểm tra tính đồng bộ tổng số lượng bản ghi (Total Count) giữa UI và API", async ({
    userPage,
    authAPI,
    request,
  }) => {
    const summaryText = await userPage.paginationSummary.innerText();

    const match = summaryText.match(userData.pagination.summaryRegex);
    expect(match).not.toBeNull();
    const uiTotalCount = parseInt(match[1].replace(/,/g, ""), 10);

    const baseApiPayload = {
      email_user_id: loginData.apiCredentials.email_user_id,
      password: loginData.apiCredentials.password,
      login_type: loginData.apiCredentials.login_type,
    };
    const loginResp = await authAPI.login(baseApiPayload);
    expect(loginResp.status()).toBe(200);
    const loginBody = await loginResp.json();
    const token = loginBody.access_token;

    const apiResponse = await request.get(
      `${process.env.API_BASE_URL}/api/v1/user/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          page: 1,
          items_per_page: 10,
        },
      },
    );

    expect(apiResponse.status()).toBe(200);

    const body = await apiResponse.json();
    const apiTotalCount = body.total_count;

    expect(uiTotalCount).toBe(apiTotalCount);

    if (apiTotalCount > 0) {
      const rowsCount = await userPage.tableRows.count();
      expect(rowsCount).toBe(body.data.length);
    }
  });
});
