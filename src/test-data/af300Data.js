import { generateRandomNumber, generateRandomString } from "../utils/helpers.js";

/**
 * Dữ liệu kiểm thử & Bộ Selector tập trung cho AF300 (Gift Update / Delete)
 * // [Pending Live Verification]
 */
export const af300Data = {
  routes: {
    giftDetail: (id) => `/admin/gifts/${id}`,
    giftList: "/admin/gifts",
  },
  selectors: {
    breadcrumb: '.breadcrumb, [aria-label="Breadcrumb"]',
    nameInput: 'input[name="name"], [data-testid="gift-name-input"]',
    coinPriceInput: 'input[name="coin_price"], [data-testid="coin-price-input"]',
    categoryDropdown: 'select[name="category_id"], [data-testid="category-select"]',
    sortOrderInput: 'input[name="sort_order"], [data-testid="sort-order-input"]',
    statusToggle: 'input[name="status"][type="checkbox"], [data-testid="status-toggle"]',
    iconFileInput: 'input[type="file"][name="icon"], [data-testid="icon-upload-input"]',
    animationFileInput: 'input[type="file"][name="animation"], [data-testid="animation-upload-input"]',
    animationRemoveBtn: '[data-testid="animation-remove"], .animation-preview .remove-btn',
    errorMessages: '.error-message, .invalid-feedback, [role="alert"]',
    confirmModal: '.modal-confirm, [role="dialog"]',
  },
  labels: {
    breadcrumbParent: "ギフト一覧",
    btnSave: "保存",
    btnCancel: "キャンセル",
    btnDelete: "削除",
    btnModalOk: "OK",
    btnModalCancel: "キャンセル",
    btnModalConfirmDelete: "削除",
    msgSaveSuccess: "正常に保存されました。",
    msgDeleteSuccess: "正常に削除されました。",
    msgDeleteConfirm: "このギフトを削除します。よろしいですか？",
    msgUnsavedConfirm: "戻ってもよろしいですか？保存されていない変更は失われます。",
    msgRequired: "は空欄にできません。",
    msgHalfWidthNumber: "半角数字のみ入力してください。",
    msgPermissionDenied: "この操作を行う権限がありません。",
  },
  editNameCases: [
    { tcId: "[AF300-10]", label: "Space đầu/cuối", value: `  Updated_${generateRandomString(4)}  `, expectValid: true },
    { tcId: "[AF300-11]", label: "Vượt max length (256 chars)", value: generateRandomString(256), expectValid: false },
  ],
  editCoinCases: [
    { tcId: "[AF300-15]", label: "Số âm -50", value: "-50", expectValid: false },
    { tcId: "[AF300-16a]", label: "Số thập phân 12.5", value: "12.5", expectValid: false },
    { tcId: "[AF300-16b]", label: "Chữ abc", value: "abc", expectValid: false },
  ],
  editSortOrderCases: [
    { tcId: "[AF300-21a]", label: "Số âm -1", value: "-1", expectValid: false },
    { tcId: "[AF300-21b]", label: "Chữ abc", value: "abc", expectValid: false },
  ],
  buildUpdateData: (overrides = {}) => ({
    name: `UpdGift_${generateRandomString(6, true)}`,
    coin_price: String(generateRandomNumber(50, 900)),
    sort_order: String(generateRandomNumber(1, 50)),
    ...overrides,
  }),
  timeouts: {
    pageLoad: 15000,
    modal: 5000,
    action: 10000,
    suiteTimeout: 60000,
  },
};
