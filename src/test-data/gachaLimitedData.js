export const gachaLimitedData = {
  urls: {
    avatarList: "/gachas/avatar-list",
    detailPage: (modelId) => `/gachas/detail/${modelId}/limited`,
  },
  assets: {
    testBannerPath: "src/test-data/assets/test_banner.png",
  },
  timeouts: {
    suiteTimeout: 60000,
    pageLoad: 15000,
    modal: 5000,
    actionResponse: 15000,
  },
  headings: {
    avatarList: "アバター一覧",
    limitedGachaRegex: /の期間限定アバターガチャ/,
  },
  links: {
    editLimitedRegex: /の期間限定ガチャを編集/,
  },
  banner: {
    titleText: "ガチャのバナー *",
    uploadButtonText: "画像をアップロード",
    fileInput: 'input[type="file"]',
  },
  pitySettings: {
    hardPityLabel: "天井設定 *",
    softPityLabel: "仮天井設定 *",
    giftHardPityLabel: "ギフトガチャ天井設定 *",
    giftSoftPityLabel: "ギフトガチャ仮天井設定 *",
    saveButtonText: "保存",
  },
  itemRegistration: {
    newItemButtonText: "新規登録",
    cancelButtonText: "キャンセル",
    saveButtonText: "登録",
  },
  table: {
    columns: {
      id: "ID",
      category: "カテゴリ",
      itemName: "アイテム名",
      itemImage: "アイテム画像",
      type: "種類",
      secret: "シークレット",
    },
    actionRegex: {
      preview: /の画像をプレビュー/,
      edit: /を編集/,
      delete: /を削除/,
    },
    closeButtonText: "閉じる",
    colorTabTitle: "色変更",
    cancelButtonText: "キャンセル",
  },
  pagination: {
    summaryRegex: /全 .* 件中 .* 件を表示/,
    prevPageText: "前",
    nextPageText: "次",
    jumpPageText: "ページへ移動",
  },
  testValues: {
    hardPity: "100",
    softPity: "50",
    giftHardPity: "80",
    giftSoftPity: "40",
  },
  e2eTestPity: {
    hardPity: 105,
    softPity: 55,
    giftHardPity: 95,
    giftSoftPity: 45,
  },
};
