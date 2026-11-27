/**
 * Test Data & Selectors cho AF500 — GIFT Animation Type (演出種類)
 * Nguồn Spec: Google Sheet AF500
 */
export const af500Data = {
  routes: {
    giftList: "/gifts",
    giftCreate: "/gifts/create",
  },
  timeouts: {
    pageLoad: 15000,
    suiteTimeout: 60000,
  },
  selectors: {
    animationTypeRadio: (val) => `#animation_type-${val}`,
    priceInput: "input[placeholder='値段を入力してください']",
    categoryDropdown: "button[role='combobox']:has-text('カテゴリ選択')",
    contentUpload: "input[type='file'] >> nth=1",
    filterAnimationType: "button[role='combobox']:has-text('全て演出種類')",
    searchBtn: "button:has-text('検索')",
    clearBtn: "button:has-text('クリア')",
  },
  animationTypes: {
    normal: 1,
    shutter: 2,
    continuous: 3,
  },
  shutterPrices: ["5000", "10000"],
  continuousPrices: ["1000", "3000", "5000", "10000"],
  filterCases: [
    { tcId: "[AF500-15]", label: "通常演出", value: 1 },
    { tcId: "[AF500-16]", label: "シャッター演出", value: 2 },
    { tcId: "[AF500-17]", label: "継続演出", value: 3 },
  ],
};
