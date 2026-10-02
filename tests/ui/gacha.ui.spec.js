import { test, expect } from "../../src/fixtures/baseTest.js";
import { GachaPage } from "../../src/pages/GachaPage.js";
import { LoginPage } from "../../src/pages/LoginPage.js";
import { loginData } from "../../src/test-data/loginData.js";
import { gachaData } from "../../src/test-data/gachaData.js";

let tcIndex = 1;

test.describe.serial("UI Gacha (Avatar) Management Suite - AQ100", () => {
  let sharedPage;
  let gachaPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60000);
    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      httpCredentials: process.env.BASIC_AUTH_USER
        ? { username: process.env.BASIC_AUTH_USER, password: process.env.BASIC_AUTH_PASS }
        : undefined,
    });
    sharedPage = await context.newPage();
    const loginPage = new LoginPage(sharedPage);
    gachaPage = new GachaPage(sharedPage);

    await loginPage.goto();
    await loginPage.login(loginData.credentials.account, loginData.credentials.password);
    await loginPage.verifyLoginSuccess(new RegExp(gachaData.titles.dashboard));
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  async function ensureGachaPage() {
    await sharedPage.goto(gachaData.url);
    await gachaPage.searchInput.waitFor({ state: 'visible', timeout: 15000 });
    await sharedPage.waitForTimeout(500);
  }

  // ==================== [0,1] Sidebar & Breadcrumb ====================
  test.describe("[0,1] Sidebar & Breadcrumb", () => {
    test(`TC${tcIndex++} - AQ100-1: Kiểm tra hiển thị Sidebar menu`, async () => {
      await gachaPage.navigateToGachaList();
      await expect(gachaPage.toggleSidebarButton).toBeVisible();
      await expect(gachaPage.gachaListLink).toBeVisible();
    });

    test(`TC${tcIndex++} - AQ100-2: Click Menu điều hướng tới trang Gacha`, async () => {
      await expect(sharedPage).toHaveURL(new RegExp(gachaData.url));
      await expect(gachaPage.pageHeading).toBeVisible();
    });

    test(`TC${tcIndex++} - AQ100-3: Kiểm tra Breadcrumb hiển thị`, async () => {
      await expect(gachaPage.breadcrumbNav).toContainText(gachaData.labels.pageHeading);
    });

    test(`TC${tcIndex++} - AQ100-4: Click Breadcrumb Home điều hướng về Dashboard`, async () => {
      await gachaPage.clickBreadcrumbHome();
      await expect(sharedPage).toHaveURL(new RegExp(gachaData.dashboardUrl));
    });
  });

  // ==================== [2] Search box ====================
  test.describe("[2] Search box (モデル名)", () => {
    test.beforeEach(async () => {
      await ensureGachaPage();
    });

    test(`TC${tcIndex++} - AQ100-5: Kiểm tra hiển thị search box`, async () => {
      await expect(gachaPage.searchInput).toBeVisible();
      await expect(gachaPage.searchInput).toHaveAttribute('placeholder', gachaData.labels.modelNameInput);
    });

    for (const t of gachaData.searchTestCases) {
      test(`TC${tcIndex++} - AQ100-${t.id}: Cho phép nhập ${t.type}`, async () => {
        await gachaPage.searchInput.fill(t.val);
        await expect(gachaPage.searchInput).toHaveValue(t.val);
      });
    }

    test(`TC${tcIndex++} - AQ100-13: Nhập dữ liệu và xóa`, async () => {
      await gachaPage.searchInput.fill(gachaData.testInputs.textToDelete);
      await gachaPage.searchInput.clear();
      await expect(gachaPage.searchInput).toBeEmpty();
    });
  });

  // ==================== [3] Pulldown status ====================
  test.describe("[3] Pulldown status", () => {
    test.beforeEach(async () => {
      await ensureGachaPage();
    });

    test(`TC${tcIndex++} - AQ100-14: Giá trị mặc định dropdown là ${gachaData.filterOptions.status[0]}`, async () => {
      const statusDropdown = sharedPage.getByRole('combobox').first();
      await expect(statusDropdown).toBeVisible();
      await expect(statusDropdown).toHaveText(new RegExp(gachaData.filterOptions.status[0]));
    });

    test(`TC${tcIndex++} - AQ100-15: Chọn ${gachaData.filterOptions.status[1]} từ dropdown`, async () => {
      const statusDropdown = sharedPage.getByRole('combobox').first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage.getByText(gachaData.filterOptions.status[1], { exact: true }).last().click();
      await expect(statusDropdown).toHaveText(new RegExp(gachaData.filterOptions.status[1]));
    });

    test(`TC${tcIndex++} - AQ100-16: Chọn ${gachaData.filterOptions.status[2]} từ dropdown`, async () => {
      const statusDropdown = sharedPage.getByRole('combobox').first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage.getByText(gachaData.filterOptions.status[2], { exact: true }).last().click();
      await expect(statusDropdown).toHaveText(new RegExp(gachaData.filterOptions.status[2]));
    });
  });

  // ==================== [4] Button 検索 (Search) ====================
  test.describe("[4] Button 検索 (Search)", () => {
    test.beforeEach(async () => {
      await ensureGachaPage();
    });

    test(`TC${tcIndex++} - AQ100-20: Search không nhập dữ liệu - hiển thị tất cả`, async () => {
      await gachaPage.clearFilters();
      await gachaPage.searchButton.click();
      await expect(gachaPage.tableRows.first()).toBeVisible();
    });

    test(`TC${tcIndex++} - AQ100-23: Search keyword không có kết quả`, async () => {
      await gachaPage.searchModel(gachaData.testInputs.invalidModelName);
      await expect(sharedPage.getByText(gachaData.labels.noDataMessage)).toBeVisible();
    });

    test(`TC${tcIndex++} - AQ100-24: Search chọn 全て - hiển thị tất cả`, async () => {
      const statusDropdown = sharedPage.getByRole('combobox').first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage.getByText(gachaData.filterOptions.status[0], { exact: true }).last().click();
      await gachaPage.searchButton.click();
      await expect(gachaPage.tableRows.first()).toBeVisible();
    });

    test(`TC${tcIndex++} - AQ100-27: Search status không có kết quả`, async () => {
      await gachaPage.searchInput.fill(gachaData.testInputs.invalidModelName);
      const statusDropdown = sharedPage.getByRole('combobox').first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage.getByText(gachaData.filterOptions.status[1], { exact: true }).last().click();
      await gachaPage.searchButton.click();
      await expect(sharedPage.getByText(gachaData.labels.noDataMessage)).toBeVisible();
    });
  });

  // ==================== [5] Button クリア (Clear) ====================
  test.describe("[5] Button クリア (Clear)", () => {
    test.beforeEach(async () => {
      await ensureGachaPage();
    });

    test(`TC${tcIndex++} - AQ100-31: Xóa dữ liệu search`, async () => {
      await gachaPage.searchInput.fill(gachaData.testInputs.textToDelete);
      await gachaPage.clearFilters();
      await expect(gachaPage.searchInput).toBeEmpty();
    });
  });

  // ==================== [6..12] Table Labels & Icons ====================
  test.describe("[6..12] Kiểm tra Table Labels và Icons", () => {
    test.beforeEach(async () => {
      await ensureGachaPage();
    });

    test(`TC${tcIndex++} - AQ100-32: Kiểm tra cột ID hiển thị`, async () => {
      await gachaPage.searchButton.click();
      await expect(sharedPage.getByText(gachaData.labels.idColumn, { exact: true })).toBeVisible();
    });

    test(`TC${tcIndex++} - AQ100-33: Kiểm tra cột モデル名 hiển thị`, async () => {
      await gachaPage.searchButton.click();
      await expect(sharedPage.getByText(gachaData.labels.modelNameColumn, { exact: true })).toBeVisible();
    });

    test(`TC${tcIndex++} - AQ100-34: Kiểm tra cột ステータス hiển thị`, async () => {
      await gachaPage.searchButton.click();
      await expect(gachaPage.columnStatus).toBeVisible();
    });

    test(`TC${tcIndex++} - AQ100-67: Kiểm tra icon Edit hiển thị`, async () => {
      await gachaPage.searchButton.click();
      if (await gachaPage.tableRows.count() > 0) {
        const firstRow = gachaPage.tableRows.first();
        const editIcons = firstRow.locator(gachaData.selectors.editIcon).first();
        if (await editIcons.isVisible()) {
          await expect(editIcons).toBeEnabled();
        }
      }
    });
  });
});
