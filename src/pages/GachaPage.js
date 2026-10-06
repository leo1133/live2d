import { gachaData } from "../test-data/gachaData.js";

export class GachaPage {
  constructor(page) {
    this.page = page;

    this.gachaListLink = page.getByRole("link", {
      name: gachaData.labels.gachaListLink,
      exact: true,
    });
    this.toggleSidebarButton = page.getByRole("button", {
      name: gachaData.labels.toggleSidebar,
      exact: true,
    });
    this.breadcrumbNav = page.getByRole("navigation", {
      name: gachaData.labels.breadcrumbNav,
    });
    this.breadcrumbHome = page.getByRole("link", {
      name: gachaData.labels.homeBreadcrumb,
      exact: true,
    });

    this.pageHeading = page.getByRole("heading", {
      name: gachaData.labels.pageHeading,
      exact: true,
    });

    this.searchInput = page.getByRole("textbox", {
      name: gachaData.labels.modelNameInput,
    });
    this.searchButton = page.getByRole("button", {
      name: gachaData.labels.searchButton,
      exact: true,
    });
    this.clearButton = page.getByRole("button", {
      name: gachaData.labels.clearButton,
      exact: true,
    });

    this.dataTable = page.getByRole("table");
    this.tableRows = this.dataTable.locator("tbody tr:not(.ant-table-placeholder)");
    this.columnStatus = page.getByRole("columnheader", {
      name: gachaData.labels.statusColumn,
      exact: true,
    });

    this.paginationSummary = page.getByText(
      gachaData.pagination.summaryLocatorRegex,
    );
    this.paginationNextPageButton = page
      .getByRole("listitem")
      .filter({ hasText: gachaData.labels.nextPage });
    this.paginationPrevPageButton = page
      .getByRole("listitem")
      .filter({ hasText: gachaData.labels.prevPage });
    this.paginationFirstPageButton = page
      .getByRole("listitem")
      .filter({ hasText: gachaData.pagination.emptyTextRegex })
      .first();
    this.paginationLastPageButton = page
      .getByRole("listitem")
      .filter({ hasText: gachaData.pagination.emptyTextRegex })
      .nth(1);
  }

  async navigateToGachaList() {
    if (this.page.url().includes(gachaData.url)) {
      return;
    }

    await this.toggleSidebarButton.waitFor({ state: "visible" });

    if (!(await this.gachaListLink.isVisible())) {
      await this.toggleSidebarButton.click();
    }

    await Promise.all([
      this.page.waitForURL(`**${gachaData.url}**`),
      this.gachaListLink.click(),
    ]);
  }

  async toggleSidebar() {
    await this.toggleSidebarButton.click();
  }

  async clickBreadcrumbHome() {
    await this.breadcrumbHome.click();
  }

  async searchModel(modelName) {
    await this.searchInput.fill(modelName);
    await this.searchButton.click();
    await this.page.waitForTimeout(500);
  }

  async clearFilters() {
    await this.clearButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Lấy nội dung text của ô tại (rowIndex, colIndex)
   * @param {number} rowIndex
   * @param {number} colIndex
   * @returns {Promise<string>}
   */
  async getCellText(rowIndex, colIndex) {
    if ((await this.tableRows.count()) <= rowIndex) return "";
    const row = this.tableRows.nth(rowIndex);
    const cell = row.locator("td").nth(colIndex);
    if ((await cell.count()) === 0) return "";
    return (await cell.innerText()).trim();
  }
}
