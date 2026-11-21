/**
 * Dữ liệu tĩnh tập trung cho màn hình AD100_Agency List / Search (事務所一覧・検索)
 * Áp dụng: Quy chuẩn Trụ cột 5 (Universal Automation Testing Standard)
 * Nguyên tắc Zero-Hardcode: Tuyệt đối không gán chuỗi literal trực tiếp trong test specs hay POM.
 */

export const ad100Data = {
  // Đường dẫn Route UI & Query Builders động
  routes: {
    agencyList: "/agencies",
    agencyCreate: "/agencies/create",
    agencyDetail: (id) => `/agencies/detail/${id}?tab=detail`,
    agencyLivers: (id) => `/agencies/detail/${id}?tab=list-streamer`,
    buildAgencyListQuery: (params = {}) => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          query.set(key, String(value));
        }
      }
      const qs = query.toString();
      return qs ? `/agencies?${qs}` : "/agencies";
    },
  },

  // Tập trung toàn bộ Selectors tĩnh & Ánh xạ vị trí cột
  selectors: {
    breadcrumb: '.breadcrumb, [aria-label="Breadcrumb"]',
    searchInput: 'input[type="text"][name="q"], input[type="search"]',
    statusDropdown: 'select[name="status"], [role="combobox"]',
    dataTable: '.data-table, [data-testid="agency-table"]',
    tableRows: 'tbody tr',
    tableCells: 'td',
    tableHeaders: 'th',
    emptyState: '.empty-state, [data-testid="empty-state"]',
    loadingSpinner: '.loading-spinner, [data-testid="loading-indicator"]',
    skeleton: '[data-slot="skeleton"]',
    paginationContainer: 'nav[data-slot="pagination"], nav[aria-label="pagination" i], .pagination',
    prevPageButton: 'button[aria-label="前のページへ"], button[aria-label="Previous Page"]',
    nextPageButton: 'button[aria-label="次のページへ"], button[aria-label="Next Page"]',
    firstPageButton: 'button[aria-label="最初のページへ"], button[aria-label="First Page"]',
    lastPageButton: 'button[aria-label="最後のページへ"], button[aria-label="Last Page"]',
    deleteButtons: 'button[aria-label="Delete"], .btn-delete, [data-testid="delete-btn"]',
    btnEdit: 'button[aria-label="編集"], button:has(.lucide-pencil)',

    // Bảng ánh xạ vị trí cột ngữ nghĩa - Triệt tiêu Magic Index (.nth(4))
    columns: {
      id: 0,
      agencyCode: 1,
      agencyName: 2,
      contactOwner: 3,
      streamerCount: 4,
      pointSales: 5,
      familiaSales: 6,
      totalSales: 7,
      status: 8,
      createdAt: 9,
      updatedAt: 10,
      actions: 11,
    },
  },

  // Cấu hình Viewport màn hình
  viewports: {
    standardDesktop: { width: 1280, height: 720 },
  },

  // Nhãn hiển thị văn bản (Labels)
  labels: {
    breadcrumbs: "＞ 事務所管理",
    screenTitle: "事務所一覧",
    sidebarMenu: "事務所管理",
    sidebarSubmenu: "事務所一覧",
    statusDropdown: "ステータス",
    btnSearch: "検索",
    btnClear: "クリア",
    btnCreate: "新規登録",
    emptyState: "一致する検索結果はありません。",
  },

  // Gợi ý ô nhập liệu (Placeholders)
  placeholders: {
    searchInput: "事務所名・事務所ID",
  },

  // Tùy chọn hộp chọn Dropdown
  dropdownOptions: {
    status: {
      all: "全て",
      active: "利用中",
      inactive: "停止中",
    },
    statusValues: {
      all: "",
      active: 1,
      inactive: 2,
    },
  },

  // Tiêu đề các cột trong bảng (Table Headers)
  tableHeaders: {
    id: "ID",
    agencyId: "事務所ID",
    agencyName: "事務所名",
    contactOwner: "連絡先 オーナー名",
    streamerCount: "ライバー数",
    pointSales: "ポイント売上",
    familiaSales: "ファミリア売上",
    totalSales: "売上合計",
    status: "ステータス",
    createdAt: "作成日",
    updatedAt: "変更日",
    actions: "操作",
  },

  // Cấu hình Phân trang (Pagination)
  pagination: {
    defaultItemsPerPage: 10,
    allowedLimits: [10, 20, 50, 100],
    nextBtn: "次>>",
    prevBtn: "<<前",
    firstBtn: "<<",
    lastBtn: ">>",
  },

  // Thời gian chờ tiêu chuẩn (Timeouts)
  timeouts: {
    pageLoad: 15000,
    action: 5000,
    modal: 5000,
    suiteTimeout: 60000,
  },

  // Dữ liệu mẫu phục vụ kiểm thử tìm kiếm
  searchTestData: {
    validName: "事務所",
    validCode: "agency01",
    validSystemId: "1",
    nonExistentKeyword: "NON_EXISTENT_AGENCY_XYZ_99999",
    specialCharacters: "!@#$%^&*()",
    spacesAround: "  Agency  ",
    kanjiKeyword: "事務所",
    latinKeyword: "Agency",
    numbersOnly: "123456",
  },

  // Thông báo lỗi chuẩn hệ thống (Error Messages)
  errorMessages: {
    networkError: "CMMSG8: ネットワークエラー。接続を確認してください。",
    serverError: "CMMSG1: 予期しないサーバーエラーが発生しました。",
    sessionExpired: "CMMSG10: セッションの有効期限が切れました。再度ログインしてください。",
    unauthorized: "CMMSG4: 認証されていないアクセスです。再度ログインしてください。",
    permissionDenied: "CMMSG5: この操作を行う権限がありません。",
    emptySearchResult: "CMMSG47: 一致する検索結果はありません。",
  },
};
