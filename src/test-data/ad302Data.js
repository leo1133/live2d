/**
 * Dữ liệu tĩnh và cấu hình kiểm thử giao diện cho màn hình AD302_Agency Streamer List (事務所詳細_所属ライバー一覧)
 * Áp dụng nguyên tắc Zero-Hardcoding (Rule 05 Section 5.4) & Ranh giới đỏ số 9
 */

export const ad302Data = {
  routes: {
    liverList: (agencyId = 1) => `/agencies/detail/${agencyId}?tab=list-streamer`,
    buildQuery: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          searchParams.append(k, String(v));
        }
      });
      const str = searchParams.toString();
      return str ? `?${str}` : "";
    },
  },

  // 100% Selectors tĩnh được quy hoạch tập trung (Zero Raw Selectors inline trong POM/Spec)
  selectors: {
    breadcrumb: '.breadcrumb, [aria-label="Breadcrumb"]',
    pageHeading: "h1, h2",
    tabDetail: 'a:has-text("詳細"), [role="tab"]:has-text("詳細")',
    tabLiverList: 'a:has-text("ライバー一覧"), [role="tab"]:has-text("ライバー一覧")',
    tabRevenue: 'a:has-text("売上"), [role="tab"]:has-text("売上")',
    searchInput: 'input[type="text"][name="q"], input[type="search"]',
    statusDropdown: 'select[name="status"]',
    agencyStatusDropdown: 'select[name="agency_status"]',
    dataTable: 'table, .data-table',
    tableRows: 'tbody tr',
    tableCells: 'td',
    tableHeaders: 'thead, th',
    toggleColumnsButton: 'button:has-text("»"), button:has-text("«"), [data-testid="toggle-columns"]',
    paginationContainer: '.pagination, [aria-label="Pagination"]',
    nextPageButton: '.pagination .next, button[aria-label="Next page"]',
    prevPageButton: '.pagination .prev, button[aria-label="Previous page"]',
    toastNotification: '.toast, [role="alert"], .notification',

    // Ánh xạ vị trí cột ngữ nghĩa (Semantic Column Index Mapping - Rule 05)
    columns: {
      id: 0,
      userName: 1,
      userStatus: 2,
      agencyStatus: 3,
      category: 4,
      pointSales: 5,
      streamTime: 6,
      actions: 7,
    },
  },

  labels: {
    pageTitle: "事務所詳細",
    breadcrumbs: "＞ 事務所一覧 ＞ 事務所詳細",
    sidebarMenu: "事務所管理",
    tabDetail: "詳細",
    tabLiverList: "ライバー一覧",
    tabRevenue: "売上",
    btnSearch: "検索",
    btnClear: "クリア",
    btnApprove: "承認",
    btnReject: "却下",
    btnExpandColumns: "»",
    btnCollapseColumns: "«",
    statusAll: "全ステータス",
    agencyStatusAll: "全ての所属状態",
  },

  placeholders: {
    searchInput: "ライバー名・ID",
  },

  statusOptions: [
    { label: "全ステータス", value: "" },
    { label: "利用中", value: "1" },
    { label: "停止中", value: "2" },
    { label: "退会済み", value: "3" },
  ],

  agencyStatusOptions: [
    { label: "全ての所属状態", value: "" },
    { label: "所属済み", value: "1" },
    { label: "申請中", value: "3" },
    { label: "退所申請中", value: "5" },
    { label: "退所済み", value: "6" },
  ],

  tableHeaders: {
    id: "ID",
    userName: "ライバー名",
    userStatus: "アカウントステータス",
    agencyStatus: "所属ステータス",
    category: "カテゴリ",
    pointSales: "総獲得pt",
    streamTime: "総配信時間",
    actions: "アクション",
  },

  messages: {
    approveSuccess: "所属申請を承認しました。",
    rejectSuccess: "所属申請を却下しました。",
    noData: "該当するデータがありません。",
  },

  sampleData: {
    agencyId: 1,
    searchKeywordName: "Sakura",
    searchKeywordUid: "485",
  },
};
