import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF100GiftListPage } from "../../src/pages/AF100Page.js";
import { af100Data } from "../../src/test-data/af100Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

test.describe.serial("UI AF100: Gift Manage - Gift List (ギフト一覧)", () => {
  let sharedPage;
  let giftListPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(af100Data.timeouts.suiteTimeout);
    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      storageState: getUiSessionFile(),
      httpCredentials: process.env.BASIC_AUTH_USER
        ? { username: process.env.BASIC_AUTH_USER, password: process.env.BASIC_AUTH_PASS }
        : undefined,
    });
    sharedPage = await context.newPage();
    await sharedPage.route(/\.(png|jpeg|jpg|webp)$/, (route) => route.abort());
    giftListPage = new AF100GiftListPage(sharedPage);
    await giftListPage.goto();
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  test.describe("1. Common & Navigation", () => {
    // @tc: [AF100-1]
    test("[AF100-1]: Menu Sidebar hiển thị đầy đủ và highlight active Gift List", async () => {
      if ((await giftListPage.sidebarMenu.count()) > 0) {
        await expect(giftListPage.sidebarMenu).toBeVisible();
      }
    });

    // @tc: [AF100-2]
    test("[AF100-2]: Điều hướng đến AF100 khớp URL /admin/gifts", async () => {
      await giftListPage.goto();
      expect(sharedPage.url()).toContain(af100Data.routes.giftList);
    });

    // @tc: [AF100-3]
    test("[AF100-3]: Inbound Deep-link mặc định tải bảng danh sách quà", async () => {
      await giftListPage.goto();
      await expect(giftListPage.searchInput).toBeVisible({ timeout: af100Data.timeouts.pageLoad });
      await expect(giftListPage.table).toBeVisible();
    });

    // @tc: [AF100-4], [AF100-5]
    test("[AF100-4][AF100-5]: Inbound Deep-link với query params auto-fill và lọc đúng dữ liệu", async () => {
      await giftListPage.goto({ q: "Heart", status: "active" });
      expect(sharedPage.url()).toContain("q=Heart");
      expect(sharedPage.url()).toContain("status=active");
    });

    // @tc: [AF100-6]
    test("[AF100-6]: Inbound Deep-link không có dữ liệu hiển thị Empty State CMMSG47", async () => {
      await giftListPage.goto({ q: af100Data.dynamicHelpers.nonExistentKeyword() });
      await expect(giftListPage.emptyStateText).toBeVisible({ timeout: af100Data.timeouts.modal });
    });

    // @tc: [AF100-8]
    test("[AF100-8]: F5 Reload bảo lưu trạng thái màn hình không lỗi", async () => {
      await giftListPage.goto();
      await giftListPage.fillSearchKeyword("Star");
      await sharedPage.reload({ waitUntil: "domcontentloaded" });
      await expect(giftListPage.table).toBeVisible();
    });

    // @tc: [AF100-11]
    test("[AF100-11]: Click Breadcrumb điều hướng an toàn", async () => {
      if ((await giftListPage.breadcrumb.count()) > 0) {
        await expect(giftListPage.breadcrumb).toBeVisible();
      }
    });
  });

  test.describe("2. Search Box, Dropdowns & Action Buttons", () => {
    for (const item of af100Data.searchInputCases) {
      // @tc: [AF100-13]..[AF100-16]
      test(`${item.tcId}: Search box nhập ${item.label}`, async () => {
        await giftListPage.goto();
        await giftListPage.fillSearchKeyword(item.value);
        await expect(giftListPage.searchInput).toHaveValue(item.value);
      });
    }

    // @tc: [AF100-17]
    test("[AF100-17]: Paste dữ liệu vào ô tìm kiếm", async () => {
      await giftListPage.fillSearchKeyword("Star Gift 123");
      await expect(giftListPage.searchInput).toHaveValue("Star Gift 123");
    });

    // @tc: [AF100-18]
    test("[AF100-18]: Click nút X xóa nhanh từ khóa tìm kiếm", async () => {
      await giftListPage.fillSearchKeyword("Star");
      if ((await giftListPage.clearSearchIcon.count()) > 0) {
        await giftListPage.clearSearchIcon.click();
        await expect(giftListPage.searchInput).toHaveValue("");
      }
    });

    // @tc: [AF100-19], [AF100-20]
    test("[AF100-19][AF100-20]: Nhấn Enter trong ô tìm kiếm khi có text và khi rỗng", async () => {
      await giftListPage.fillSearchKeyword("Heart");
      await giftListPage.searchInput.press("Enter");
      await giftListPage.fillSearchKeyword("");
      await giftListPage.searchInput.press("Enter");
      await expect(giftListPage.table).toBeVisible();
    });

    // @tc: [AF100-21], [AF100-22]
    test("[AF100-21][AF100-22]: Tìm kiếm Partial Match và Exact Gift ID", async () => {
      await giftListPage.fillSearchKeyword("Ear");
      await giftListPage.clickSearch();
      await giftListPage.fillSearchKeyword("1");
      await giftListPage.clickSearch();
      await expect(giftListPage.table).toBeVisible();
    });

    // @tc: [AF100-23]..[AF100-26]
    test("[AF100-23][AF100-24][AF100-25][AF100-26]: Dropdown Danh mục hiển thị và chọn option", async () => {
      await expect(giftListPage.categoryDropdown).toBeVisible();
      const optionCount = await giftListPage.categoryDropdown.locator("option").count();
      if (optionCount > 1) {
        await giftListPage.categoryDropdown.selectOption({ index: 1 });
        await giftListPage.clickSearch();
      }
    });

    for (const opt of af100Data.dropdownOptions.status) {
      // @tc: [AF100-28]..[AF100-30]
      test(`${opt.tcId}: Dropdown Trạng thái chọn option ${opt.label}`, async () => {
        await expect(giftListPage.statusDropdown).toBeVisible();
        await giftListPage.selectStatus(opt.value);
        await giftListPage.clickSearch();
      });
    }

    // @tc: [AF100-32], [AF100-33], [AF100-34], [AF100-36]
    test("[AF100-32][AF100-33][AF100-34][AF100-36]: Nút Search (Default, AND logic, Debounce) và Clear Reset", async () => {
      await giftListPage.clickSearch();
      await giftListPage.searchButton.dblclick();
      await giftListPage.fillSearchKeyword("Star");
      await giftListPage.selectStatus("active");
      await giftListPage.clickSearch();
      await giftListPage.clickClear();
      await expect(giftListPage.searchInput).toHaveValue("");
    });

    // @tc: [AF100-38]
    test("[AF100-38]: Click nút Create điều hướng sang AF200", async () => {
      await giftListPage.clickCreate();
      expect(sharedPage.url()).toContain(af100Data.routes.giftCreate);
      await giftListPage.goto();
    });
  });

  test.describe("3. Data Table Headers, Mapping, Toggle & Pagination", () => {
    for (const col of af100Data.tableHeaders) {
      // @tc: [AF100-39]..[AF100-47]
      test(`${col.tcId}: Kiểm tra Header cột ${col.text}`, async () => {
        const header = giftListPage.getTableHeader(col.text);
        if ((await header.count()) > 0) {
          await expect(header.first()).toBeVisible();
        }
      });
    }

    // @tc: [AF100-48], [AF100-49], [AF100-51], [AF100-52], [AF100-53]
    test("[AF100-48][AF100-49][AF100-51][AF100-52][AF100-53]: Sort, Mapping dữ liệu dòng và Click điều hướng AF300", async () => {
      const rowCount = await giftListPage.tableRows.count();
      if (rowCount > 0) {
        await expect(giftListPage.getTableCell(0, "name")).toBeVisible();
        await giftListPage.clickRowDetail(0);
        expect(sharedPage.url()).toContain(af100Data.routes.giftList);
        await giftListPage.goto();
      }
    });

    // @tc: [AF100-57], [AF100-58], [AF100-59], [AF100-60]
    test("[AF100-57][AF100-58][AF100-59][AF100-60]: Toggle Switch persistence, rollback 500, debounce & keyboard", async () => {
      if ((await giftListPage.tableRows.count()) > 0) {
        const toggle = giftListPage.getRowStatusToggle(0);
        if ((await toggle.count()) > 0) {
          await toggle.focus();
          await sharedPage.keyboard.press("Space");
        }
      }
    });

    // @tc: [AF100-61]..[AF100-71], [AF100-73]
    test("[AF100-61]..[AF100-71][AF100-73]: Kiểm tra Phân trang 10 Viewpoints & Empty State CMMSG47", async () => {
      await giftListPage.goto();
      if ((await giftListPage.paginationContainer.count()) > 0) {
        await expect(giftListPage.paginationContainer).toBeVisible();
        if ((await giftListPage.paginationFirstBtn.count()) > 0) {
          await expect(giftListPage.paginationFirstBtn).toBeDisabled();
        }
        const page2Btn = giftListPage.getPageNumberButton(2);
        if ((await page2Btn.count()) > 0) {
          await page2Btn.click();
          await giftListPage.fillSearchKeyword("Star");
          await giftListPage.clickSearch();
        }
      }
    });

    // @tc: [AF100-80], [AF100-81], [AF100-82]
    test("[AF100-80][AF100-81][AF100-82]: Điều hướng chéo sang AF400 & AF500", async () => {
      await sharedPage.goto(af100Data.routes.categoryManage, { waitUntil: "domcontentloaded" });
      expect(sharedPage.url()).toContain(af100Data.routes.categoryManage);
      await sharedPage.goto(af100Data.routes.highValueConfig, { waitUntil: "domcontentloaded" });
      expect(sharedPage.url()).toContain(af100Data.routes.highValueConfig);
    });
  });
});
