import { expect } from "@playwright/test";
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

    this.searchInput = page
      .getByPlaceholder(userData.labels.searchInputPlaceholder)
      .first();
    this.statusFilterDropdown = page.locator('button[role="combobox"]').nth(0);
    this.affiliationFilterDropdown = page
      .locator('button[role="combobox"]')
      .nth(1);
    this.liverTypeFilterDropdown = page
      .locator('button[role="combobox"]')
      .nth(2);

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

    await Promise.all([
      this.page.waitForURL(`**${userData.url}**`),
      this.userLink.click(),
    ]);

    await this.searchInput.waitFor({ state: "visible" });
    await this.page.waitForTimeout(500);
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
    if (usernameOrId !== undefined) {
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
    const isSearchEnabled = await this.searchButton
      .isEnabled({ timeout: 1000 })
      .catch(() => false);
    if (isSearchEnabled) {
      await this.searchButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Xóa bộ lọc (Reset form)
   */
  async clearFilters() {
    try {
      const isClearEnabled = await this.clearButton
        .isEnabled({ timeout: 1000 })
        .catch(() => false);
      if (isClearEnabled) {
        await this.clearButton.click({ timeout: 2000 });
        await this.page.waitForTimeout(300);
      }
    } catch (e) {}
  }
}
