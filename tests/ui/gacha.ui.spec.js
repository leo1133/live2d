import { test, expect } from "../../src/fixtures/baseTest.js";
import { GachaPage } from "../../src/pages/GachaPage.js";
import { LoginPage } from "../../src/pages/LoginPage.js";
import { loginData } from "../../src/test-data/loginData.js";
import { gachaData } from "../../src/test-data/gachaData.js";

let tcIndex = 1;
const padTc = () => `TC${String(tcIndex++).padStart(2, '0')}`;

test.describe.serial("UI Gacha Management", () => {
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
    try {
      await loginPage.verifyLoginSuccess(new RegExp(gachaData.titles.dashboard));
    } catch (err) {
      console.warn("Retrying login after transient failure...");
      await loginPage.goto();
      await loginPage.login(loginData.credentials.account, loginData.credentials.password);
      await loginPage.verifyLoginSuccess(new RegExp(gachaData.titles.dashboard));
    }
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  async function ensureGachaPage() {
    await sharedPage.goto(gachaData.url);
    await gachaPage.searchInput.waitFor({ state: 'visible', timeout: 15000 });
    await sharedPage.waitForTimeout(500);
  }

  // ==================== 1. Sidebar & Breadcrumb ====================
  test.describe("1. Sidebar & Breadcrumb", () => {
    test(`${padTc()}: Hiển thị Sidebar menu`, async () => {
      await gachaPage.navigateToGachaList();
      await expect(gachaPage.toggleSidebarButton).toBeVisible();
      await expect(gachaPage.gachaListLink).toBeVisible();
    });

    test(`${padTc()}: Điều hướng tới trang Gacha`, async () => {
      await expect(sharedPage).toHaveURL(new RegExp(gachaData.url));
      await expect(gachaPage.pageHeading).toBeVisible();
    });

    test(`${padTc()}: Hiển thị Breadcrumb`, async () => {
      await expect(gachaPage.breadcrumbNav).toContainText(gachaData.labels.pageHeading);
    });

    test(`${padTc()}: Click Breadcrumb Home về Dashboard`, async () => {
      await gachaPage.clickBreadcrumbHome();
      await expect(sharedPage).toHaveURL(new RegExp(gachaData.dashboardUrl));
    });
  });

  // ==================== 2. Search box ====================
  test.describe("2. Search box (モデル名)", () => {
    test.beforeEach(async () => {
      await ensureGachaPage();
    });

    test(`${padTc()}: Hiển thị search box`, async () => {
      await expect(gachaPage.searchInput).toBeVisible();
      await expect(gachaPage.searchInput).toHaveAttribute('placeholder', gachaData.labels.modelNameInput);
    });

    for (const t of gachaData.searchTestCases) {
      test(`${padTc()}: Nhập ${t.type}`, async () => {
        await gachaPage.searchInput.fill(t.val);
        await expect(gachaPage.searchInput).toHaveValue(t.val);
      });
    }

    test(`${padTc()}: Xóa dữ liệu search box`, async () => {
      await gachaPage.searchInput.fill(gachaData.testInputs.textToDelete);
      await gachaPage.searchInput.clear();
      await expect(gachaPage.searchInput).toBeEmpty();
    });
  });

  // ==================== 3. Dropdown Status ====================
  test.describe("3. Dropdown Status", () => {
    test.beforeEach(async () => {
      await ensureGachaPage();
    });

    test(`${padTc()}: Giá trị mặc định là "${gachaData.filterOptions.status[0]}"`, async () => {
      const statusDropdown = sharedPage.getByRole('combobox').first();
      await expect(statusDropdown).toBeVisible();
      await expect(statusDropdown).toHaveText(new RegExp(gachaData.filterOptions.status[0]));
    });

    test(`${padTc()}: Chọn "${gachaData.filterOptions.status[1]}"`, async () => {
      const statusDropdown = sharedPage.getByRole('combobox').first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage.getByText(gachaData.filterOptions.status[1], { exact: true }).last().click();
      await expect(statusDropdown).toHaveText(new RegExp(gachaData.filterOptions.status[1]));
    });

    test(`${padTc()}: Chọn "${gachaData.filterOptions.status[2]}"`, async () => {
      const statusDropdown = sharedPage.getByRole('combobox').first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage.getByText(gachaData.filterOptions.status[2], { exact: true }).last().click();
      await expect(statusDropdown).toHaveText(new RegExp(gachaData.filterOptions.status[2]));
    });
  });

  // ==================== 4. Button Tìm kiếm ====================
  test.describe("4. Button Tìm kiếm (検索)", () => {
    test.beforeEach(async () => {
      await ensureGachaPage();
    });

    test(`${padTc()}: Search không nhập dữ liệu - hiển thị tất cả`, async () => {
      await gachaPage.clearFilters();
      await gachaPage.searchButton.click();
      await expect(gachaPage.tableRows.first()).toBeVisible();
    });

    test(`${padTc()}: Search keyword không có kết quả`, async () => {
      await gachaPage.searchModel(gachaData.testInputs.invalidModelName);
      await expect(sharedPage.getByText(gachaData.labels.noDataMessage)).toBeVisible();
    });

    test(`${padTc()}: Search status "全て" - hiển thị tất cả`, async () => {
      const statusDropdown = sharedPage.getByRole('combobox').first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage.getByText(gachaData.filterOptions.status[0], { exact: true }).last().click();
      await gachaPage.searchButton.click();
      await expect(gachaPage.tableRows.first()).toBeVisible();
    });

    test(`${padTc()}: Search status không có kết quả`, async () => {
      await gachaPage.searchInput.fill(gachaData.testInputs.invalidModelName);
      const statusDropdown = sharedPage.getByRole('combobox').first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage.getByText(gachaData.filterOptions.status[1], { exact: true }).last().click();
      await gachaPage.searchButton.click();
      await expect(sharedPage.getByText(gachaData.labels.noDataMessage)).toBeVisible();
    });
  });

  // ==================== 5. Button Clear ====================
  test.describe("5. Button Clear (クリア)", () => {
    test.beforeEach(async () => {
      await ensureGachaPage();
    });

    test(`${padTc()}: Xóa dữ liệu search về mặc định`, async () => {
      await gachaPage.searchInput.fill(gachaData.testInputs.textToDelete);
      await gachaPage.clearFilters();
      await expect(gachaPage.searchInput).toBeEmpty();
    });
  });

  // ==================== 6. Table & Icons ====================
  test.describe("6. Table & Icons", () => {
    test.beforeEach(async () => {
      await ensureGachaPage();
    });

    test(`${padTc()}: Hiển thị cột ID`, async () => {
      await gachaPage.searchButton.click();
      await expect(sharedPage.getByText(gachaData.labels.idColumn, { exact: true })).toBeVisible();
    });

    test(`${padTc()}: Hiển thị cột モデル名`, async () => {
      await gachaPage.searchButton.click();
      await expect(sharedPage.getByText(gachaData.labels.modelNameColumn, { exact: true })).toBeVisible();
    });

    test(`${padTc()}: Hiển thị cột ステータス`, async () => {
      await gachaPage.searchButton.click();
      await expect(gachaPage.columnStatus).toBeVisible();
    });

    test(`${padTc()}: Hiển thị cột ${gachaData.labels.limitedColumn}`, async () => {
      await gachaPage.searchButton.click();
      await expect(sharedPage.getByText(gachaData.labels.limitedColumn, { exact: true })).toBeVisible();
    });

    test(`${padTc()}: Hiển thị cột ${gachaData.labels.normalColumn}`, async () => {
      await gachaPage.searchButton.click();
      await expect(sharedPage.getByText(gachaData.labels.normalColumn, { exact: true })).toBeVisible();
    });

    test(`${padTc()}: Hiển thị icon Edit tại cột ${gachaData.labels.limitedColumn} và ${gachaData.labels.normalColumn}`, async () => {
      await gachaPage.searchButton.click();
      if ((await gachaPage.tableRows.count()) > 0) {
        const firstRow = gachaPage.tableRows.first();
        const cells = firstRow.locator(gachaData.selectors.tableCell);

        // Icon Edit tại cột 期間限定
        const editLimitedIcon = cells.nth(gachaData.columnIndices.limited).locator(gachaData.selectors.editIcon).first();
        await expect(editLimitedIcon).toBeVisible();
        await expect(editLimitedIcon).toBeEnabled();

        // Icon Edit tại cột ノーマル
        const editNormalIcon = cells.nth(gachaData.columnIndices.normal).locator(gachaData.selectors.editIcon).first();
        await expect(editNormalIcon).toBeVisible();
        await expect(editNormalIcon).toBeEnabled();
      }
    });

    test(`${padTc()}: Click icon Edit cột ${gachaData.labels.limitedColumn} - mở màn hình chỉnh sửa`, async () => {
      await gachaPage.searchButton.click();
      if ((await gachaPage.tableRows.count()) > 0) {
        const firstRow = gachaPage.tableRows.first();
        const editLimitedLink = firstRow
          .locator(gachaData.selectors.tableCell)
          .nth(gachaData.columnIndices.limited)
          .getByRole("link", { name: gachaData.editAriaLabels.limitedRegex });

        await editLimitedLink.click();
        await expect(
          sharedPage.getByRole("heading", {
            name: gachaData.editHeadings.limitedRegex,
          }),
        ).toBeVisible();

        // Quay lại màn hình danh sách
        await sharedPage.getByRole("link", { name: gachaData.labels.pageHeading }).click();
        await expect(gachaPage.pageHeading).toBeVisible();
      }
    });

    test(`${padTc()}: Click icon Edit cột ${gachaData.labels.normalColumn} - mở màn hình chỉnh sửa`, async () => {
      await gachaPage.searchButton.click();
      if ((await gachaPage.tableRows.count()) > 0) {
        const firstRow = gachaPage.tableRows.first();
        const editNormalLink = firstRow
          .locator(gachaData.selectors.tableCell)
          .nth(gachaData.columnIndices.normal)
          .getByRole("link", { name: gachaData.editAriaLabels.normalRegex });

        await editNormalLink.click();
        await expect(
          sharedPage.getByRole("heading", {
            name: gachaData.editHeadings.normalRegex,
          }),
        ).toBeVisible();

        // Quay lại màn hình danh sách
        await sharedPage.getByRole("link", { name: gachaData.labels.pageHeading }).click();
        await expect(gachaPage.pageHeading).toBeVisible();
      }
    });
  });
});
