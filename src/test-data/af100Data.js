import { generateRandomString } from "../utils/helpers.js";

/**
 * Dữ liệu kiểm thử & Bộ Selector tập trung cho AF100 (Gift List)
 * // [Pending Live Verification] - Cần đối chiếu selector thực tế khi chạy trên môi trường live
 */
export const af100Data = {
  routes: {
    giftList: "/admin/gifts",
    giftCreate: "/admin/gifts/create",
    giftEdit: (id) => `/admin/gifts/${id}`,
    categoryManage: "/admin/gift-categories",
    highValueConfig: "/admin/high-value-gift",
    buildGiftListQuery: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return qs ? `/admin/gifts?${qs}` : "/admin/gifts";
    },
  },
  selectors: {
    sidebarMenu: 'nav, aside, [data-testid="sidebar"]',
    breadcrumb: '.breadcrumb, [aria-label="Breadcrumb"]',
    searchInput: 'input[name="q"], input[type="search"]',
    clearSearchIcon: '[data-testid="search-clear"], button[aria-label="Clear"]',
    categoryDropdown: 'select[name="category_id"], [data-testid="category-filter"]',
    statusDropdown: 'select[name="status"], [data-testid="status-filter"]',
    dataTable: 'table, .data-table, [data-testid="gift-table"]',
    tableHeaders: "thead th",
    tableRows: "tbody tr",
    loadingSpinner: '.loading-spinner, [data-testid="loading-indicator"]',
    emptyState: '.empty-state, [data-testid="empty-state"]',
    paginationContainer: '.pagination, [aria-label="Pagination"]',
    paginationInput: '.pagination input[type="text"], .pagination input[type="number"]',
    statusToggle: 'input[type="checkbox"][role="switch"], [data-testid="status-toggle"]',
    columns: {
      id: 0,
      icon: 1,
      name: 2,
      category: 3,
      coinPrice: 4,
      sortOrder: 5,
      status: 6,
      createdAt: 7,
      updatedAt: 8,
      actions: 9,
    },
  },
  labels: {
    sidebarParent: "ギフト管理",
    sidebarGiftList: "ギフト一覧",
    sidebarCategory: "カテゴリ管理",
    sidebarHighValue: "高額ギフト設定",
    breadcrumbs: "ギフト管理",
    btnSearch: "検索",
    btnClear: "クリア",
    btnCreate: "新規登録",
    statusDropdown: "ステータス",
    categoryDropdown: "カテゴリ",
    emptyState: "一致する検索結果はありません。",
    errorPermission: "この操作を行う権限がありません。",
    errorServer: "予期しないサーバーエラーが発生しました。",
    paginationPrev: "<<前",
    paginationNext: "次>>",
    paginationFirst: "<<",
    paginationLast: ">>",
    paginationEllipsis: "…",
  },
  placeholders: {
    searchInput: "ギフト名・ギフトID",
  },
  tableHeaders: [
    { tcId: "[AF100-39]", key: "id", text: "ID", align: "center" },
    { tcId: "[AF100-40]", key: "icon", text: "アイコン", align: "center" },
    { tcId: "[AF100-41]", key: "name", text: "ギフト名", align: "left" },
    { tcId: "[AF100-42]", key: "category", text: "カテゴリ", align: "left" },
    { tcId: "[AF100-43]", key: "coinPrice", text: "コイン", align: "right" },
    { tcId: "[AF100-44]", key: "sortOrder", text: "表示順", align: "right" },
    { tcId: "[AF100-45]", key: "status", text: "ステータス", align: "center" },
    { tcId: "[AF100-46]", key: "createdAt", text: "作成日", align: "center" },
    { tcId: "[AF100-47]", key: "actions", text: "操作", align: "center" },
  ],
  dropdownOptions: {
    status: [
      { tcId: "[AF100-28]", label: "ON", value: "active" },
      { tcId: "[AF100-29]", label: "OFF", value: "inactive" },
      { tcId: "[AF100-30]", label: "全て", value: "" },
    ],
  },
  searchInputCases: [
    { tcId: "[AF100-13]", label: "Chữ Nhật & Latin", value: "ハート Heart" },
    { tcId: "[AF100-14]", label: "Chuỗi số", value: "12345" },
    { tcId: "[AF100-15]", label: "Ký tự đặc biệt", value: "!@#$%^&*()" },
    { tcId: "[AF100-16]", label: "Khoảng trắng đầu/cuối", value: "  Star Gift  ", trimmed: "Star Gift" },
  ],
  paginationConfig: {
    defaultPageSize: 10,
    tamperingCases: [
      { tcId: "[AF100-72]", param: -1, label: "page=-1" },
      { tcId: "[AF100-72]", param: 99999, label: "page=99999" },
      { tcId: "[AF100-72]", param: "abc", label: "page=abc" },
    ],
  },
  dynamicHelpers: {
    nonExistentKeyword: () => `NO_GIFT_${generateRandomString(8, true)}`,
  },
  timeouts: {
    pageLoad: 15000,
    modal: 5000,
    action: 10000,
    suiteTimeout: 60000,
  },
};
