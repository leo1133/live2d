import { generateRandomNumber } from "../utils/helpers.js";

/**
 * Dữ liệu kiểm thử & Bộ Selector tập trung cho AF500 (Quà cao cấp / High-Value Gift)
 * // [Pending Live Verification]
 */
export const af500Data = {
  routes: {
    highValueConfig: "/admin/high-value-gift",
  },
  selectors: {
    breadcrumb: '.breadcrumb, [aria-label="Breadcrumb"]',
    thresholdInput: 'input[name="threshold"], [data-testid="threshold-input"]',
    highValueToggle: 'input[type="checkbox"][role="switch"], [data-testid="high-value-toggle"]',
    errorMessages: '.error-message, .invalid-feedback, [role="alert"]',
    unsavedModal: '.modal-confirm, [role="dialog"]',
  },
  labels: {
    btnSave: "保存",
    btnCancel: "キャンセル",
    btnModalOk: "OK",
    btnModalCancel: "キャンセル",
    msgSaveSuccess: "正常に保存されました。",
    msgRequired: "は空欄にできません。",
    msgHalfWidthNumber: "半角数字のみ入力してください。",
    msgUnsavedConfirm: "戻ってもよろしいですか？保存されていない変更は失われます。",
    msgPermissionDenied: "この操作を行う権限がありません。",
  },
  thresholdDataCases: [
    { tcId: "[AF500-8]", label: "Ngưỡng = 0", value: "0", expectValid: false },
    { tcId: "[AF500-9a]", label: "Ngưỡng âm -100", value: "-100", expectValid: false },
    { tcId: "[AF500-9b]", label: "Số thập phân 10.5", value: "10.5", expectValid: false },
    { tcId: "[AF500-9c]", label: "Chữ abc", value: "abc", expectValid: false },
    { tcId: "[AF500-11]", label: "Số 0 ở đầu 0500", value: "0500", expectValid: true },
  ],
  buildValidThreshold: () => String(generateRandomNumber(300, 1000)),
  timeouts: {
    pageLoad: 15000,
    modal: 5000,
    action: 10000,
    suiteTimeout: 60000,
  },
};
