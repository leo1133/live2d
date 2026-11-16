/**
 * Dữ liệu tĩnh và cấu hình kiểm thử giao diện cho màn hình AD200_Register Agency (事務所新規登録)
 * Áp dụng nguyên tắc Zero-Hardcoding (Rule 05 Section 5.4) & Ranh giới đỏ số 9
 */

export const ad200Data = {
  routes: {
    create: "/admin/agencies/create",
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
    nameInput: 'input[name="name"], input#name',
    codeInput: 'input[name="code"], input#code',
    codeHint: '.hint, .form-text, [data-testid="code-hint"]',
    contactNameInput: 'input[name="contact_name"], input#contact_name',
    contactPhoneInput: 'input[name="contact_phone"], input#contact_phone',
    contactEmailInput: 'input[name="contact_email"], input#contact_email',
    logoFileInput: 'input[type="file"][accept*="image"]',
    selectLogoButton: 'label:has(input[type="file"])',
    logoPreview: '.logo-preview, img[alt="Agency Logo"], [data-testid="logo-preview"]',
    removeLogoButton: 'button[aria-label="Remove logo"], .btn-remove-logo, [data-testid="remove-logo"]',
    cancelModal: '.modal, [role="dialog"]',
    nameError: '#name-error, [data-field="name"] .error-msg, input[name="name"] + .error',
    codeError: '#code-error, [data-field="code"] .error-msg, input[name="code"] + .error',
    contactNameError: '#contact_name-error, [data-field="contact_name"] .error-msg',
    contactPhoneError: '#contact_phone-error, [data-field="contact_phone"] .error-msg',
    contactEmailError: '#contact_email-error, [data-field="contact_email"] .error-msg',
    toastNotification: '.toast, [role="alert"], .notification',
  },

  labels: {
    pageTitle: "事務所新規登録",
    breadcrumbs: "＞ 事務所管理 ＞ 事務所新規登録",
    sidebarMenu: "事務所管理",
    sidebarSubmenu: "事務所新規登録",
    nameLabel: "事務所名",
    codeLabel: "事務所ID",
    logoLabel: "事務所ロゴ",
    contactNameLabel: "連絡先 オーナー名",
    contactPhoneLabel: "電話番号",
    contactEmailLabel: "メールアドレス",
    btnSelectImage: "画像を選択",
    btnCancel: "キャンセル",
    btnSubmit: "登録",
    btnDiscard: "破棄",
  },

  placeholders: {
    name: "事務所名を入力してください",
    code: "IDを入力してください",
    contactName: "オーナー名を入力してください",
    contactPhone: "電話番号を入力してください",
    contactEmail: "メールアドレスを入力してください",
  },

  hints: {
    code: "・使用可能文字：英文字、数字 \n ・文字数制限：3 〜 20文字",
    codeKeyword: "使用可能文字：英文字、数字",
  },

  messages: {
    success: "事務所を登録しました。", // MSG60
    cancelConfirm: "入力内容が保存されていません。破棄してもよろしいですか？", // MSG67
    permissionDenied: "この操作を行う権限がありません。", // CMMSG5
    duplicateName: "事務所名は既に存在しています。", // CMMSG57
    duplicateCode: "この事務所IDは既に使用されています。", // MSG15
    duplicateEmail: "このメールアドレスは既に登録されています。", // MSG14
    emptyFieldSuffix: "は空欄にできません。", // CMMSG29
    tooLongSuffix: "は文字数が多すぎます。20文字以内で入力してください。", // CMMSG49
    tooShortCode: "事務所IDは文字数が足りません。3文字以上で入力してください。", // CMMSG52
    tooShortPhone: "電話番号は文字数が足りません。5文字以上で入力してください。", // CMMSG52
    invalidCodeFormat: "半角英数字で入力してください。", // CMMSG55
    invalidEmailFormat: "正しいメールアドレスの形式で入力してください。", // CMMSG47
    invalidPhoneFormat: "半角数字で入力してください。", // CMMSG50
  },

  validAgency: {
    name: "AutoTest_Agency",
    code: "autotestag01",
    contactName: "山田 太郎",
    contactPhone: "09012345678",
    contactEmail: "autotest_owner@example.com",
    logoFileName: "test_logo.png",
  },

  boundaryCases: {
    nameMin: "A",
    nameMax: "A".repeat(20),
    nameOver: "A".repeat(21),
    codeMin: "ag1",
    codeMax: "a".repeat(20),
    codeUnder: "ag",
    codeOver: "a".repeat(21),
    contactNameMin: "B",
    contactNameMax: "B".repeat(20),
    contactNameOver: "B".repeat(21),
    phoneMin: "01234",
    phoneMax: "09012345678901234567",
    phoneUnder: "0123",
    phoneOver: "0".repeat(21),
    invalidCodes: ["Agency_01", "東京01", "agency 01", "agency@01"],
    invalidPhones: ["090-abcd-efgh", "090123456a", "０９０１２３４５６７８"],
    invalidEmails: ["plainaddress", "test@", "@example.com", "test..123@example.com"],
  },
};
