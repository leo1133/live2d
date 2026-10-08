import { test, expect } from "../../src/fixtures/baseTest.js";
import { UserPage } from "../../src/pages/UserPage.js";
import { LoginPage } from "../../src/pages/LoginPage.js";
import { loginData } from "../../src/test-data/loginData.js";
import { userData } from "../../src/test-data/userData.js";

let tcIndex = 1;

test.describe.serial("UI User Management Suite", () => {
  let sharedPage;
  let userPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60000);
    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      httpCredentials: process.env.BASIC_AUTH_USER
        ? {
            username: process.env.BASIC_AUTH_USER,
            password: process.env.BASIC_AUTH_PASS,
          }
        : undefined,
    });
    sharedPage = await context.newPage();
    const loginPage = new LoginPage(sharedPage);
    userPage = new UserPage(sharedPage);

    await loginPage.goto();
    await loginPage.login(
      loginData.credentials.account,
      loginData.credentials.password,
    );
    try {
      await loginPage.verifyLoginSuccess(new RegExp(userData.titles.dashboard));
    } catch (err) {
      console.warn("Retrying login after transient failure...");
      await loginPage.goto();
      await loginPage.login(
        loginData.credentials.account,
        loginData.credentials.password,
      );
      await loginPage.verifyLoginSuccess(new RegExp(userData.titles.dashboard));
    }
  });

  async function ensureUserPage() {
    await sharedPage.goto(userData.url, { waitUntil: "domcontentloaded" });

    if (sharedPage.url().includes("/sign-in")) {
      const loginPage = new LoginPage(sharedPage);
      await loginPage.login(
        loginData.credentials.account,
        loginData.credentials.password,
      );
      await loginPage.verifyLoginSuccess(new RegExp(userData.titles.dashboard));
      await sharedPage.goto(userData.url, { waitUntil: "domcontentloaded" });
    }

    await userPage.searchInput.waitFor({ state: "visible", timeout: 15000 });
    await expect(userPage.tableRows.first()).toBeVisible({ timeout: 15000 });
  }

  test.describe("1. Truy cập màn hình", () => {
    test(`TC${tcIndex++} - Xác minh điều hướng thành công vào màn hình Quản lý Người dùng (利用者管理)`, async () => {
      await expect(sharedPage).toHaveURL(new RegExp(userData.dashboardUrl));
      await userPage.navigateToUser();
      await expect(sharedPage).toHaveURL(new RegExp(userData.url));

      await expect(userPage.pageHeading).toBeVisible();
      await expect(userPage.searchInput).toBeVisible();
      await expect(userPage.searchButton).toBeVisible();
      await expect(userPage.userTable).toBeVisible();
    });

    test(`TC${tcIndex++} - Kiểm tra chức năng đóng mở Sidebar (Toggle Sidebar)`, async () => {
      await userPage.navigateToUser();

      await expect(userPage.toggleSidebarButton).toBeVisible();
      await userPage.toggleSidebar();
      await userPage.toggleSidebar();
    });
  });

  test.describe("2. Breadcrumb", () => {
    test(`TC${tcIndex++} - Kiểm tra và thao tác với Breadcrumb`, async () => {
      await userPage.navigateToUser();
      await expect(sharedPage).toHaveURL(new RegExp(userData.url));

      await expect(userPage.breadcrumbNav).toBeVisible();
      await expect(userPage.breadcrumbItems).toHaveText([
        userData.labels.homeBreadcrumb,
        userData.labels.pageHeading,
      ]);

      await userPage.clickBreadcrumbHome();
      await expect(sharedPage).toHaveURL(new RegExp(userData.dashboardUrl));
    });
  });

  test.describe("3. Tìm kiếm", () => {
    test.beforeEach(async () => {
      await ensureUserPage();
    });

    test.afterEach(async () => {
      await userPage.clearFilters();
    });

    for (const tc of userData.searchTestCases) {
      test(`TC${tcIndex++} - Searchbox: ${tc.desc}`, async () => {
        await userPage.searchUsers({ usernameOrId: tc.input });
        if (tc.expectData) {
          await expect(userPage.tableRows.first()).toBeVisible();
        } else {
          const noDataCell = sharedPage
            .getByRole("cell")
            .filter({ hasText: userData.labels.noDataMessage });
          await expect(noDataCell).toBeVisible();
        }
      });
    }

    test(`TC${tcIndex++} - Pulldown: Kiểm tra hiển thị mặc định và danh sách dữ liệu`, async () => {
      await expect(userPage.statusFilterDropdown).toHaveText(
        userData.filterOptions.status[0],
      );
      await expect(userPage.affiliationFilterDropdown).toHaveText(
        userData.filterOptions.affiliation[0],
      );
      await expect(userPage.liverTypeFilterDropdown).toHaveText(
        userData.filterOptions.liverType[0],
      );
    });

    test(`TC${tcIndex++} - Pulldown: Chọn 1 giá trị và thực hiện tìm kiếm (Có dữ liệu)`, async () => {
      await userPage.searchUsers({
        statusOption: userData.filterOptions.status[1],
      });
      await expect(userPage.tableRows.first()).toBeVisible();
    });

    test(`TC${tcIndex++} - Pulldown: Chọn giá trị dẫn đến không có dữ liệu`, async () => {
      await userPage.searchUsers({
        usernameOrId: "NOT_FOUND_9999",
        statusOption: userData.filterOptions.status[3],
      });
      const noDataCell = sharedPage
        .getByRole("cell")
        .filter({ hasText: userData.labels.noDataMessage });
      await expect(noDataCell).toBeVisible();
    });

    test(`TC${tcIndex++} - Kết hợp: Searchbox + Nhiều Pulldown cùng lúc (Có dữ liệu)`, async () => {
      await userPage.searchUsers({
        usernameOrId: userData.testKeywords.validAdmin,
        statusOption: userData.filterOptions.status[1],
        affiliationOption: userData.filterOptions.affiliation[1],
        liverTypeOption: userData.filterOptions.liverType[1],
      });
      await expect(userPage.tableRows.first()).toBeVisible();
    });

    test(`TC${tcIndex++} - Kết hợp: Searchbox + Pulldown (Không có dữ liệu)`, async () => {
      await userPage.searchUsers({
        usernameOrId: userData.searchTestCases[9].input,
        statusOption: userData.filterOptions.status[1],
      });
      const noDataCell = sharedPage
        .getByRole("cell")
        .filter({ hasText: userData.labels.noDataMessage });
      await expect(noDataCell).toBeVisible();
    });

    test(`TC${tcIndex++} - Clear: Không nhập gì và bấm nút`, async () => {
      await expect(userPage.searchInput).toBeEmpty();
      await expect(userPage.statusFilterDropdown).toHaveText(
        userData.filterOptions.status[0],
      );
      await expect(userPage.affiliationFilterDropdown).toHaveText(
        userData.filterOptions.affiliation[0],
      );
      await expect(userPage.liverTypeFilterDropdown).toHaveText(
        userData.filterOptions.liverType[0],
      );

      await userPage.clearFilters();

      await expect(userPage.searchInput).toBeEmpty();
      await expect(userPage.statusFilterDropdown).toHaveText(
        userData.filterOptions.status[0],
      );
      await expect(userPage.affiliationFilterDropdown).toHaveText(
        userData.filterOptions.affiliation[0],
      );
      await expect(userPage.liverTypeFilterDropdown).toHaveText(
        userData.filterOptions.liverType[0],
      );
    });

    test(`TC${tcIndex++} - Clear: Có nhập dữ liệu ở tất cả các trường và bấm nút`, async () => {
      await userPage.searchUsers({
        usernameOrId: userData.testKeywords.validAdmin,
        statusOption: userData.filterOptions.status[1],
        affiliationOption: userData.filterOptions.affiliation[1],
        liverTypeOption: userData.filterOptions.liverType[1],
      });

      await userPage.clearFilters();

      await expect(userPage.searchInput).toBeEmpty();
      await expect(userPage.statusFilterDropdown).toHaveText(
        userData.filterOptions.status[0],
      );
      await expect(userPage.affiliationFilterDropdown).toHaveText(
        userData.filterOptions.affiliation[0],
      );
      await expect(userPage.liverTypeFilterDropdown).toHaveText(
        userData.filterOptions.liverType[0],
      );
    });
  });

  const pulldownsToTest = [
    {
      name: "Status",
      getLocator: (pageObj) => pageObj.page.getByRole("combobox").nth(0),
      options: userData.filterOptions.status,
    },
    {
      name: "Affiliation",
      getLocator: (pageObj) => pageObj.page.getByRole("combobox").nth(1),
      options: userData.filterOptions.affiliation,
    },
    {
      name: "Liver Type",
      getLocator: (pageObj) => pageObj.page.getByRole("combobox").nth(2),
      options: userData.filterOptions.liverType,
    },
  ];

  pulldownsToTest.forEach(({ name, getLocator, options: dropdownOptions }) => {
    test.describe(`4. Dropdown / Select (Viewpoint Test Cases) - ${name}`, () => {
      let targetDropdown;

      test.beforeEach(async () => {
        await ensureUserPage();
        targetDropdown = getLocator(userPage);
      });

      test.afterEach(async () => {
        await sharedPage.keyboard.press("Escape");
        await sharedPage.waitForTimeout(300);
        await userPage.clearFilters();
      });

      test(`TC${tcIndex++} - Kiểm tra UI hiển thị`, async () => {
        await expect(targetDropdown).toBeVisible();
        await expect(targetDropdown).toBeEnabled();
      });

      test(`TC${tcIndex++} - Kiểm tra giá trị mặc định`, async () => {
        await expect(targetDropdown).toHaveText(dropdownOptions[0]);
      });

      test(`TC${tcIndex++} - Kiểm tra list dữ liệu`, async () => {
        await targetDropdown.click();

        const expectedOptions = dropdownOptions.slice(1);

        const options = sharedPage.getByRole("option");
        await expect(options).toHaveCount(expectedOptions.length);
        await expect(options).toHaveText(expectedOptions);
      });

      test(`TC${tcIndex++} - Kiểm tra scroll trong list dữ liệu`, async () => {
        await targetDropdown.click();

        const expectedOptions = dropdownOptions.slice(1);

        const options = sharedPage.getByRole("option");
        const lastOption = options.nth(expectedOptions.length - 1);
        await lastOption.scrollIntoViewIfNeeded();
        await expect(lastOption).toBeVisible();
      });

      test(`TC${tcIndex++} - Kiểm tra hover vào từng option`, async () => {
        await targetDropdown.click();

        const expectedOptions = dropdownOptions.slice(1);

        const options = sharedPage.getByRole("option");
        for (let i = 0; i < expectedOptions.length; i++) {
          const option = options.nth(i);
          await option.scrollIntoViewIfNeeded();
          await option.hover();
          await expect(option).toBeVisible();
        }
      });

      test(`TC${tcIndex++} - Kiểm tra khi chọn data`, async () => {
        await targetDropdown.click();

        const targetOptionText = dropdownOptions[1];
        await sharedPage
          .getByRole("option", { name: targetOptionText })
          .click();

        await expect(targetDropdown).toHaveText(targetOptionText);

        await expect(sharedPage.getByRole("listbox")).toBeHidden();
      });

      test(`TC${tcIndex++} - Kiểm tra khi chọn lại option khác`, async () => {
        await targetDropdown.click();
        await sharedPage
          .getByRole("option", { name: dropdownOptions[1] })
          .click();
        await expect(targetDropdown).toHaveText(dropdownOptions[1]);

        await targetDropdown.click();
        await sharedPage
          .getByRole("option", { name: dropdownOptions[2] })
          .click();

        await expect(targetDropdown).toHaveText(dropdownOptions[2]);
      });

      test(`TC${tcIndex++} - Kiểm tra giá trị hiển thị sau khi re-load`, async () => {
        await targetDropdown.click();
        await sharedPage
          .getByRole("option", { name: dropdownOptions[1] })
          .click();
        await expect(targetDropdown).toHaveText(dropdownOptions[1]);

        await sharedPage.reload();
        await sharedPage.waitForLoadState("networkidle");

        targetDropdown = getLocator(userPage);
        await targetDropdown.waitFor({ state: "visible" });

        await expect(targetDropdown).toHaveText(dropdownOptions[0]);
      });

      test(`TC${tcIndex++} - Kiểm tra khi click ra ngoài pulldown`, async () => {
        await targetDropdown.click();
        await expect(sharedPage.getByRole("listbox")).toBeVisible();

        await sharedPage.mouse.click(0, 0);

        await expect(sharedPage.getByRole("listbox")).toBeHidden();
      });

      test(`TC${tcIndex++} - Kiểm tra khi điều hướng bằng bàn phím`, async () => {
        await targetDropdown.click();

        await sharedPage.keyboard.press("ArrowDown");
        await sharedPage.keyboard.press("Enter");

        const currentText = await targetDropdown.innerText();
        await expect(sharedPage.getByRole("listbox")).toBeHidden();
        expect(currentText).toBeTruthy();
      });
    });
  });

  test.describe("5. Phân trang", () => {
    test.beforeEach(async () => {
      await userPage.navigateToUser();
      await userPage.clearFilters();
      await sharedPage.waitForTimeout(500);
    });

    test(`TC${tcIndex++} - Kiểm tra hiển thị UI Pagination`, async () => {
      await expect(userPage.paginationNextPageButton).toBeVisible();
      await expect(userPage.paginationLastPageButton).toBeVisible();

      await expect(userPage.paginationFirstPageButton).toBeDisabled();
      await expect(userPage.paginationPrevPageButton).toBeDisabled();
    });

    test(`TC${tcIndex++} - Kiểm tra hiển thị khi đang focus ở trang bất kì`, async () => {
      const activePageBtn = sharedPage.getByRole("button", {
        name: "1",
        exact: true,
      });
      if (await activePageBtn.isVisible()) {
        await expect(activePageBtn).toHaveAttribute("aria-current", "page");
      }
    });

    test(`TC${tcIndex++} - Kiểm tra phân trang với các mốc dữ liệu`, async () => {
      await userPage.searchUsers({
        usernameOrId: userData.testKeywords.notFoundForPagination,
      });
      const noDataCell = sharedPage
        .getByRole("cell")
        .filter({ hasText: userData.labels.noDataMessage });
      await expect(noDataCell).toBeVisible();
      await expect(userPage.paginationNextPageButton).toBeHidden();

      await userPage.clearFilters();

      const count = await userPage.tableRows.count();
      expect(count).toBeLessThanOrEqual(10);
      await expect(userPage.paginationNextPageButton).toBeVisible();
    });

    test(`TC${tcIndex++} - Kiểm tra icon < (Previous)`, async () => {
      await expect(userPage.paginationPrevPageButton).toBeDisabled();

      await userPage.paginationNextPageButton.click();
      await expect(userPage.paginationPrevPageButton).toBeVisible();
      await expect(userPage.paginationPrevPageButton).toBeEnabled();

      await userPage.paginationPrevPageButton.click();
      await expect(userPage.paginationPrevPageButton).toBeDisabled();
    });

    test(`TC${tcIndex++} - Kiểm tra icon << (First)`, async () => {
      await expect(userPage.paginationFirstPageButton).toBeDisabled();

      await userPage.paginationNextPageButton.click();

      await expect(userPage.paginationFirstPageButton).toBeVisible();
      await expect(userPage.paginationFirstPageButton).toBeEnabled();

      await userPage.paginationFirstPageButton.click();
      await expect(userPage.paginationFirstPageButton).toBeDisabled();
    });

    test(`TC${tcIndex++} - Kiểm tra icon > (Next)`, async () => {
      await userPage.paginationLastPageButton.click();

      await expect(userPage.paginationNextPageButton).toBeDisabled();

      await userPage.paginationFirstPageButton.click();
      await expect(userPage.paginationNextPageButton).toBeVisible();
      await expect(userPage.paginationNextPageButton).toBeEnabled();

      await userPage.paginationNextPageButton.click();
      await expect(userPage.paginationFirstPageButton).toBeVisible();
    });

    test(`TC${tcIndex++} - Kiểm tra icon >> (Last)`, async () => {
      await userPage.paginationLastPageButton.click();

      await expect(userPage.paginationLastPageButton).toBeDisabled();

      await userPage.paginationFirstPageButton.click();
      await expect(userPage.paginationLastPageButton).toBeVisible();
      await expect(userPage.paginationLastPageButton).toBeEnabled();

      await userPage.paginationLastPageButton.click();
      await expect(userPage.paginationLastPageButton).toBeDisabled();
    });

    test(`TC${tcIndex++} - Kiểm tra khi click trang bất kỳ`, async () => {
      await userPage.paginationFirstPageButton.click();

      const page2Btn = sharedPage.getByRole("button", {
        name: "2",
        exact: true,
      });
      if (await page2Btn.isVisible()) {
        await page2Btn.click();
        await expect(page2Btn).toHaveAttribute("aria-current", "page");
      }
    });

    test(`TC${tcIndex++} - Kiểm tra thông tin hiển thị số lượng bản ghi (Pagination Summary)`, async () => {
      await userPage.clearFilters();

      await sharedPage.waitForTimeout(500);

      if (
        (await userPage.paginationFirstPageButton.isVisible()) &&
        (await userPage.paginationFirstPageButton.isEnabled())
      ) {
        await userPage.paginationFirstPageButton.click();
        await sharedPage.waitForTimeout(500);
      }

      const summaryText = await userPage.paginationSummary.innerText();

      const match = summaryText.match(userData.pagination.summaryRegex);
      expect(match).not.toBeNull();

      const totalRecords = parseInt(match[1].replace(/,/g, ""), 10);
      const startRecord = parseInt(match[2].replace(/,/g, ""), 10);
      const endRecord = parseInt(match[3].replace(/,/g, ""), 10);

      expect(startRecord).toBe(1);

      expect(endRecord).toBe(Math.min(10, totalRecords));

      const currentRowsCount = await userPage.tableRows.count();
      expect(currentRowsCount).toBe(endRecord - startRecord + 1);

      if (totalRecords > 10) {
        await userPage.paginationNextPageButton.click();

        await expect(userPage.paginationSummary).toContainText("11〜");

        const textPage2 = await userPage.paginationSummary.innerText();
        const matchPage2 = textPage2.match(userData.pagination.summaryRegex);

        const startRecord2 = parseInt(matchPage2[2].replace(/,/g, ""), 10);
        const endRecord2 = parseInt(matchPage2[3].replace(/,/g, ""), 10);

        expect(startRecord2).toBe(11);
        expect(endRecord2).toBe(Math.min(20, totalRecords));
      }

      await userPage.paginationLastPageButton.click();

      await expect(userPage.paginationSummary).toContainText(
        `〜${totalRecords} 件`,
      );

      const textLastPage = await userPage.paginationSummary.innerText();
      const matchLastPage = textLastPage.match(
        userData.pagination.summaryRegex,
      );
      const endRecordLast = parseInt(matchLastPage[3].replace(/,/g, ""), 10);

      expect(endRecordLast).toBe(totalRecords);
    });
  });

  test.describe("6. Table (Bảng dữ liệu)", () => {
    test.beforeEach(async () => {
      await userPage.navigateToUser();
      await userPage.clearFilters();
      await sharedPage.waitForTimeout(500);
    });

    test(`TC${tcIndex++} - Kiểm tra hiển thị đủ và đúng thứ tự các cột Table Header`, async () => {
      const headers = userPage.userTable.locator("thead th");
      const count = await headers.count();

      expect(count).toBe(userData.tableHeaders.length);

      for (let i = 0; i < count; i++) {
        const headerText = await headers.nth(i).innerText();
        expect(headerText.trim()).toBe(userData.tableHeaders[i]);
      }
    });

    test(`TC${tcIndex++} - Kiểm tra hiển thị Data Rows mặc định`, async () => {
      const rowsCount = await userPage.tableRows.count();
      expect(rowsCount).toBeLessThanOrEqual(10);

      if (rowsCount > 0) {
        const firstRowCells = userPage.tableRows.first().locator("td");
        const cellCount = await firstRowCells.count();
        expect(cellCount).toBe(userData.tableHeaders.length);
      }
    });

    test(`TC${tcIndex++} - Kiểm tra hiển thị Empty State khi bảng không có dữ liệu`, async () => {
      await userPage.searchUsers({
        usernameOrId: userData.testKeywords.notFoundForTable,
      });

      const noDataCell = sharedPage
        .getByRole("cell")
        .filter({ hasText: userData.labels.noDataMessage });

      await expect(noDataCell).toBeVisible();
    });

    test(`TC${tcIndex++} - Kiểm tra chức năng ẩn/hiện Nhóm cột 1 (+4)`, async () => {
      await userPage.clearFilters();
      let headers = userPage.userTable.locator("thead th");

      const plus4Btn = userPage.userTable
        .locator("th")
        .filter({ hasText: userData.tableExpandGroups.group1.toggleBtn });
      await plus4Btn.click();

      await expect(headers).toHaveCount(28);

      for (const col of userData.tableExpandGroups.group1.columns) {
        await expect(
          userPage.userTable.locator("th").filter({ hasText: col }),
        ).toBeVisible();
      }

      await headers.nth(10).click();

      await expect(headers).toHaveCount(24);
      await expect(
        userPage.userTable
          .locator("th")
          .filter({ hasText: userData.tableExpandGroups.group1.columns[0] }),
      ).toBeHidden();
    });

    test(`TC${tcIndex++} - Kiểm tra chức năng ẩn/hiện Nhóm cột 2 (+6)`, async () => {
      let headers = userPage.userTable.locator("thead th");

      const plus6Btn = userPage.userTable
        .locator("th")
        .filter({ hasText: userData.tableExpandGroups.group2.toggleBtn });
      await plus6Btn.click();

      await expect(headers).toHaveCount(30);

      for (const col of userData.tableExpandGroups.group2.columns) {
        await expect(
          userPage.userTable.locator("th").filter({ hasText: col }),
        ).toBeVisible();
      }

      await headers.nth(14).click();

      await expect(headers).toHaveCount(24);
      await expect(
        userPage.userTable
          .locator("th")
          .filter({ hasText: userData.tableExpandGroups.group2.columns[0] }),
      ).toBeHidden();
    });
  });
});
