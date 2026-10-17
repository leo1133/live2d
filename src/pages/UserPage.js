import { expect } from "@playwright/test";
import { userData } from "../test-data/userData.js";
import { ENDPOINTS } from "../config/endpoint.js";

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
    this.statusFilterDropdown = page
      .locator(userData.selectors.combobox)
      .nth(0);
    this.affiliationFilterDropdown = page
      .locator(userData.selectors.combobox)
      .nth(1);
    this.liverTypeFilterDropdown = page
      .locator(userData.selectors.combobox)
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
      userData.selectors.paginationSummary,
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
      this.page.waitForURL(`**${userData.url}**`, {
        waitUntil: "domcontentloaded",
      }),
      this.userLink.click(),
    ]);

    await this.searchInput.waitFor({ state: "visible" });
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
      await Promise.all([
        this.page
          .waitForResponse((r) => r.url().includes(ENDPOINTS.USER.GET_LIST), {
            timeout: 10000,
          })
          .catch(() => null),
        this.searchButton.click(),
      ]);
    }
  }

  /**
   * Xóa bộ lọc (Reset form)
   */
  async clearFilters() {
    try {
      await this.page
        .getByText(userData.labels.loadingMessage)
        .waitFor({ state: "detached", timeout: 3000 })
        .catch(() => {});

      const isEnabled = await this.clearButton.isEnabled().catch(() => false);
      if (!isEnabled) {
        const searchVal = await this.searchInput.inputValue().catch(() => "");
        if (searchVal) {
          await this.searchInput.fill("").catch(() => {});
        }
        return;
      }

      let requestPromise = null;
      const onRequest = (req) => {
        if (req.url().includes(ENDPOINTS.USER.GET_LIST)) {
          requestPromise = req.response();
        }
      };
      this.page.on("request", onRequest);

      await this.clearButton.click();
      await this.page.waitForTimeout(50);
      this.page.off("request", onRequest);

      if (requestPromise) {
        await requestPromise;
      }
    } catch {
      await this.searchInput.fill("").catch(() => {});
    }
  }
}
