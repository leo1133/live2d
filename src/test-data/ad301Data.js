/**
 * Dữ liệu tĩnh và cấu hình kiểm thử giao diện cho màn hình AD301_Agency Information (事務所詳細_詳細)
 * Áp dụng nguyên tắc Zero-Hardcoding (Rule 05 Section 5.4) & Ranh giới đỏ số 9
 */

export const ad301Data = {
  routes: {
    detail: (agencyId = 1) => `/agencies/detail/${agencyId}?tab=detail`,
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
    nameInput: 'input[name="name"], input#name',
    codeInput: 'input[name="code"], input#code',
    contactNameInput: 'input[name="contact_name"], input#contact_name',
    contactPhoneInput: 'input[name="contact_phone"], input#contact_phone',
    contactEmailInput: 'input[name="contact_email"], input#contact_email',
    logoFileInput: 'input[type="file"][accept*="image"]',
    selectLogoButton: 'label:has(input[type="file"])',
    logoPreview: '.logo-preview, img[alt="Agency Logo"]',
    statusDropdown: 'select[name="status"], [data-testid="status-select"]',
    statusConfirmModal: '.modal, [role="dialog"]',
    deleteConfirmModal: '.modal, [role="dialog"]',
    nameError: '#name-error, [data-field="name"] .error-msg',
    codeError: '#code-error, [data-field="code"] .error-msg',
    contactNameError: '#contact_name-error, [data-field="contact_name"] .error-msg',
    contactPhoneError: '#contact_phone-error, [data-field="contact_phone"] .error-msg',
    contactEmailError: '#contact_email-error, [data-field="contact_email"] .error-msg',
    toastNotification: '.toast, [role="alert"], .notification',
  },

  labels: {
    pageTitle: "事務所詳細",
    breadcrumbs: "＞ 事務所管理 ＞ 事務所詳細",
    sidebarMenu: "事務所管理",
    tabDetail: "詳細",
    tabLiverList: "ライバー一覧",
    tabRevenue: "売上",
    nameLabel: "事務所名",
    codeLabel: "事務所ID",
    logoLabel: "事務所ロゴ",
    contactNameLabel: "連絡先 オーナー名",
    contactPhoneLabel: "電話番号",
    contactEmailLabel: "メールアドレス",
    statusLabel: "ステータス",
    btnSave: "保存",
    btnDelete: "削除",
    btnChangePassword: "パスワード変更",
    btnSelectImage: "画像を選択",
    statusActive: "利用中",
    statusInactive: "停止中",
    modalConfirmDelete: "削除",
    modalConfirmStatus: "停止する",
    modalCancel: "キャンセル",
  },

  placeholders: {
    name: "事務所名を入力してください",
    code: "IDを入力してください",
    contactName: "オーナー名を入力してください",
    contactPhone: "電話番号を入力してください",
    contactEmail: "メールアドレスを入力してください",
    password: "新しいパスワードを入力してください",
  },

  messages: {
    updateSuccess: "事務所情報を更新しました。", // MSG61
    deleteSuccess: "事務所を削除しました。", // MSG62
    deleteConfirm: "事務所を削除すると、所属ライバーの紐付けが解除され、元に戻せません。本当に削除しますか？", // MSG66
    statusChangeConfirm: "停止すると、所属ライバーの紐付けが解除されます。よろしいですか？", // MSG65
    emailChangePending: "確認メールを送信しました。メール内のリンクから手続きを完了してください。", // PEM4 info
    notFound: "対象のデータが見つかりません。", // CMMSG3
    permissionDenied: "この操作を行う権限がありません。", // CMMSG5
    duplicateName: "事務所名は既に存在しています。", // CMMSG57
    duplicateCode: "この事務所IDは既に使用されています。", // MSG15
    emptyFieldSuffix: "は空欄にできません。", // CMMSG29
    tooLongSuffix: "は文字数が多すぎます。20文字以内で入力してください。", // CMMSG49
    tooShortCode: "事務所IDは文字数が足りません。3文字以上で入力してください。", // CMMSG52
    tooShortPhone: "電話番号は文字数が足りません。5文字以上で入力してください。", // CMMSG52
    invalidCodeFormat: "半角英数字で入力してください。", // CMMSG55
    invalidEmailFormat: "正しいメールアドレスの形式で入力してください。", // CMMSG47
    invalidPhoneFormat: "半角数字で入力してください。", // CMMSG50
    passwordHistoryConstraint: "過去3回以内に使用したパスワードは設定できません。", // MSG261
  },

  sampleData: {
    agencyId: 1,
    name: "テスト事務所_AD301",
    code: "ad301test01",
    contactName: "佐藤 健",
    contactPhone: "09087654321",
    contactEmail: "ad301_owner@example.com",
    newValidEmail: "new_owner_ad301@example.com",
    newPasswordValid: "Password123!",
  },
};
