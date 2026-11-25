import { generateRandomNumber, generateRandomString } from "../utils/helpers.js";

/**
 * Dữ liệu kiểm thử & Bộ Selector tập trung cho AF400 (Gift Category Manage)
 * // [Pending Live Verification]
 */
export const af400Data = {
  routes: {
    categoryManage: "/admin/gift-categories",
  },
  selectors: {
    breadcrumb: '.breadcrumb, [aria-label="Breadcrumb"]',
    dataTable: 'table, .data-table, [data-testid="category-table"]',
    tableHeaders: "thead th",
    tableRows: "tbody tr",
    emptyState: '.empty-state, [data-testid="empty-state"]',
    modalDialog: '[role="dialog"], .modal-dialog',
    categoryNameInput: 'input[name="name"], [data-testid="category-name-input"]',
    sortOrderInput: 'input[name="sort_order"], [data-testid="category-sort-input"]',
    errorMessages: '.error-message, .invalid-feedback, [role="alert"]',
    paginationContainer: '.pagination, [aria-label="Pagination"]',
    columns: {
      id: 0,
      name: 1,
      giftCount: 2,
      sortOrder: 3,
      actions: 4,
    },
  },
  labels: {
    btnCreate: "新規登録",
    btnSave: "保存",
    btnCancel: "キャンセル",
    btnEdit: "編集",
    btnDelete: "削除",
    emptyState: "一致する検索結果はありません。",
    msgSaveSuccess: "正常に保存されました。",
    msgDeleteSuccess: "正常に削除されました。",
    msgRequired: "は空欄にできません。",
    msgPermissionDenied: "この操作を行う権限がありません。",
  },
  tableHeaders: [
    { tcId: "[AF400-6]", key: "id", text: "ID" },
    { tcId: "[AF400-7]", key: "name", text: "カテゴリ名" },
    { tcId: "[AF400-8]", key: "giftCount", text: "ギフト数" },
    { tcId: "[AF400-9]", key: "sortOrder", text: "表示順" },
    { tcId: "[AF400-10]", key: "actions", text: "操作" },
  ],
  categoryDataCases: [
    { tcId: "[AF400-17a]", label: "Space đầu/cuối", value: `  Cat_${generateRandomString(4)}  `, expectValid: true },
    { tcId: "[AF400-17b]", label: "Toàn khoảng trắng", value: "     ", expectValid: false },
    { tcId: "[AF400-18]", label: "Vượt max length", value: generateRandomString(256), expectValid: false },
  ],
  sortOrderDataCases: [
    { tcId: "[AF400-20a]", label: "Số âm -1", value: "-1", expectValid: false },
    { tcId: "[AF400-20b]", label: "Chữ abc", value: "abc", expectValid: false },
  ],
  buildCategoryFormData: (overrides = {}) => ({
    name: `Cat_${generateRandomString(6, true)}`,
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
