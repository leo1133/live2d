/**
 * Test Data & Selectors cho màn hình AF200 — Gift Manage: Gift Create (ギフト登録)
 * Nguồn Spec: Google Sheet AF200 + AF500 + CMR50
 */
export const af200Data = {
  routes: {
    giftCreate: "/admin/gifts/create",
  },
  timeouts: {
    pageLoad: 15000,
    modal: 5000,
    suiteTimeout: 60000,
  },
  selectors: {
    sidebarMenu: "[data-testid='sidebar-gift-create'], a[href*='/gifts/create']",
    breadcrumb: "nav[aria-label='breadcrumb'], .breadcrumb",
    animationTypeRadio: (val) => `input[name='animation_type'][value='${val}']`,
    nameInput: "[data-testid='gift-name-input'], input[name='name']",
    iconInput: "[data-testid='gift-icon-input'], input[name='icon'][type='file']",
    contentInput: "[data-testid='gift-image-input'], input[name='image'][type='file']",
    statusRadio: (val) => `input[name='status'][value='${val}']`,
    sortOrderInput: "[data-testid='gift-sort-order-input'], input[name='sort_order']",
    priceInput: "[data-testid='gift-price-input'], input[name='price']",
    categoryDropdown: "[data-testid='gift-category-select'], select[name='category_id']",
    addCategoryBtn: "[data-testid='add-category-popover-btn']",
    popoverCategoryNameInput: "[data-testid='popover-category-name-input']",
    popoverCategorySubmitBtn: "button:has-text('追加する')",
    cancelBtn: "button:has-text('キャンセル')",
    submitBtn: "button:has-text('登録')",
    previewModal: "[role='dialog']",
    previewCloseBtn: "button:has-text('閉じる')",
  },
  placeholders: {
    nameInput: "ギフト名を入力してください",
    priceInput: "値段を入力してください",
  },
  labels: {
    btnSubmit: "登録",
    btnCancel: "キャンセル",
    btnAddCategory: "追加する",
    btnClosePreview: "閉じる",
    msgEmptyName: "ギフト名は空欄にできません。",
    msgMaxName: "10文字以内で入力してください。",
    msgSuccess: "CMMSG12",
  },
  nameValidationCases: [
    { tcId: "[AF200-15]", title: "Nhập chữ Nhật hợp lệ (スター)", value: "スター", valid: true },
    { tcId: "[AF200-16]", title: "Nhập chữ Latin hợp lệ (StarGift10)", value: "StarGift10", valid: true },
    { tcId: "[AF200-17]", title: "Biên đúng Max = 10 ký tự", value: "1234567890", valid: true },
    { tcId: "[AF200-18]", title: "Vượt Max = 11 ký tự (CMMSG49)", value: "12345678901", valid: false },
    { tcId: "[AF200-19]", title: "Space đầu/cuối (  Star#1  )", value: "  Star#1  ", valid: true },
    { tcId: "[AF200-20]", title: "Toàn khoảng trắng", value: "     ", valid: false },
  ],
  sortOrderCases: [
    { tcId: "[AF200-46]", title: "sort_order âm (-1)", value: "-1" },
    { tcId: "[AF200-47]", title: "sort_order thập phân (1.5)", value: "1.5" },
    { tcId: "[AF200-48]", title: "sort_order chữ (abc)", value: "abc" },
  ],
  priceValidationCases: [
    { tcId: "[AF200-51]", title: "Giá biên Min = 1", value: "1" },
    { tcId: "[AF200-52]", title: "Nhập số 0 ở đầu (0100)", value: "0100" },
    { tcId: "[AF200-54]", title: "Nhập số âm (-10)", value: "-10" },
    { tcId: "[AF200-55]", title: "Nhập số thập phân (10.5)", value: "10.5" },
    { tcId: "[AF200-56]", title: "Nhập chữ (abc)", value: "abc" },
  ],
  dynamicHelpers: {
    uniqueGiftName: () => `G${Date.now().toString().slice(-6)}`,
    uniqueCategoryName: () => `Cat${Date.now().toString().slice(-6)}`,
  },
};
