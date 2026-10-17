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

    this.searchInput = page.getByPlaceholder(gachaData.labels.modelNameInput);
    this.searchButton = page.getByRole("button", {
      name: gachaData.labels.searchButton,
      exact: true,
    });
    this.clearButton = page.getByRole("button", {
      name: gachaData.labels.clearButton,
      exact: true,
    });

    this.dataTable = page.getByRole("table");
    this.tableRows = this.dataTable
      .locator("tbody tr:not(.ant-table-placeholder)")
      .filter({ hasNotText: gachaData.labels.noDataMessage });
    this.columnStatus = page.getByRole("columnheader", {
      name: gachaData.labels.statusColumn,
      exact: true,
    });

    this.paginationSummary = page.getByText(
      gachaData.pagination.summaryLocatorRegex,
    );
    this.paginationFirstPageButton = page.getByRole("button", {
      name: gachaData.pagination.firstPage,
    });
    this.paginationPrevPageButton = page.getByRole("button", {
      name: gachaData.pagination.prevPage,
    });
    this.paginationNextPageButton = page.getByRole("button", {
      name: gachaData.pagination.nextPage,
    });
    this.paginationLastPageButton = page.getByRole("button", {
      name: gachaData.pagination.lastPage,
    });
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
      this.page.waitForURL(`**${gachaData.url}**`, {
        waitUntil: "domcontentloaded",
      }),
      this.gachaListLink.click(),
    ]);

    await this.page
      .getByText("読み込み中")
      .waitFor({ state: "detached", timeout: 5000 })
      .catch(() => {});
    await this.searchInput.waitFor({ state: "visible" });
  }

  async toggleSidebar() {
    await this.toggleSidebarButton.click();
  }

  async clickBreadcrumbHome() {
    await this.breadcrumbHome.click();
  }

  async searchModel(modelName) {
    await this.searchInput.fill(modelName);
    await Promise.all([
      this.page
        .waitForResponse((r) => r.url().includes("/api/v1/model-gacha/"), {
          timeout: 10000,
        })
        .catch(() => null),
      this.searchButton.click(),
    ]);
  }

  async clearFilters() {
    try {
      await this.page
        .getByText("読み込み中")
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
        if (req.url().includes("/api/v1/model-gacha/")) {
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
