/**
 * Test Data & Selectors cho AF500 — GIFT Animation Type (演出種類)
 * Nguồn Spec: Google Sheet AF500
 */
export const af500Data = {
  routes: {
    giftList: "/admin/gifts",
    giftCreate: "/admin/gifts/create",
  },
  timeouts: {
    pageLoad: 15000,
    suiteTimeout: 60000,
  },
  selectors: {
    animationTypeRadio: (val) => `input[name='animation_type'][value='${val}']`,
    priceInput: "[data-testid='gift-price-input'], input[name='price']",
    categoryDropdown: "[data-testid='gift-category-select'], select[name='category_id']",
    contentUpload: "[data-testid='gift-image-input'], input[name='image'][type='file']",
    filterAnimationType: "[data-testid='gift-animation-type-select'], select[name='animation_type']",
    searchBtn: "button:has-text('検索')",
    clearBtn: "button:has-text('クリア')",
  },
  animationTypes: {
    normal: "normal",
    shutter: "shutter",
    continuous: "continuous",
  },
  shutterPrices: ["5000", "10000"],
  continuousPrices: ["1000", "3000", "5000", "10000"],
  filterCases: [
    { tcId: "[AF500-15]", label: "通常演出", value: "normal" },
    { tcId: "[AF500-16]", label: "シャッター演出", value: "shutter" },
    { tcId: "[AF500-17]", label: "継続演出", value: "continuous" },
  ],
};
