import { test, expect } from "../../src/fixtures/baseTest.js";
import { GachaPage } from "../../src/pages/GachaPage.js";
import { LoginPage } from "../../src/pages/LoginPage.js";
import { loginData } from "../../src/test-data/loginData.js";
import { gachaData } from "../../src/test-data/gachaData.js";
import path from "path";
import fs from "fs";

let tcIndex = 1;
const padTc = () => `TC${String(tcIndex++).padStart(2, "0")}`;

test.describe.serial("UI Gacha Management", () => {
  let sharedPage;
  let gachaPage;

  // =========================================================================
  // [CŨ - 50 DÒNG]: Tự tạo newContext, đọc fs/path và try...catch login thủ công
  // =========================================================================
  /*
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
    const loginPage = new LoginPage(sharedPage);
    await loginPage.goto();
    await loginPage.login(loginData.credentials.account, loginData.credentials.password);
    try {
      await loginPage.verifyLoginSuccess(new RegExp(gachaData.titles.dashboard));
    } catch (err) {
      console.warn("Retrying login after transient failure...");
    }
  });
  */

  // =========================================================================
  // [MỚI - TỐI ƯU GỌN GÀNG]: Tự động nạp storageState từ playwright.config.js
  // =========================================================================
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60000);
    sharedPage = await browser.newPage();
    gachaPage = new GachaPage(sharedPage);
    // [ADVANCED UPGRADE]: Chặn ảnh tĩnh để UI load nhanh hơn
    await sharedPage.route(/\.(png|jpeg|jpg|svg|webp)$/, (route) =>
      route.abort(),
    );
    await gachaPage.navigateToGachaList();
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  async function ensureGachaPage() {
    await sharedPage.goto(gachaData.url, { waitUntil: "domcontentloaded" });

    if (sharedPage.url().includes("/sign-in")) {
      const loginPage = new LoginPage(sharedPage);
      await loginPage.login(
        loginData.credentials.account,
        loginData.credentials.password,
      );
      await loginPage.verifyLoginSuccess(
        new RegExp(gachaData.titles.dashboard),
      );
      await sharedPage.goto(gachaData.url, { waitUntil: "domcontentloaded" });
    }

    await gachaPage.searchInput.waitFor({ state: "visible", timeout: 15000 });
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
      await expect(gachaPage.breadcrumbNav).toContainText(
        gachaData.labels.pageHeading,
      );
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
      await expect(gachaPage.searchInput).toHaveAttribute(
        "placeholder",
        gachaData.labels.modelNameInput,
      );
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
      await expect(gachaPage.searchInput).toHaveAttribute(
        "placeholder",
        gachaData.labels.modelNameInput,
      );
    });
  });

  // ==================== 3. Dropdown Status ====================
  test.describe("3. Dropdown Status", () => {
    test.beforeEach(async () => {
      await ensureGachaPage();
    });

    test(`${padTc()}: Giá trị mặc định là "${gachaData.filterOptions.status[0]}"`, async () => {
      const statusDropdown = sharedPage.getByRole("combobox").first();
      await expect(statusDropdown).toBeVisible();
      await expect(statusDropdown).toHaveText(
        new RegExp(gachaData.filterOptions.status[0]),
      );
    });

    test(`${padTc()}: Chọn "${gachaData.filterOptions.status[1]}"`, async () => {
      const statusDropdown = sharedPage.getByRole("combobox").first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage
        .getByText(gachaData.filterOptions.status[1], { exact: true })
        .last()
        .click();
      await expect(statusDropdown).toHaveText(
        new RegExp(gachaData.filterOptions.status[1]),
      );
    });

    test(`${padTc()}: Chọn "${gachaData.filterOptions.status[2]}"`, async () => {
      const statusDropdown = sharedPage.getByRole("combobox").first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage
        .getByText(gachaData.filterOptions.status[2], { exact: true })
        .last()
        .click();
      await expect(statusDropdown).toHaveText(
        new RegExp(gachaData.filterOptions.status[2]),
      );
    });
  });

  // ==================== 4. Button Tìm kiếm ====================
  test.describe("4. Button Tìm kiếm (検索)", () => {
    test.beforeEach(async () => {
      await ensureGachaPage();
    });

    test(`${padTc()}: Kiểm tra khi di chuyển con trỏ chuột vào button`, async () => {
      await gachaPage.searchButton.hover();
      await expect(gachaPage.searchButton).toBeVisible();
      const cursor = await gachaPage.searchButton.evaluate(
        (el) => window.getComputedStyle(el).cursor,
      );
      expect(cursor).toBe("pointer");
    });

    test(`${padTc()}: Kiểm tra trạng thái button`, async () => {
      await expect(gachaPage.searchButton).toBeVisible();
      await expect(gachaPage.searchButton).toBeEnabled();
    });

    test(`${padTc()}: Kiểm tra khi không nhập dữ liệu`, async () => {
      await gachaPage.clearFilters();
      await gachaPage.searchButton.click();
      await expect(gachaPage.tableRows.first()).toBeVisible();
    });

    test(`${padTc()}: Kiểm tra khi nhập gần đúng tên model`, async () => {
      const firstRowName = await gachaPage.getCellText(
        0,
        gachaData.columnIndices.modelName,
      );
      if (firstRowName && firstRowName.length > 2) {
        const partialKeyword = firstRowName.substring(
          0,
          Math.min(3, firstRowName.length),
        );
        await gachaPage.searchModel(partialKeyword);
        await expect(gachaPage.tableRows.first()).toBeVisible();
      }
    });

    test(`${padTc()}: Kiểm tra khi nhập chính xác tên model`, async () => {
      const firstRowName = await gachaPage.getCellText(
        0,
        gachaData.columnIndices.modelName,
      );
      if (firstRowName) {
        await gachaPage.searchModel(firstRowName);
        await expect(gachaPage.tableRows.first()).toBeVisible();
        const searchResultName = await gachaPage.getCellText(
          0,
          gachaData.columnIndices.modelName,
        );
        expect(searchResultName).toContain(firstRowName);
      }
    });

    test(`${padTc()}: Kiểm tra khi nhập tên model không tồn tại trên DB`, async () => {
      await gachaPage.searchModel(gachaData.testInputs.invalidModelName);
      await expect(
        sharedPage.getByText(gachaData.labels.noDataMessage),
      ).toBeVisible();
    });

    test(`${padTc()}: Kiểm tra khi chọn status = 全て`, async () => {
      const statusDropdown = sharedPage.getByRole("combobox").first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage
        .getByText(gachaData.filterOptions.status[0], { exact: true })
        .last()
        .click();
      await gachaPage.searchButton.click();
      await expect(gachaPage.tableRows.first()).toBeVisible();
    });

    test(`${padTc()}: Kiểm tra khi chọn status = 公開`, async () => {
      const statusDropdown = sharedPage.getByRole("combobox").first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage
        .getByText(gachaData.filterOptions.status[1], { exact: true })
        .last()
        .click();
      await gachaPage.searchButton.click();
      await sharedPage.waitForTimeout(500);
      if ((await gachaPage.tableRows.count()) > 0) {
        const firstRowStatusCell = gachaPage.tableRows
          .first()
          .locator("td")
          .nth(gachaData.columnIndices.status);
        await expect(firstRowStatusCell).toContainText(
          gachaData.filterOptions.status[1],
        );
      }
    });

    test(`${padTc()}: Kiểm tra khi chọn status = 非公開`, async () => {
      const statusDropdown = sharedPage.getByRole("combobox").first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage
        .getByText(gachaData.filterOptions.status[2], { exact: true })
        .last()
        .click();
      await gachaPage.searchButton.click();
      await sharedPage.waitForTimeout(500);
      if ((await gachaPage.tableRows.count()) > 0) {
        const firstRowStatusCell = gachaPage.tableRows
          .first()
          .locator("td")
          .nth(gachaData.columnIndices.status);
        await expect(firstRowStatusCell).toContainText(
          gachaData.filterOptions.status[2],
        );
      }
    });

    test(`${padTc()}: Kiểm tra khi kết hợp với status`, async () => {
      await gachaPage.searchInput.fill(gachaData.testInputs.invalidModelName);
      const statusDropdown = sharedPage.getByRole("combobox").first();
      await statusDropdown.click();
      await sharedPage.waitForTimeout(300);
      await sharedPage
        .getByText(gachaData.filterOptions.status[1], { exact: true })
        .last()
        .click();
      await gachaPage.searchButton.click();
      await expect(
        sharedPage.getByText(gachaData.labels.noDataMessage),
      ).toBeVisible();
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
      await expect(
        sharedPage.getByText(gachaData.labels.idColumn, { exact: true }),
      ).toBeVisible();
    });

    test(`${padTc()}: Hiển thị cột モデル名`, async () => {
      await gachaPage.searchButton.click();
      await expect(
        sharedPage.getByText(gachaData.labels.modelNameColumn, { exact: true }),
      ).toBeVisible();
    });

    test(`${padTc()}: Hiển thị cột ステータス`, async () => {
      await gachaPage.searchButton.click();
      await expect(gachaPage.columnStatus).toBeVisible();
    });

    test(`${padTc()}: Hiển thị cột ${gachaData.labels.limitedColumn}`, async () => {
      await gachaPage.searchButton.click();
      await expect(
        sharedPage.getByText(gachaData.labels.limitedColumn, { exact: true }),
      ).toBeVisible();
    });

    test(`${padTc()}: Hiển thị cột ${gachaData.labels.normalColumn}`, async () => {
      await gachaPage.searchButton.click();
      await expect(
        sharedPage.getByText(gachaData.labels.normalColumn, { exact: true }),
      ).toBeVisible();
    });

    test(`${padTc()}: Hiển thị icon Edit tại cột ${gachaData.labels.limitedColumn} và ${gachaData.labels.normalColumn}`, async () => {
      await gachaPage.searchButton.click();
      if ((await gachaPage.tableRows.count()) > 0) {
        const firstRow = gachaPage.tableRows.first();
        const cells = firstRow.locator(gachaData.selectors.tableCell);

        // Icon Edit tại cột 期間限定
        const editLimitedIcon = cells
          .nth(gachaData.columnIndices.limited)
          .locator(gachaData.selectors.editIcon)
          .first();
        await expect(editLimitedIcon).toBeVisible();
        await expect(editLimitedIcon).toBeEnabled();

        // Icon Edit tại cột ノーマル
        const editNormalIcon = cells
          .nth(gachaData.columnIndices.normal)
          .locator(gachaData.selectors.editIcon)
          .first();
        await expect(editNormalIcon).toBeVisible();
        await expect(editNormalIcon).toBeEnabled();
      }
    });

    test(`${padTc()}: Click icon Edit cột ${gachaData.labels.limitedColumn} - mở màn hình chỉnh sửa`, async () => {
      await gachaPage.searchButton.click();
      const rows = gachaPage.tableRows;
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        const editLimitedLink = row
          .locator(gachaData.selectors.tableCell)
          .nth(gachaData.columnIndices.limited)
          .getByRole("link", { name: gachaData.editAriaLabels.limitedRegex });

        if (
          (await editLimitedLink.count()) > 0 &&
          (await editLimitedLink.isEnabled())
        ) {
          await editLimitedLink.click();
          await expect(
            sharedPage.getByRole("heading", {
              name: gachaData.editHeadings.limitedRegex,
            }),
          ).toBeVisible();

          // Quay lại màn hình danh sách
          await sharedPage
            .getByRole("link", { name: gachaData.labels.pageHeading })
            .click();
          await expect(gachaPage.pageHeading).toBeVisible();
          break;
        }
      }
    });

    test(`${padTc()}: Click icon Edit cột ${gachaData.labels.normalColumn} - mở màn hình chỉnh sửa`, async () => {
      await gachaPage.searchButton.click();
      const rows = gachaPage.tableRows;
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        const editNormalLink = row
          .locator(gachaData.selectors.tableCell)
          .nth(gachaData.columnIndices.normal)
          .getByRole("link", { name: gachaData.editAriaLabels.normalRegex });

        if (
          (await editNormalLink.count()) > 0 &&
          (await editNormalLink.isEnabled())
        ) {
          await editNormalLink.click();
          await expect(
            sharedPage.getByRole("heading", {
              name: gachaData.editHeadings.normalRegex,
            }),
          ).toBeVisible();

          // Quay lại màn hình danh sách
          await sharedPage
            .getByRole("link", { name: gachaData.labels.pageHeading })
            .click();
          await expect(gachaPage.pageHeading).toBeVisible();
          break;
        }
      }
    });
  });

  // ==================== 7. Phân trang (Pagination) ====================
  test.describe("7. Phân trang (Pagination)", () => {
    const pageSize = gachaData.pagination.defaultPageSize || 10;

    test.beforeEach(async () => {
      await ensureGachaPage();
      await gachaPage.clearFilters();
      await gachaPage.searchButton.click();
      await sharedPage.waitForTimeout(500);
    });

    test(`${padTc()}: Kiểm tra hiển thị thông tin phân trang (Pagination Summary)`, async () => {
      const summary = gachaPage.paginationSummary;
      await expect(summary).toBeVisible();

      const summaryText = await summary.innerText();
      const match = summaryText.match(gachaData.pagination.summaryRegex);
      expect(match).not.toBeNull();

      const totalRecords = parseInt(match[1].replace(/,/g, ""), 10);
      const startRecord = parseInt(match[2].replace(/,/g, ""), 10);
      const endRecord = parseInt(match[3].replace(/,/g, ""), 10);

      expect(totalRecords).toBeGreaterThanOrEqual(0);
      if (totalRecords > 0) {
        expect(startRecord).toBe(1);
        expect(endRecord).toBe(Math.min(pageSize, totalRecords));
      }
    });

    test(`${padTc()}: Kiểm tra số lượng bản ghi hiển thị trên 1 trang mặc định (<= ${pageSize})`, async () => {
      const rowsCount = await gachaPage.tableRows.count();
      expect(rowsCount).toBeLessThanOrEqual(pageSize);
    });

    test(`${padTc()}: Chuyển sang trang tiếp theo (Next Page)`, async () => {
      const summaryText = await gachaPage.paginationSummary.innerText();
      const match = summaryText.match(gachaData.pagination.summaryRegex);

      if (match) {
        const totalRecords = parseInt(match[1].replace(/,/g, ""), 10);
        if (totalRecords > pageSize) {
          await gachaPage.paginationNextPageButton.click();
          await sharedPage.waitForTimeout(500);

          const textPage2 = await gachaPage.paginationSummary.innerText();
          const matchPage2 = textPage2.match(gachaData.pagination.summaryRegex);
          expect(matchPage2).not.toBeNull();

          const startRecord2 = parseInt(matchPage2[2].replace(/,/g, ""), 10);
          const endRecord2 = parseInt(matchPage2[3].replace(/,/g, ""), 10);

          expect(startRecord2).toBe(pageSize + 1);
          expect(endRecord2).toBe(Math.min(pageSize * 2, totalRecords));
        }
      }
    });

    test(`${padTc()}: Chuyển về trang trước đó (Previous Page)`, async () => {
      const summaryText = await gachaPage.paginationSummary.innerText();
      const match = summaryText.match(gachaData.pagination.summaryRegex);

      if (match) {
        const totalRecords = parseInt(match[1].replace(/,/g, ""), 10);
        if (totalRecords > pageSize) {
          // Đến trang 2 trước
          await gachaPage.paginationNextPageButton.click();
          await sharedPage.waitForTimeout(500);

          // Bấm lùi lại trang 1
          await gachaPage.paginationPrevPageButton.click();
          await sharedPage.waitForTimeout(500);

          const textPrev = await gachaPage.paginationSummary.innerText();
          const matchPrev = textPrev.match(gachaData.pagination.summaryRegex);
          expect(matchPrev).not.toBeNull();

          const startRecord = parseInt(matchPrev[2].replace(/,/g, ""), 10);
          expect(startRecord).toBe(1);
        }
      }
    });

    test(`${padTc()}: Chuyển đến trang cuối cùng (Last Page)`, async () => {
      const summaryText = await gachaPage.paginationSummary.innerText();
      const match = summaryText.match(gachaData.pagination.summaryRegex);

      if (match) {
        const totalRecords = parseInt(match[1].replace(/,/g, ""), 10);
        if (totalRecords > pageSize) {
          await gachaPage.paginationLastPageButton.click();
          await sharedPage.waitForTimeout(500);

          const textLast = await gachaPage.paginationSummary.innerText();
          const matchLast = textLast.match(gachaData.pagination.summaryRegex);
          expect(matchLast).not.toBeNull();

          const endRecordLast = parseInt(matchLast[3].replace(/,/g, ""), 10);
          expect(endRecordLast).toBe(totalRecords);
        }
      }
    });

    test(`${padTc()}: Chuyển về trang đầu tiên (First Page)`, async () => {
      const summaryText = await gachaPage.paginationSummary.innerText();
      const match = summaryText.match(gachaData.pagination.summaryRegex);

      if (match) {
        const totalRecords = parseInt(match[1].replace(/,/g, ""), 10);
        if (totalRecords > pageSize) {
          // Đến trang cuối
          await gachaPage.paginationLastPageButton.click();
          await sharedPage.waitForTimeout(500);

          // Bấm về trang đầu
          await gachaPage.paginationFirstPageButton.click();
          await sharedPage.waitForTimeout(500);

          const textFirst = await gachaPage.paginationSummary.innerText();
          const matchFirst = textFirst.match(gachaData.pagination.summaryRegex);
          expect(matchFirst).not.toBeNull();

          const startRecord = parseInt(matchFirst[2].replace(/,/g, ""), 10);
          expect(startRecord).toBe(1);
        }
      }
    });

    test(`${padTc()}: Kiểm tra tính logic giữa Tổng số bản ghi (全 X 件) và số lượng nút số trang`, async () => {
      const summaryText = await gachaPage.paginationSummary.innerText();
      const match = summaryText.match(gachaData.pagination.summaryRegex);

      if (match) {
        const totalRecords = parseInt(match[1].replace(/,/g, ""), 10);
        const expectedTotalPages = Math.ceil(totalRecords / pageSize);

        if (expectedTotalPages > 1) {
          // Kiểm tra hiển thị đủ các nút số trang từ 1 đến expectedTotalPages (vd: 1, 2...)
          for (
            let pageNum = 1;
            pageNum <= Math.min(expectedTotalPages, 5);
            pageNum++
          ) {
            const pageButton = sharedPage
              .getByRole("listitem")
              .filter({ hasText: String(pageNum) });
            await expect(pageButton).toBeVisible();
          }
        }
      }
    });

    test(`${padTc()}: Kiểm tra Tổng số bản ghi cập nhật chính xác khi Tìm kiếm theo Keyword`, async () => {
      const firstRowName = await gachaPage.getCellText(
        0,
        gachaData.columnIndices.modelName,
      );
      if (firstRowName) {
        await gachaPage.searchModel(firstRowName);

        const searchSummaryText = await gachaPage.paginationSummary.innerText();
        const matchSearch = searchSummaryText.match(
          gachaData.pagination.summaryRegex,
        );
        expect(matchSearch).not.toBeNull();

        const searchTotalRecords = parseInt(
          matchSearch[1].replace(/,/g, ""),
          10,
        );
        expect(searchTotalRecords).toBeGreaterThan(0);

        // Số dòng trong bảng phải bằng min(searchTotalRecords, pageSize)
        const currentRowsCount = await gachaPage.tableRows.count();
        expect(currentRowsCount).toBe(Math.min(searchTotalRecords, pageSize));
      }
    });

    test(`${padTc()}: Kiểm tra Tổng số bản ghi khôi phục lại ban đầu khi Clear Filters`, async () => {
      // 1. Lấy tổng số bản ghi ban đầu
      const initialSummaryText = await gachaPage.paginationSummary.innerText();
      const initialMatch = initialSummaryText.match(
        gachaData.pagination.summaryRegex,
      );
      const initialTotalRecords = initialMatch
        ? parseInt(initialMatch[1].replace(/,/g, ""), 10)
        : 0;

      // 2. Search keyword làm thay đổi total count
      await gachaPage.searchModel("string");

      // 3. Bấm Clear Filters
      await gachaPage.clearFilters();
      await gachaPage.searchButton.click();
      await sharedPage.waitForTimeout(500);

      // 4. Kiểm tra tổng số bản ghi khôi phục về giá trị ban đầu
      const resetSummaryText = await gachaPage.paginationSummary.innerText();
      const resetMatch = resetSummaryText.match(
        gachaData.pagination.summaryRegex,
      );
      expect(resetMatch).not.toBeNull();

      const resetTotalRecords = parseInt(resetMatch[1].replace(/,/g, ""), 10);
      expect(resetTotalRecords).toBe(initialTotalRecords);
    });
  });
});
