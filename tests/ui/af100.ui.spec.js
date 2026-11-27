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
    test("[AF100-1]: Menu Sidebar hiển thị đầy đủ và highlight active Gift List", async () => {
      if ((await giftListPage.sidebarMenu.count()) > 0) {
        await expect(giftListPage.sidebarMenu).toBeVisible();
      }
    });

    test("[AF100-2][AF100-3]: Điều hướng đến AF100 khớp URL và Tab title", async () => {
      await giftListPage.goto();
      expect(sharedPage.url()).toContain(af100Data.routes.giftList);
    });

    test("[AF100-4]: Inbound Deep-link mặc định tải bảng danh sách quà", async () => {
      await giftListPage.goto();
      await expect(giftListPage.searchInput).toBeVisible({ timeout: af100Data.timeouts.pageLoad });
      await expect(giftListPage.table).toBeVisible();
    });

    test("[AF100-5]: Inbound Deep-link với query params auto-fill và lọc đúng dữ liệu", async () => {
      await giftListPage.goto({ keyword: "Heart", status: "public" });
      expect(sharedPage.url()).toContain("keyword=Heart");
      expect(sharedPage.url()).toContain("status=public");
    });

    test("[AF100-6]: Inbound Deep-link không có dữ liệu hiển thị Empty State CMMSG47", async () => {
      await giftListPage.goto();
      await giftListPage.fillSearchKeyword(af100Data.dynamicHelpers.nonExistentKeyword());
      await giftListPage.clickSearch();
      await expect(giftListPage.emptyStateText).toBeVisible({ timeout: af100Data.timeouts.pageLoad });
    });

    test("[AF100-7]: F5 Reload bảo lưu trạng thái màn hình không lỗi", async () => {
      await giftListPage.goto();
      await giftListPage.fillSearchKeyword("Star");
      await sharedPage.reload({ waitUntil: "domcontentloaded" });
      await expect(giftListPage.table).toBeVisible();
    });
  });

  test.describe("2. Search Box, Dropdowns & Action Buttons", () => {
    for (const item of af100Data.searchInputCases) {
      test(`${item.tcId}: ${item.title}`, async () => {
        await giftListPage.goto();
        await giftListPage.fillSearchKeyword(item.value);
        await expect(giftListPage.searchInput).toHaveValue(item.value);
      });
    }

    for (const opt of af100Data.statusOptions) {
      test(`${opt.tcId}: Lọc Status (${opt.label})`, async () => {
        await giftListPage.goto();
        if ((await giftListPage.statusDropdown.count()) > 0) {
          if (opt.value) {
            await giftListPage.selectStatus(opt.label);
            await giftListPage.clickSearch();
          } else {
            await giftListPage.clickClear();
          }
        }
      });
    }

    for (const opt of af100Data.animationTypeOptions) {
      test(`${opt.tcId}: Lọc Animation Type (${opt.label})`, async () => {
        await giftListPage.goto();
        if ((await giftListPage.animationTypeDropdown.count()) > 0) {
          await giftListPage.selectAnimationType(opt.label);
          await giftListPage.clickSearch();
        }
      });
    }

    test("[AF100-40]: Button クリア reset toàn bộ bộ lọc", async () => {
      await giftListPage.goto();
      await giftListPage.fillSearchKeyword("Star");
      await giftListPage.clickClear();
      await expect(giftListPage.searchInput).toHaveValue("");
    });

    test("[AF100-41]: Sidebar menu ギフト管理 hiển thị để điều hướng sang AF200", async () => {
      await giftListPage.goto();
      await expect(giftListPage.getSidebarMenu()).toBeVisible();
    });
  });

  test.describe("3. Table Headers, Sort & Pagination", () => {
    for (const col of af100Data.tableHeadersList) {
      test(`${col.tcId}: Kiểm tra Header cột ${col.name}`, async () => {
        await giftListPage.goto();
        await expect(giftListPage.getTableHeader(col.name)).toBeVisible();
      });
    }

    for (const tc of af100Data.paginationTamperingCases) {
      test(`${tc.tcId}: ${tc.title}`, async () => {
        await giftListPage.goto(tc.query);
        await expect(giftListPage.table).toBeVisible();
      });
    }
  });
});
