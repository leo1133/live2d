import { userData } from "../test-data/userData.js";

export class UserPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.userLink = page.getByRole("link", {
      name: userData.labels.menuLink,
      exact: true,
    });

    this.breadcrumbNav = page.getByRole("navigation", {
      name: userData.labels.breadcrumbNav,
    });
    this.breadcrumbItems = this.breadcrumbNav.locator(
      userData.selectors.breadcrumbItem,
    );
    this.breadcrumbHomeLink = this.breadcrumbNav.getByRole("link", {
      name: userData.labels.homeBreadcrumb,
    });

    this.toggleSidebarButton = page.getByRole("button", {
      name: userData.labels.sidebarToggle,
    });
    this.breadcrumbCurrentPage = this.breadcrumbNav.locator(
      userData.selectors.breadcrumbCurrentPage,
    );

    this.pageHeading = page.getByRole("heading", {
      name: userData.labels.pageHeading,
    });

    this.searchInput = page.getByPlaceholder(
      userData.labels.searchInputPlaceholder,
    );
    this.statusFilterDropdown = page
      .getByRole("combobox")
      .filter({ hasText: userData.labels.statusFilter });
    this.affiliationFilterDropdown = page
      .getByRole("combobox")
      .filter({ hasText: userData.labels.affiliationFilter });
    this.liverTypeFilterDropdown = page
      .getByRole("combobox")
      .filter({ hasText: userData.labels.liverTypeFilter });

    this.searchButton = page.getByRole("button", {
      name: userData.labels.searchButton,
      exact: true,
    });
    this.clearButton = page.getByRole("button", {
      name: userData.labels.clearButton,
      exact: true,
    });

    this.userTable = page.getByRole("table");
    this.tableRows = page.locator(userData.selectors.tableRows);

    this.paginationFirstPageButton = page.getByRole("button", {
      name: userData.pagination.firstPage,
    });
    this.paginationPrevPageButton = page.getByRole("button", {
      name: userData.pagination.prevPage,
    });
    this.paginationNextPageButton = page.getByRole("button", {
      name: userData.pagination.nextPage,
    });
    this.paginationLastPageButton = page.getByRole("button", {
      name: userData.pagination.lastPage,
    });
    this.paginationSummary = page.locator(
      `p:has-text("${userData.pagination.summaryText}")`,
    );
  }

  /**
   * Click menu để chuyển đến trang Quản lý người dùng
   */
  async navigateToUser() {
    if (this.page.url().includes(userData.url)) {
      return;
    }

    await this.toggleSidebarButton.waitFor({ state: "visible" });

    if (!(await this.userLink.isVisible())) {
      await this.toggleSidebarButton.click();
    }
    await this.userLink.click();
  }

  /**
   * Click vào link Home trên Breadcrumb
   */
  async clickBreadcrumbHome() {
    await this.breadcrumbHomeLink.click();
  }

  /**
   * Click nút đóng/mở thanh Sidebar
   */
  async toggleSidebar() {
    await this.toggleSidebarButton.click();
  }

  /**
   * Tìm kiếm người dùng với các bộ lọc
   */
  async searchUsers({
    usernameOrId,
    statusOption,
    affiliationOption,
    liverTypeOption,
  } = {}) {
    if (usernameOrId) {
      await this.searchInput.fill(usernameOrId);
    }
    if (statusOption) {
      await this.statusFilterDropdown.click();
      await this.page.getByRole("option", { name: statusOption }).click();
    }
    if (affiliationOption) {
      await this.affiliationFilterDropdown.click();
      await this.page.getByRole("option", { name: affiliationOption }).click();
    }
    if (liverTypeOption) {
      await this.liverTypeFilterDropdown.click();
      await this.page.getByRole("option", { name: liverTypeOption }).click();
    }
    await this.searchButton.click();
  }

  /**
   * Xóa bộ lọc (Reset form)
   */
  async clearFilters() {
    try {
      await this.clearButton.click({ timeout: 2000 });
    } catch (e) {
    }
  }
}
