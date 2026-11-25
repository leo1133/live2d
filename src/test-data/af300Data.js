/**
 * Test Data & Selectors cho màn hình AF300 — Gift Manage: Gift Update / Delete (ギフト更新・削除)
 * Nguồn Spec: Google Sheet AF300 + AF500
 */
export const af300Data = {
  routes: {
    giftDetail: (id) => `/admin/gifts/${id}`,
  },
  timeouts: {
    pageLoad: 15000,
    modal: 5000,
    suiteTimeout: 60000,
  },
  selectors: {
    breadcrumb: "nav[aria-label='breadcrumb'], .breadcrumb",
    nameInput: "[data-testid='gift-name-input'], input[name='name']",
    sortOrderInput: "[data-testid='gift-sort-order-input'], input[name='sort_order']",
    priceInput: "[data-testid='gift-price-input'], input[name='price']",
    categoryDropdown: "[data-testid='gift-category-select'], select[name='category_id']",
    saveBtn: "button:has-text('保存')",
    cancelBtn: "button:has-text('キャンセル')",
    deleteBtn: "button:has-text('削除')",
  },
  labels: {
    btnSave: "保存",
    btnCancel: "キャンセル",
    btnDelete: "削除",
  },
  nameUpdateCases: [
    { tcId: "[AF300-11]", title: "Sửa tên hợp lệ (新ギフト10)", value: "新ギフト10" },
    { tcId: "[AF300-12]", title: "Biên đúng Max = 10 ký tự", value: "1234567890" },
    { tcId: "[AF300-13]", title: "Biên vượt Max = 11 ký tự", value: "12345678901" },
    { tcId: "[AF300-14]", title: "Space đầu/cuối (  Star  )", value: "  Star  " },
    { tcId: "[AF300-15]", title: "Toàn khoảng trắng", value: "   " },
  ],
  priceUpdateCases: [
    { tcId: "[AF300-41]", title: "Giá biên Min = 1", value: "1" },
    { tcId: "[AF300-42]", title: "Số 0 đầu (0100)", value: "0100" },
    { tcId: "[AF300-44]", title: "Số âm (-50)", value: "-50" },
    { tcId: "[AF300-45]", title: "Số thập phân (12.5)", value: "12.5" },
    { tcId: "[AF300-46]", title: "Chữ (abc)", value: "abc" },
  ],
  invalidRoutes: [
    { tcId: "[AF300-2]", title: "ID không tồn tại (999999)", id: "999999" },
    { tcId: "[AF300-3]", title: "ID sai định dạng (abc)", id: "abc" },
  ],
};
