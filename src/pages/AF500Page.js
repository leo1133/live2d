import { af500Data } from "../test-data/af500Data.js";

/**
 * Page Object Model cho AF500 — GIFT Animation Type (演出種類)
 */
export class AF500Page {
  constructor(page) {
    this.page = page;
    this.categoryDropdown = page.locator(af500Data.selectors.categoryDropdown);
    this.contentUpload = page.locator(af500Data.selectors.contentUpload);
    this.filterAnimationType = page.locator(af500Data.selectors.filterAnimationType);
    this.searchBtn = page.locator(af500Data.selectors.searchBtn);
    this.clearBtn = page.locator(af500Data.selectors.clearBtn);
  }

  getAnimationTypeRadio(val) {
    return this.page.locator(af500Data.selectors.animationTypeRadio(val));
  }

  async gotoCreate() {
    await this.page.goto(af500Data.routes.giftCreate, {
      waitUntil: "domcontentloaded",
      timeout: af500Data.timeouts.pageLoad,
    });
  }

  async gotoList() {
    await this.page.goto(af500Data.routes.giftList, {
      waitUntil: "domcontentloaded",
      timeout: af500Data.timeouts.pageLoad,
    });
  }
}

export { AF500Page as AF500AnimationTypePage };
