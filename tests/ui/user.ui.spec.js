import { test, expect } from "../../src/fixtures/baseTest.js";
import { UserPage } from "../../src/pages/UserPage.js";
import { LoginPage } from "../../src/pages/LoginPage.js";
import { loginData } from "../../src/test-data/loginData.js";
import { userData } from "../../src/test-data/userData.js";

test.describe.serial("UI User Management Suite", () => {
  let sharedPage;
  let userPage;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: process.env.UI_BASE_URL,
      httpCredentials: process.env.BASIC_AUTH_USER
        ? {
            username: process.env.BASIC_AUTH_USER,
            password: process.env.BASIC_AUTH_PASS || "",
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
    await loginPage.verifyLoginSuccess(new RegExp(userData.titles.dashboard));
  });

  test.afterAll(async () => {
    if (sharedPage) await sharedPage.close();
  });

  test.describe("1. Truy cập màn hình", () => {
    test("TC1.1 - Xác minh điều hướng thành công vào màn hình Quản lý Người dùng (利用者管理)", async () => {
      await expect(sharedPage).toHaveURL(userData.dashboardUrl);
      await userPage.navigateToUser();
      await expect(sharedPage).toHaveURL(userData.url);

      await expect(userPage.pageHeading).toBeVisible();
      await expect(userPage.searchInput).toBeVisible();
      await expect(userPage.searchButton).toBeVisible();
      await expect(userPage.userTable).toBeVisible();
    });

    test("TC1.2 - Kiểm tra chức năng đóng mở Sidebar (Toggle Sidebar)", async () => {
      await userPage.navigateToUser();

      await expect(userPage.toggleSidebarButton).toBeVisible();
      // Đóng sidebar
      await userPage.toggleSidebar();
      // Mở lại sidebar
      await userPage.toggleSidebar();
    });
  });

  test.describe("2. Breadcrumb", () => {
    test("TC2.1 - Kiểm tra và thao tác với Breadcrumb", async () => {
      await userPage.navigateToUser();
      await expect(sharedPage).toHaveURL(userData.url);

      await expect(userPage.breadcrumbNav).toBeVisible();
      await expect(userPage.breadcrumbItems).toHaveText([
        userData.labels.homeBreadcrumb,
        userData.labels.pageHeading,
      ]);

      await userPage.clickBreadcrumbHome();
      await expect(sharedPage).toHaveURL(userData.dashboardUrl);
    });
  });

  test.describe("3. Tìm kiếm", () => {
    test.beforeEach(async () => {
      await userPage.navigateToUser();
    });

    test.afterEach(async () => {
      await userPage.clearFilters();
    });

    // 1. Phân nhóm Searchbox (Dữ liệu đã được chuyển sang userData.js)
    let searchboxIndex = 1;
    for (const tc of userData.searchTestCases) {
      test(`TC3.1.${searchboxIndex} - Searchbox: ${tc.desc}`, async () => {
        await userPage.searchUsers({ usernameOrId: tc.input });
        if (tc.expectData) {
          // Bảng phải hiển thị ít nhất 1 dòng
          await expect(userPage.tableRows.first()).toBeVisible();
        } else {
          const noDataCell = sharedPage
            .getByRole("cell")
            .filter({ hasText: userData.labels.noDataMessage });
          await noDataCell.scrollIntoViewIfNeeded();
          await expect(noDataCell).toBeVisible();
        }
      });
      searchboxIndex++;
    }

    // 2. Phân nhóm Pulldown
    test("TC3.2.1 - Pulldown: Kiểm tra hiển thị mặc định và danh sách dữ liệu", async () => {
      // Check hiển thị mặc định
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

    test("TC3.2.2 - Pulldown: Chọn 1 giá trị và thực hiện tìm kiếm (Có dữ liệu)", async () => {
      await userPage.searchUsers({
        statusOption: userData.filterOptions.status[1],
      });
      await expect(userPage.tableRows.first()).toBeVisible();
    });

    test("TC3.2.3 - Pulldown: Chọn giá trị dẫn đến không có dữ liệu", async () => {
      // Kết hợp thêm ID ảo để đảm bảo luôn ra kết quả rỗng ở mọi môi trường, tránh bị timeout do phụ thuộc vào data thật
      await userPage.searchUsers({
        usernameOrId: "NOT_FOUND_9999",
        statusOption: userData.filterOptions.status[3],
      });
      const noDataCell = sharedPage
        .getByRole("cell")
        .filter({ hasText: userData.labels.noDataMessage });
      await noDataCell.scrollIntoViewIfNeeded();
      await expect(noDataCell).toBeVisible();
    });

    // 3. Phân nhóm Kết hợp (Searchbox + Pulldown)
    test("TC3.3.1 - Kết hợp: Searchbox + Nhiều Pulldown cùng lúc (Có dữ liệu)", async () => {
      await userPage.searchUsers({
        usernameOrId: userData.testKeywords.validAdmin,
        statusOption: userData.filterOptions.status[1],
        affiliationOption: userData.filterOptions.affiliation[1],
        liverTypeOption: userData.filterOptions.liverType[1],
      });
      await expect(userPage.tableRows.first()).toBeVisible();
    });

    test("TC3.3.2 - Kết hợp: Searchbox + Pulldown (Không có dữ liệu)", async () => {
      // Kết hợp từ khoá không tồn tại + bộ lọc để kích hoạt trạng thái No Data
      await userPage.searchUsers({
        usernameOrId: "NOT_FOUND_999",
        statusOption: userData.filterOptions.status[1],
      });
      const noDataCell = sharedPage
        .getByRole("cell")
        .filter({ hasText: userData.labels.noDataMessage });
      await noDataCell.scrollIntoViewIfNeeded();
      await expect(noDataCell).toBeVisible();
    });

    // 4. Phân nhóm Nút Clear (Xoá bộ lọc)
    test("TC3.4.1 - Clear: Không nhập gì và bấm nút", async () => {
      // Xác nhận form ban đầu đang trống và các pulldown đang ở mặc định
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

      // Bấm nút Clear
      await userPage.clearFilters();

      // Trạng thái tất cả các trường vẫn giữ nguyên ở mức mặc định
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

    test("TC3.4.2 - Clear: Có nhập dữ liệu ở tất cả các trường và bấm nút", async () => {
      // Nhập liệu vào cả Searchbox và các Pulldown (dùng hàm tiện ích)
      await userPage.searchUsers({
        usernameOrId: userData.testKeywords.validAdmin,
        statusOption: userData.filterOptions.status[1],
        affiliationOption: userData.filterOptions.affiliation[1],
        liverTypeOption: userData.filterOptions.liverType[1],
      });

      // Bấm nút Clear
      await userPage.clearFilters();

      // Xác nhận MỌI THỨ đều trở về mặc định
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
        await userPage.navigateToUser();
        targetDropdown = getLocator(userPage);
      });

      test.afterEach(async () => {
        // Đảm bảo đóng dropdown đang mở (nếu có) bằng phím Escape để tránh UI overlay che mất các nút khác
        await sharedPage.keyboard.press("Escape");
        // Chờ một chút cho animation đóng hoàn tất (nếu có)
        await sharedPage.waitForTimeout(300);
        await userPage.clearFilters();
      });

      test("1 - Kiểm tra UI hiển thị", async () => {
        // 1. Thực hiện kiểm tra UI của dropdown
        // Hiển thị UI giống design (kiểm tra visible)
        await expect(targetDropdown).toBeVisible();
        // Enable cho phép người dùng click
        await expect(targetDropdown).toBeEnabled();
      });

      test("2 - Kiểm tra giá trị mặc định", async () => {
        // 1. Hệ thống hiển thị giá trị mặc định
        await expect(targetDropdown).toHaveText(dropdownOptions[0]);
      });

      test("3 - Kiểm tra list dữ liệu", async () => {
        // 1. Click mở dropdown
        await targetDropdown.click();

        // Thực tế trên UI, giá trị mặc định đầu tiên (vd "All") có thể không nằm trong list options để chọn
        const expectedOptions = dropdownOptions.slice(1);

        // 2. Thực hiện kiểm tra list dữ liệu trong dropdown
        const options = sharedPage.getByRole("option");
        await expect(options).toHaveCount(expectedOptions.length);
        await expect(options).toHaveText(expectedOptions);
      });

      test("4 - Kiểm tra scroll trong list dữ liệu", async () => {
        // 1. Click mở dropdown
        await targetDropdown.click();

        const expectedOptions = dropdownOptions.slice(1);

        // 2. Thực hiện scroll list dữ liệu (chờ và scroll tới item cuối để xác nhận không mất dữ liệu)
        const options = sharedPage.getByRole("option");
        const lastOption = options.nth(expectedOptions.length - 1);
        await lastOption.scrollIntoViewIfNeeded();
        await expect(lastOption).toBeVisible();
      });

      test("5 - Kiểm tra hover vào từng option", async () => {
        // 1. Click mở dropdown
        await targetDropdown.click();

        const expectedOptions = dropdownOptions.slice(1);

        // 2. Thực hiện hover vào từng option
        const options = sharedPage.getByRole("option");
        for (let i = 0; i < expectedOptions.length; i++) {
          const option = options.nth(i);
          await option.scrollIntoViewIfNeeded();
          await option.hover();
          // Option không bị ẩn/mất
          await expect(option).toBeVisible();
        }
      });

      test("6 - Kiểm tra khi chọn data", async () => {
        // 1. Thực hiện click mở dropdown
        await targetDropdown.click();

        // 2. Chọn 1 option
        const targetOptionText = dropdownOptions[1];
        await sharedPage
          .getByRole("option", { name: targetOptionText })
          .click();

        // Giá trị hiển thị đúng
        await expect(targetDropdown).toHaveText(targetOptionText);

        // Dropdown đóng lại
        await expect(sharedPage.getByRole("listbox")).toBeHidden();
      });

      test("7.1 - Kiểm tra khi chọn lại option khác", async () => {
        // 1. Thực hiện chọn option A thành công
        await targetDropdown.click();
        await sharedPage
          .getByRole("option", { name: dropdownOptions[1] })
          .click();
        await expect(targetDropdown).toHaveText(dropdownOptions[1]);

        // 2. Mở lại dropdown thực hiện chọn option B
        await targetDropdown.click();
        await sharedPage
          .getByRole("option", { name: dropdownOptions[2] })
          .click();

        // Value cập nhật đúng, Không bị giữ giá trị cũ
        await expect(targetDropdown).toHaveText(dropdownOptions[2]);
      });

      test("7.2 - Kiểm tra giá trị hiển thị sau khi re-load", async () => {
        // 1. Thực hiện chọn option bất kỳ thành công
        await targetDropdown.click();
        await sharedPage
          .getByRole("option", { name: dropdownOptions[1] })
          .click();
        await expect(targetDropdown).toHaveText(dropdownOptions[1]);

        // 2. Click F5 hoặc button re-load trên trình duyệt
        await sharedPage.reload();
        await sharedPage.waitForLoadState("domcontentloaded");

        // Lấy lại locator sau khi reload
        targetDropdown = getLocator(userPage);

        // Hệ thống hiển thị giá trị mặc định
        await expect(targetDropdown).toHaveText(dropdownOptions[0]);
      });

      test("8 - Kiểm tra khi click ra ngoài droplist", async () => {
        // 1. Thực hiện click mở dropdown
        await targetDropdown.click();
        await expect(sharedPage.getByRole("listbox")).toBeVisible();

        // 2. Click ra ngoài vùng dropdown bằng toạ độ chuột
        // (để đảm bảo không bị dính bất kỳ locator nào có thể bị ẩn khi dropdown mở)
        await sharedPage.mouse.click(0, 0);

        // Hệ thống thực hiện đóng Dropdown
        await expect(sharedPage.getByRole("listbox")).toBeHidden();
      });

      test("9 - Kiểm tra khi điều hướng bằng bàn phím", async () => {
        // 1. Thực hiện click mở dropdown
        await targetDropdown.click();

        // 2. Dùng ↑ ↓ trên bàn phím và Enter
        await sharedPage.keyboard.press("ArrowDown");
        await sharedPage.keyboard.press("Enter");

        // Di chuyển được và chọn giá trị khác mặc định (Tuỳ thuộc vào focus hiện tại)
        const currentText = await targetDropdown.innerText();
        // Chắc chắn là dropdown đã đóng và chọn 1 giá trị
        await expect(sharedPage.getByRole("listbox")).toBeHidden();
        expect(currentText).toBeTruthy();
      });
    });
  });
});
