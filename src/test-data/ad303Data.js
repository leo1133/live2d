/**
 * Dữ liệu tĩnh và cấu hình kiểm thử giao diện cho màn hình AD303_Revenue Analysis (事務所詳細_売上)
 * Kèm theo Modals: AD3031 (Create Reward), AD3032 (Edit Reward), AD3033 (Payment Statement PDF)
 * Áp dụng nguyên tắc Zero-Hardcoding (Rule 05 Section 5.4) & Ranh giới đỏ số 9
 */

export const ad303Data = {
  routes: {
    revenue: (agencyId = 1) => `/agencies/detail/${agencyId}?tab=revenue`,
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
    cardCashBalance: '[data-testid="cash-balance"], .card:has-text("出金可能残高")',
    cardAvailablePoints: '[data-testid="available-points"], .card:has-text("出金可能ポイント")',
    cardFamiliaPoints: '[data-testid="familia-points"], .card:has-text("ファミリア売上ポイント")',
    cardGiftPoints: '[data-testid="gift-points"], .card:has-text("ギフト売上ポイント")',
    startDateInput: 'input[name="start_date"], input[placeholder*="YYYY/MM/DD"]',
    endDateInput: 'input[name="end_date"], input[placeholder*="YYYY/MM/DD"]',
    streamerSelect: 'select[name="streamer_id"], [data-testid="streamer-select"]',
    rewardTable: '[data-testid="reward-table"], .reward-table, table',
    tableRows: 'tbody tr',
    tableCells: 'td',
    tableHeaders: 'thead, th',
    rewardModal: '.modal, [role="dialog"]',
    modalRewardMonthInput: 'input[name="reward_month"]',
    modalRewardAmountInput: 'input[name="amount"]',
    modalRewardStatusSelect: 'select[name="status"]',
    modalRewardNoteInput: 'textarea[name="note"], input[name="note"]',
    transTable: '[data-testid="trans-table"], .trans-table, table',
    pdfModal: '.modal, [role="dialog"]',
    toastNotification: '.toast, [role="alert"], .notification',

    // Ánh xạ vị trí cột ngữ nghĩa Bảng 1 (Lịch sử thưởng)
    rewardColumns: {
      month: 0,
      amount: 1,
      status: 2,
      paidAt: 3,
      note: 4,
      actions: 5,
    },

    // Ánh xạ vị trí cột ngữ nghĩa Bảng 2 (Giao dịch)
    transColumns: {
      transDate: 0,
      transId: 1,
      streamerName: 2,
      userName: 3,
      category: 4,
      points: 5,
      amount: 6,
    },
  },

  labels: {
    pageTitle: "事務所詳細",
    breadcrumbs: "＞ 事務所管理 ＞ 事務所詳細",
    sidebarMenu: "事務所管理",
    tabDetail: "詳細",
    tabLiverList: "ライバー一覧",
    tabRevenue: "売上",
    btnSearch: "検索",
    btnClear: "クリア",
    btnExportCsv: "CSVエクスポート",
    btnAddReward: "報酬を追加",
    btnEditReward: "編集",
    btnDeleteReward: "削除",
    btnDownloadPdf: "支払明細書ダウンロード",
    btnSave: "保存",
    btnCancel: "キャンセル",
    cardCashBalance: "出金可能残高 (円)",
    cardAvailablePoints: "出金可能ポイント",
    cardFamiliaPoints: "ファミリア売上ポイント",
    cardGiftPoints: "ギフト売上ポイント",
  },

  placeholders: {
    startDate: "YYYY/MM/DD",
    endDate: "YYYY/MM/DD",
    streamerSelect: "ライバーを選択",
    rewardMonth: "YYYY/MM",
    rewardAmount: "金額を入力してください",
    rewardNote: "備考を入力してください",
  },

  modalTitles: {
    ad3031CreateReward: "報酬追加",
    ad3032EditReward: "報酬編集",
    ad3033DownloadPdf: "支払明細書",
  },

  messages: {
    createRewardSuccess: "報酬情報を登録しました。",
    updateRewardSuccess: "報酬情報を更新しました。",
    deleteRewardSuccess: "報酬情報を削除しました。",
    deleteConfirm: "この報酬情報を削除しますか？",
    csvExportSuccess: "CSVファイルのダウンロードを開始しました。",
    emptyFieldSuffix: "は空欄にできません。",
    invalidDateFormat: "日付の形式が正しくありません。",
    invalidAmountFormat: "半角数字で入力してください。",
  },

  sampleData: {
    agencyId: 1,
    defaultStartDate: "2026/01/01",
    defaultEndDate: "2026/01/31",
    rewardMonth: "2026/01",
    rewardAmount: "500000",
    rewardNote: "1月分成果報酬",
  },
};
