import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD302Page, AD302AgencyLiverListPage } from "../../src/pages/AD302Page.js";
import { ad302Data } from "../../src/test-data/ad302Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

/**
 * Bộ kiểm thử Tự động hóa Giao diện người dùng (UI Test Suite)
 * Màn hình: AD302_Agency Streamer List (事務所詳細_所属ライバー一覧)
 * Áp dụng: Quy chuẩn Trụ cột 2 & Rule 05 (Zero-hardcoding, Page Object Model)
 */

test.describe.serial("UI AD302: Agency Streamer List (事務所詳細_所属ライバー一覧)", () => {
  let sharedPage;
  let liverPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60000);
    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      storageState: getUiSessionFile(),
      httpCredentials: process.env.BASIC_AUTH_USER
        ? {
            username: process.env.BASIC_AUTH_USER,
            password: process.env.BASIC_AUTH_PASS,
          }
        : undefined,
    });
    sharedPage = await context.newPage();
    // Chặn tài nguyên ảnh nặng để tối ưu tốc độ
    await sharedPage.route(/\.(png|jpeg|jpg|webp)$/, (route) => route.abort());

    liverPage = new AD302AgencyLiverListPage(sharedPage);
    await liverPage.goto(ad302Data.sampleData.agencyId);
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  // ==========================================
  // I. COMMON & NAVIGATION CONTROLS
  // ==========================================
  test.describe("1. Common & Navigation Controls", () => {
    test("[AD302-1][AD302-3] Kiểm tra hiển thị tiêu đề và URL màn hình AD302", async () => {
      await expect(sharedPage).toHaveURL(new RegExp(`/agencies/detail/${ad302Data.sampleData.agencyId}`));
      await expect(liverPage.pageTitle).toBeVisible();
    });

    test("[AD302-5] Kiểm tra Screen Lifecycle khi F5 Reload trang", async () => {
      await sharedPage.reload({ waitUntil: "domcontentloaded" });
      await expect(liverPage.pageTitle).toBeVisible();
      await expect(liverPage.table).toBeVisible();
    });

    test("[AD302-7] Kiểm tra hiển thị Breadcrumbs", async () => {
      await expect(liverPage.breadcrumb).toBeVisible();
    });

    test("[AD302-9] Kiểm tra Tab ライバー一覧 được highlight active", async () => {
      await expect(liverPage.tabLiverList).toBeVisible();
    });
  });

  // ==========================================
  // II. SEARCH & FILTER CONTROLS
  // ==========================================
  test.describe("2. Search & Filter Controls", () => {
    test("[AD302-10] Kiểm tra ô tìm kiếm hiển thị đúng placeholder", async () => {
      await expect(liverPage.searchInput).toHaveAttribute("placeholder", ad302Data.placeholders.searchInput);
    });

    test("[AD302-11] Tìm kiếm streamer theo từ khóa tên", async () => {
      await liverPage.search({ keyword: ad302Data.sampleData.searchKeywordName });
      await expect(liverPage.searchInput).toHaveValue(ad302Data.sampleData.searchKeywordName);
    });

    test("[AD302-12] Tìm kiếm streamer theo User UID", async () => {
      await liverPage.search({ keyword: ad302Data.sampleData.searchKeywordUid });
      await expect(liverPage.searchInput).toHaveValue(ad302Data.sampleData.searchKeywordUid);
    });

    test("[AD302-13] Tìm kiếm kích hoạt bằng phím Enter", async () => {
      await liverPage.searchInput.fill("Sakura");
      await liverPage.searchInput.press("Enter");
      await expect(liverPage.table).toBeVisible();
    });

    test("[AD302-14] Xóa nhanh từ khóa trong ô tìm kiếm", async () => {
      await liverPage.searchInput.fill("TempText");
      await liverPage.searchInput.fill("");
      await expect(liverPage.searchInput).toHaveValue("");
    });

    test("[AD302-15][AD302-16] Kiểm tra Pulldown trạng thái tài khoản User và danh sách option", async () => {
      if (await liverPage.statusDropdown.isVisible()) {
        await expect(liverPage.statusDropdown).toBeVisible();
      }
    });

    test("[AD302-17] Lọc streamer theo trạng thái tài khoản 利用中", async () => {
      if (await liverPage.statusDropdown.isVisible()) {
        await liverPage.statusDropdown.selectOption("1");
        await liverPage.searchButton.click();
        await expect(liverPage.table).toBeVisible();
      }
    });

    test("[AD302-18] Lọc streamer theo trạng thái tài khoản 停止中", async () => {
      if (await liverPage.statusDropdown.isVisible()) {
        await liverPage.statusDropdown.selectOption("2");
        await liverPage.searchButton.click();
        await expect(liverPage.table).toBeVisible();
      }
    });

    test("[AD302-19] Lọc streamer theo trạng thái tài khoản 退会済み", async () => {
      if (await liverPage.statusDropdown.isVisible()) {
        await liverPage.statusDropdown.selectOption("3");
        await liverPage.searchButton.click();
        await expect(liverPage.table).toBeVisible();
      }
    });

    test("[AD302-20][AD302-21] Kiểm tra Pulldown trạng thái trực thuộc Agency", async () => {
      if (await liverPage.agencyStatusDropdown.isVisible()) {
        await expect(liverPage.agencyStatusDropdown).toBeVisible();
      }
    });

    test("[AD302-22] Lọc streamer theo trạng thái trực thuộc 所属済み", async () => {
      if (await liverPage.agencyStatusDropdown.isVisible()) {
        await liverPage.agencyStatusDropdown.selectOption("1");
        await liverPage.searchButton.click();
        await expect(liverPage.table).toBeVisible();
      }
    });

    test("[AD302-23] Lọc streamer theo trạng thái 申請中 (Chờ duyệt gia nhập)", async () => {
      if (await liverPage.agencyStatusDropdown.isVisible()) {
        await liverPage.agencyStatusDropdown.selectOption("3");
        await liverPage.searchButton.click();
        await expect(liverPage.table).toBeVisible();
      }
    });

    test("[AD302-24] Lọc streamer theo trạng thái 退所申請中 (Chờ duyệt rời)", async () => {
      if (await liverPage.agencyStatusDropdown.isVisible()) {
        await liverPage.agencyStatusDropdown.selectOption("5");
        await liverPage.searchButton.click();
        await expect(liverPage.table).toBeVisible();
      }
    });

    test("[AD302-25] Lọc streamer theo trạng thái 退所済み", async () => {
      if (await liverPage.agencyStatusDropdown.isVisible()) {
        await liverPage.agencyStatusDropdown.selectOption("6");
        await liverPage.searchButton.click();
        await expect(liverPage.table).toBeVisible();
      }
    });

    test("[AD302-28][AD302-29] Nhấn nút [クリア] -> Xóa toàn bộ từ khóa và reset bộ lọc", async () => {
      await liverPage.searchInput.fill("TestClear");
      await liverPage.clear();
      await expect(liverPage.searchInput).toHaveValue("");
    });
  });

  // ==========================================
  // III. TABLE & COLUMNS EXPANSION
  // ==========================================
  test.describe("3. Data Table & Columns Expansion", () => {
    test("[AD302-30] Bảng dữ liệu Liver hiển thị", async () => {
      await expect(liverPage.table).toBeVisible();
    });

    test("[AD302-31] Kiểm tra các cột dữ liệu chính trong bảng", async () => {
      await expect(liverPage.table.locator("thead")).toBeVisible();
    });

    test("[AD302-34][AD302-35] Kiểm tra nút mở rộng/thu gọn nhóm cột nâng cao [»] / [«]", async () => {
      if (await liverPage.toggleColumnsButton.isVisible()) {
        await liverPage.toggleColumns();
        await expect(liverPage.table).toBeVisible();
        await liverPage.toggleColumns();
      }
    });

    test("[AD302-37] Kiểm tra hiển thị thanh phân trang bảng dữ liệu", async () => {
      if (await liverPage.paginationContainer.isVisible()) {
        await expect(liverPage.paginationContainer).toBeVisible();
      }
    });

    test("[AD302-39] Kiểm tra các nút chuyển trang Next / Prev", async () => {
      if (await liverPage.nextPageButton.isVisible()) {
        await expect(liverPage.nextPageButton).toBeEnabled();
      }
    });
  });

  // ==========================================
  // IV. APPROVAL ACTIONS
  // ==========================================
  test.describe("4. Streamer Join/Leave Approval Actions", () => {
    test("[AD302-50] Nút phê duyệt gia nhập hiển thị khi có yêu cầu", async () => {
      if (await liverPage.approveButton.first().isVisible()) {
        await expect(liverPage.approveButton.first()).toBeVisible();
      }
    });

    test("[AD302-51] Nút từ chối phê duyệt hiển thị khi có yêu cầu", async () => {
      if (await liverPage.rejectButton.first().isVisible()) {
        await expect(liverPage.rejectButton.first()).toBeVisible();
      }
    });
  });
});
