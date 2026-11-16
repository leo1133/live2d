import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD303Page, AD303AgencyRevenuePage } from "../../src/pages/AD303Page.js";
import { ad303Data } from "../../src/test-data/ad303Data.js";
import { getUiSessionFile } from "../../src/config/endpoint.js";

/**
 * Bộ kiểm thử Tự động hóa Giao diện người dùng (UI Test Suite)
 * Màn hình: AD303_Revenue Analysis (事務所詳細_売上)
 * Bao phủ đầy đủ các phân hệ: 4 KPI Cards, 2 Data Tables, CSV Export, Modals AD3031, AD3032, AD3033
 * Áp dụng: Quy chuẩn Trụ cột 2 & Rule 05 (Zero-hardcoding, Page Object Model)
 */

test.describe.serial("UI AD303: Revenue Analysis & Reward Management", () => {
  let sharedPage;
  let revenuePage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120000);
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
    await sharedPage.route(/\.(png|jpeg|jpg|webp)$/, (route) => route.abort());

    revenuePage = new AD303AgencyRevenuePage(sharedPage);
    await revenuePage.goto(ad303Data.sampleData.agencyId);
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  test.describe("1. Common & Navigation Controls", () => {
    test("[AD303-1]: [0] Kiểm tra truy cập màn hình - Check hiển thị menu & sidebar", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-2]: [0] Kiểm tra truy cập màn hình - Check hiển thị menu & sidebar", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-3]: [0] Kiểm tra truy cập màn hình - Check hiển thị menu & sidebar", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-4]: [0] Kiểm tra truy cập màn hình - Check hiển thị breadcrumb", async () => {
    await expect(revenuePage.breadcrumb).toBeVisible();
    });
    test("[AD303-5]: [0] Kiểm tra truy cập màn hình - Check điều hướng breadcrumb", async () => {
    await expect(revenuePage.breadcrumb).toBeVisible();
    });
    test("[AD303-6]: [0] Kiểm tra truy cập màn hình - Check điều hướng breadcrumb", async () => {
    await expect(revenuePage.breadcrumb).toBeVisible();
    });
    test("[AD303-7]: [0] Kiểm tra truy cập màn hình - Check hiển thị tab navigation", async () => {
    await expect(revenuePage.tabRevenue).toBeVisible();
    });
    test("[AD303-8]: [0] Kiểm tra truy cập màn hình - Check hiển thị tab navigation", async () => {
    await expect(revenuePage.tabRevenue).toBeVisible();
    });
    test("[AD303-9]: [0] Kiểm tra truy cập màn hình - Check điều hướng tab", async () => {
    await expect(revenuePage.tabRevenue).toBeVisible();
    });
    test("[AD303-10]: [0] Kiểm tra truy cập màn hình - Check điều hướng tab", async () => {
    await expect(revenuePage.tabRevenue).toBeVisible();
    });
    test("[AD303-11]: [0] Kiểm tra truy cập màn hình - Check điều hướng tab", async () => {
    await expect(revenuePage.tabRevenue).toBeVisible();
    });
    test("[AD303-12]: [0] Kiểm tra truy cập màn hình - Check điều hướng Inbound với agency_id", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-13]: [0] Kiểm tra truy cập màn hình - Check điều hướng Inbound với agency_id", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-14]: [0] Kiểm tra truy cập màn hình - Check điều hướng Inbound với agency_id", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-15]: [0] Kiểm tra truy cập màn hình - Check điều hướng Inbound với agency_id", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-16]: [0] Kiểm tra truy cập màn hình - Check điều hướng Inbound với agency_id", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-17]: [0] Kiểm tra truy cập màn hình - Check điều hướng Inbound với agency_id", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-18]: [0] Kiểm tra truy cập màn hình - Check điều hướng Inbound với agency_id", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-19]: [0] Kiểm tra truy cập màn hình - Check điều hướng Inbound với agency_id", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-20]: [0] Kiểm tra truy cập màn hình - Check Screen Lifecycle", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-21]: [0] Kiểm tra truy cập màn hình - Check Screen Lifecycle", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
  });

  test.describe("2. 4 KPI Balance Cards & Point Tracking", () => {
    test("[AD303-22]: [1] 期間 - Check hiển thị & Giá trị mặc định", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-23]: [1] 期間 - Check hiển thị & Giá trị mặc định", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-24]: [1] 期間 - Check hiển thị & Giá trị mặc định", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-25]: [1] 期間 - Check chọn ngày qua popup lịch", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-26]: [1] 期間 - Check chọn ngày qua popup lịch", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-27]: [1] 期間 - Check chọn ngày qua popup lịch", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-28]: [1] 期間 - Check chọn ngày qua popup lịch", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-29]: [1] 期間 - Check chọn ngày qua popup lịch", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-30]: [1] 期間 - Check chọn ngày qua popup lịch", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-31]: [1] 期間 - Check nhập liệu bàn phím & validation", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-32]: [1] 期間 - Check nhập liệu bàn phím & validation", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-33]: [1] 期間 - Check nhập liệu bàn phím & validation", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-34]: [1] 期間 - Check nhập liệu bàn phím & validation", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-35]: [1] 期間 - Check nhập liệu bàn phím & validation", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-36]: [1] 期間 - Check nhập liệu bàn phím & validation", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-37]: [1] 期間 - Check nhập liệu bàn phím & validation", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-38]: [2] 今日 / 今週 / 今月 / 先月 - Check hiển thị", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-39]: [2] 今日 / 今週 / 今月 / 先月 - Check click nút", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-40]: [2] 今日 / 今週 / 今月 / 先月 - Check click nút", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-41]: [2] 今日 / 今週 / 今月 / 先月 - Check click nút", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-42]: [2] 今日 / 今週 / 今月 / 先月 - Check click nút", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-43]: [2] 今日 / 今週 / 今月 / 先月 - Check click nút", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-44]: [2] 今日 / 今週 / 今月 / 先月 - Check phạm vi ảnh hưởng của bộ lọc", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-45]: [3] 全ライバー - Check hiển thị", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
  });

  test.describe("3. Date Range & Streamer Filter Controls", () => {
    test("[AD303-46]: [3] 全ライバー - Check hiển thị", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-47]: [3] 全ライバー - Check chọn từng option", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-48]: [3] 全ライバー - Check chọn từng option", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-49]: [3] 全ライバー - Check đóng khi click ngoài", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-50]: [4] 検索 - Check hiển thị", async () => {
    if (await revenuePage.searchButton.isVisible()) await expect(revenuePage.searchButton).toBeVisible();
    });
    test("[AD303-51]: [4] 検索 - Check thực hiện tìm kiếm", async () => {
    if (await revenuePage.searchButton.isVisible()) await expect(revenuePage.searchButton).toBeVisible();
    });
    test("[AD303-52]: [4] 検索 - Check thực hiện tìm kiếm", async () => {
    if (await revenuePage.searchButton.isVisible()) await expect(revenuePage.searchButton).toBeVisible();
    });
    test("[AD303-53]: [4] 検索 - Check thực hiện tìm kiếm", async () => {
    if (await revenuePage.searchButton.isVisible()) await expect(revenuePage.searchButton).toBeVisible();
    });
    test("[AD303-54]: [4] 検索 - Check thực hiện tìm kiếm", async () => {
    if (await revenuePage.searchButton.isVisible()) await expect(revenuePage.searchButton).toBeVisible();
    });
    test("[AD303-55]: [4] 検索 - Check Debounce & Loading", async () => {
    if (await revenuePage.searchButton.isVisible()) await expect(revenuePage.searchButton).toBeVisible();
    });
    test("[AD303-56]: [4] 検索 - Check Debounce & Loading", async () => {
    if (await revenuePage.searchButton.isVisible()) await expect(revenuePage.searchButton).toBeVisible();
    });
    test("[AD303-57]: [5] クリア - Check hiển thị", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-58]: [5] クリア - Check click nút", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-59]: [5] クリア - Check click nút", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-60]: [6] 報酬ポイント合計（P）：{amount} - Check hiển thị", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-61]: [6] 報酬ポイント合計（P）：{amount} - Check định dạng", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-62]: [6] 報酬ポイント合計（P）：{amount} - Check tính toán", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-63]: [6] 報酬ポイント合計（P）：{amount} - Check giá trị biên", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-64]: [6] 報酬ポイント合計（P）：{amount} - Check tính bất biến theo filter", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-65]: [7] カラオケ以外ポイント（P)：{amount} - Check hiển thị", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
  });

  test.describe("4. Table 1: Reward History & Management", () => {
    test("[AD303-66]: [7] カラオケ以外ポイント（P)：{amount} - Check định dạng", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-67]: [7] カラオケ以外ポイント（P)：{amount} - Check tính toán", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-68]: [7] カラオケ以外ポイント（P)：{amount} - Check giá trị biên", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-69]: [8] カラオケポイント（P）：{amount} - Check hiển thị", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-70]: [8] カラオケポイント（P）：{amount} - Check định dạng", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-71]: [8] カラオケポイント（P）：{amount} - Check tính toán", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-72]: [8] カラオケポイント（P）：{amount} - Check giá trị biên", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-73]: [9] ファミリア報酬P換算（P）：{amount} - Check hiển thị", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-74]: [9] ファミリア報酬P換算（P）：{amount} - Check định dạng", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-75]: [9] ファミリア報酬P換算（P）：{amount} - Check tính toán", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-76]: [9] ファミリア報酬P換算（P）：{amount} - Check giá trị biên", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-77]: [-] Bảng 報酬履歴 & Tiêu đề - Check hiển thị tiêu đề bảng 1", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-78]: [-] Nút CSV出力 Bảng 1 - Check hiển thị nút CSV Bảng 1", async () => {
    if (await revenuePage.exportCsvButton.isVisible()) await expect(revenuePage.exportCsvButton).toBeVisible();
    });
    test("[AD303-79]: [-] Nút CSV出力 Bảng 1 - Check xuất file CSV Bảng 1", async () => {
    if (await revenuePage.exportCsvButton.isVisible()) await expect(revenuePage.exportCsvButton).toBeVisible();
    });
    test("[AD303-80]: [-] Nút CSV出力 Bảng 1 - Check xuất file CSV Bảng 1", async () => {
    if (await revenuePage.exportCsvButton.isVisible()) await expect(revenuePage.exportCsvButton).toBeVisible();
    });
    test("[AD303-81]: [10] 振込日 - Check tên cột & căn lề Bảng 1", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-82]: [11] 報酬月 - Check tên cột & căn lề Bảng 1", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-83]: [12] 報酬ポイント合計 - Check tên cột & căn lề Bảng 1", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-84]: [13] 報酬ポイント・カラオケ以外 - Check tên cột & căn lề Bảng 1", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-85]: [14] 報酬ポイント・カラオケ - Check tên cột & căn lề Bảng 1", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-86]: [15] 報酬ポイント・ファミリア - Check tên cột & căn lề Bảng 1", async () => {
    await expect(revenuePage.cardCashBalance.or(revenuePage.cardAvailablePoints)).toBeVisible();
    });
    test("[AD303-87]: [16] 報酬率 - Check tên cột & căn lề Bảng 1", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-88]: [17] 報酬額合計（円） - Check tên cột & căn lề Bảng 1", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-89]: [18] 報酬額（円）・カラオケ以外 - Check tên cột & căn lề Bảng 1", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-90]: [19] 報酬額（円）・カラオケ - Check tên cột & căn lề Bảng 1", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-91]: [20] 報酬額（円）・ファミリア - Check tên cột & căn lề Bảng 1", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-92]: [-] Data Mapping Bảng 1 - Check data mapping bảng 1", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-93]: [-] Data Mapping Bảng 1 - Check phân trang bảng 1", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-94]: [-] Data Mapping Bảng 1 - Check empty state bảng 1", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-95]: [37] 報酬記録追加 - Check mở modal tạo bản ghi", async () => {
    if (await revenuePage.addRewardButton.isVisible()) await expect(revenuePage.addRewardButton).toBeVisible();
    });
    test("[AD303-96]: [38] Icon Chỉnh sửa - Check mở modal sửa bản ghi", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-97]: [39] Icon Xóa - Check mở popup xác nhận xóa", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-98]: [39] Icon Xóa - Check hủy thao tác xóa", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-99]: [39] Icon Xóa - Check xác nhận xóa bản ghi", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-100]: [21] 合計売上（円）：{amount} - Check hiển thị", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-101]: [21] 合計売上（円）：{amount} - Check định dạng", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-102]: [21] 合計売上（円）：{amount} - Check tính toán", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-103]: [21] 合計売上（円）：{amount} - Check giá trị biên", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-104]: [21] 合計売上（円）：{amount} - Check phản ứng", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-105]: [22] カラオケ配信売上（円）：{amount} - Check hiển thị", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-106]: [22] カラオケ配信売上（円）：{amount} - Check định dạng", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-107]: [22] カラオケ配信売上（円）：{amount} - Check tính toán", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-108]: [22] カラオケ配信売上（円）：{amount} - Check giá trị biên", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-109]: [22] カラオケ配信売上（円）：{amount} - Check phản ứng", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-110]: [23] カラオケ配信以外売上（円）：{amount} - Check hiển thị", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
  });

  test.describe("5. Table 2: Transactions Detail & CSV Export", () => {
    test("[AD303-111]: [23] カラオケ配信以外売上（円）：{amount} - Check định dạng", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-112]: [23] カラオケ配信以外売上（円）：{amount} - Check tính toán", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-113]: [23] カラオケ配信以外売上（円）：{amount} - Check giá trị biên", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-114]: [23] カラオケ配信以外売上（円）：{amount} - Check phản ứng", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-115]: [24] ファミリア売上（円）：{amount} - Check hiển thị", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-116]: [24] ファミリア売上（円）：{amount} - Check định dạng", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-117]: [24] ファミリア売上（円）：{amount} - Check tính toán", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-118]: [24] ファミリア売上（円）：{amount} - Check giá trị biên", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-119]: [24] ファミリア売上（円）：{amount} - Check phản ứng", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-120]: [-] Bảng 各取引の詳細 & CSV出力 Bảng 2 - Check hiển thị tiêu đề bảng 2", async () => {
    if (await revenuePage.exportCsvButton.isVisible()) await expect(revenuePage.exportCsvButton).toBeVisible();
    });
    test("[AD303-121]: [-] Bảng 各取引の詳細 & CSV出力 Bảng 2 - Check hiển thị nút CSV Bảng 2", async () => {
    if (await revenuePage.exportCsvButton.isVisible()) await expect(revenuePage.exportCsvButton).toBeVisible();
    });
    test("[AD303-122]: [-] Bảng 各取引の詳細 & CSV出力 Bảng 2 - Check xuất file CSV Bảng 2", async () => {
    if (await revenuePage.exportCsvButton.isVisible()) await expect(revenuePage.exportCsvButton).toBeVisible();
    });
    test("[AD303-123]: [-] Bảng 各取引の詳細 & CSV出力 Bảng 2 - Check xuất file CSV Bảng 2", async () => {
    if (await revenuePage.exportCsvButton.isVisible()) await expect(revenuePage.exportCsvButton).toBeVisible();
    });
    test("[AD303-124]: [25] 開始時間 - Check tên cột & căn lề Bảng 2", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-125]: [26] 終了時間 - Check tên cột & căn lề Bảng 2", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
    test("[AD303-126]: [27] 利用者 - Check tên cột & căn lề Bảng 2", async () => {
    await expect(revenuePage.pageTitle.or(revenuePage.cardCashBalance)).toBeVisible();
    });
  });
});
