/**
 * Test Data & Selectors cho màn hình AF400 — Gift Manage: Gift Category (ギフトカテゴリ管理)
 * Nguồn Spec: Google Sheet AF400
 */
export const af400Data = {
  routes: {
    giftCategories: "/gifts/categories",
  },
  timeouts: {
    pageLoad: 15000,
    modal: 5000,
    suiteTimeout: 60000,
  },
  selectors: {
    sidebarMenu: "a[href*='/gifts/categories']",
    breadcrumb: "nav[aria-label='breadcrumb'], .breadcrumb",
    createButton: "button:has-text('新規登録')",
    table: "main",
    tableRows: "button:has-text('(')",
    dragHandle: "main button[role='button']",
    categoryNameButton: "main button:has-text('(')",
    deleteButton: "[data-testid='category-delete-btn']",
    modal: "[role='dialog']",
    modalInput: "[role='dialog'] input",
    modalAddBtn: "[role='dialog'] button:has-text('追加')",
    modalSaveBtn: "[role='dialog'] button:has-text('保存')",
  },
  labels: {
    btnCreate: "新規登録",
    btnAdd: "追加",
    btnSave: "保存",
    emptyState: "CMMSG47",
  },
  createValidationCases: [
    { tcId: "[AF400-20]", title: "Biên Max = 20 ký tự", value: `U${Date.now()}`.padEnd(20, "x").slice(0, 20) },
    { tcId: "[AF400-21]", title: "Biên vượt Max = 21 ký tự", value: "123456789012345678901" },
    { tcId: "[AF400-22]", title: "Bỏ trống ô tên", value: "" },
    { tcId: "[AF400-23]", title: "Toàn khoảng trắng", value: "   " },
    { tcId: "[AF400-24]", title: "Khoảng trắng đầu/cuối (  Cat  )", value: "  Cat  " },
  ],
  editValidationCases: [
    { tcId: "[AF400-30]", title: "Xóa trắng tên khi sửa", value: "" },
    { tcId: "[AF400-31]", title: "Nhập 21 ký tự khi sửa", value: "123456789012345678901" },
  ],
};
