import path from "path";
import { generateRandomNumber, generateRandomString } from "../utils/helpers.js";

/**
 * Dữ liệu kiểm thử & Bộ Selector tập trung cho AF200 (Gift Create)
 * // [Pending Live Verification]
 */
export const af200Data = {
  routes: {
    giftCreate: "/admin/gifts/create",
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
    iconDropZone: '[data-testid="icon-dropzone"], .upload-icon-zone',
    iconPreview: '[data-testid="icon-preview"], .icon-preview img',
    iconRemoveBtn: '[data-testid="icon-remove"], .icon-preview .remove-btn',
    animationFileInput: 'input[type="file"][name="animation"], [data-testid="animation-upload-input"]',
    animationRemoveBtn: '[data-testid="animation-remove"], .animation-preview .remove-btn',
    errorMessages: '.error-message, .invalid-feedback, [role="alert"]',
    loadingSpinner: '.loading-spinner, [data-testid="loading-indicator"]',
    unsavedModal: '.modal-confirm, [role="dialog"]',
  },
  labels: {
    breadcrumbParent: "ギフト一覧",
    btnSave: "保存",
    btnCancel: "キャンセル",
    btnModalOk: "OK",
    btnModalCancel: "キャンセル",
    msgRequired: "は空欄にできません。",
    msgMaxLength: "は文字数が多すぎます。",
    msgHalfWidthNumber: "半角数字のみ入力してください。",
    msgSaveSuccess: "正常に保存されました。",
    msgUnsavedConfirm: "戻ってもよろしいですか？保存されていない変更は失われます。",
    msgPermissionDenied: "この操作を行う権限がありません。",
  },
  assets: {
    validIconPath: path.resolve(process.cwd(), "src/test-data/assets/test_banner.png"),
  },
  nameDataCases: [
    { tcId: "[AF200-8]", label: "Số & ký tự đặc biệt", value: "Gift 2026 #1!", expectValid: true },
    { tcId: "[AF200-9]", label: "Space đầu/cuối", value: "  Star Gift  ", expectValid: true },
    { tcId: "[AF200-10]", label: "Toàn khoảng trắng", value: "     ", expectValid: false },
    { tcId: "[AF200-12]", label: "Max length (50 chars)", value: generateRandomString(50), expectValid: true },
    { tcId: "[AF200-13]", label: "Vượt max length (256 chars)", value: generateRandomString(256), expectValid: false },
  ],
  coinPriceDataCases: [
    { tcId: "[AF200-16]", label: "Min boundary = 1", value: "1", expectValid: true },
    { tcId: "[AF200-18]", label: "Số âm -10", value: "-10", expectValid: false },
    { tcId: "[AF200-19]", label: "Số thập phân 10.5", value: "10.5", expectValid: false },
    { tcId: "[AF200-20]", label: "Chữ & ký tự đặc biệt", value: "abc@#", expectValid: false },
    { tcId: "[AF200-21]", label: "Paste 100abc", value: "100abc", expectValid: false },
    { tcId: "[AF200-22]", label: "Số 0 ở đầu 0100", value: "0100", expectValid: true },
  ],
  sortOrderDataCases: [
    { tcId: "[AF200-29a]", label: "Số âm -1", value: "-1", expectValid: false },
    { tcId: "[AF200-29b]", label: "Chữ abc", value: "abc", expectValid: false },
  ],
  buildGiftFormData: (overrides = {}) => ({
    name: `AutoGift_${generateRandomString(6, true)}`,
    coin_price: String(generateRandomNumber(10, 500)),
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
