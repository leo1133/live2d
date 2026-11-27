/**
 * Test Data & Selectors cho màn hình AF100 — Gift Manage: Gift List (ギフト一覧)
 * Nguồn Spec: Google Sheet AF100 + AF500
 */
export const af100Data = {
  routes: {
    giftList: "/gifts",
    buildGiftListQuery: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return qs ? `/gifts?${qs}` : "/gifts";
    },
  },
  paginationConfig: {
    defaultPageSize: 10,
  },
  timeouts: {
    pageLoad: 15000,
    modal: 5000,
    suiteTimeout: 60000,
  },
  selectors: {
    sidebarMenu: "a[href='/gifts'][data-sidebar='menu-button']",
    breadcrumb: "nav[aria-label='breadcrumb'], .breadcrumb",
    searchInput: "input[placeholder*='ギフト名']",
    clearSearchIcon: "[data-testid='gift-search-clear']",
    categoryDropdown: "button[role='combobox']:has-text('全てカテゴリー')",
    statusDropdown: "button[role='combobox']:has-text('全てステータス')",
    animationTypeDropdown: "button[role='combobox']:has-text('全て演出種類')",
    dataTable: "table",
    tableHeaders: "thead th",
    tableRows: "tbody tr",
    editButton: "button[aria-label*='編集']",
    deleteButton: "button[aria-label*='削除']",
    emptyState: "text=一致する検索結果はありません",
    paginationContainer: "nav[aria-label='pagination']",
    columns: {
      id: 0,
      icon: 1,
      name: 2,
      status: 3,
      category: 4,
      price: 5,
      animationType: 6,
      creator: 7,
      createdAt: 8,
      updatedAt: 9,
      actions: 10,
    },
  },
  placeholders: {
    searchInput: "ギフト名・ギフトID・ギフト値段",
  },
  labels: {
    tabTitle: "商品管理｜ギフト管理",
    sidebarParent: "ギフト管理",
    sidebarItem: "ギフト一覧",
    btnSearch: "検索",
    btnClear: "クリア",
    btnCreate: "新規登録",
    emptyState: "一致する検索結果はありません",
    paginationPrev: "<<前",
    paginationNext: "次>>",
    paginationFirst: "<<",
    paginationLast: ">>",
    modalCancel: "キャンセル",
    errorPermission: "この操作を行う権限がありません。",
    errorServer: "予期しないサーバーエラーが発生しました。",
  },
  tableHeadersList: [
    { tcId: "[AF100-42]", name: "ID" },
    { tcId: "[AF100-43]", name: "ギフト名" },
    { tcId: "[AF100-44]", name: "ステータス" },
    { tcId: "[AF100-45]", name: "カテゴリ" },
    { tcId: "[AF100-46]", name: "値段" },
  ],
  searchInputCases: [
    { tcId: "[AF100-13]", title: "Nhập chữ Nhật (ハート)", value: "ハート" },
    { tcId: "[AF100-14]", title: "Nhập chữ Latin (Heart)", value: "Heart" },
    { tcId: "[AF100-15]", title: "Nhập số (1000)", value: "1000" },
    { tcId: "[AF100-16]", title: "Nhập ký tự đặc biệt (!@#$%)", value: "!@#$%" },
    { tcId: "[AF100-17]", title: "Nhập khoảng trắng đầu/cuối (  Star  )", value: "  Star  " },
  ],
  statusOptions: [
    { tcId: "[AF100-30]", label: "公開", value: "public" },
    { tcId: "[AF100-31]", label: "非公開", value: "private" },
    { tcId: "[AF100-32]", label: "全てステータス", value: "" },
  ],
  animationTypeOptions: [
    { tcId: "[AF100-34]", label: "通常演出", value: "normal" },
    { tcId: "[AF100-35]", label: "シャッター演出", value: "shutter" },
    { tcId: "[AF100-36]", label: "継続演出", value: "continuous" },
  ],
  paginationTamperingCases: [
    { tcId: "[AF100-76]", title: "URL Tampering ?page=-1", query: { page: "-1" } },
    { tcId: "[AF100-77]", title: "URL Tampering ?page=99999", query: { page: "99999" } },
    { tcId: "[AF100-78]", title: "URL Tampering ?page=abc", query: { page: "abc" } },
  ],
  dynamicHelpers: {
    nonExistentKeyword: () => `NoGift_${Date.now()}`,
  },
};
