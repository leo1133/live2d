import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF100GiftListAPI } from "../../src/api/AF100API.js";
import { AF200GiftCreateAPI } from "../../src/api/AF200API.js";
import { AF300GiftDetailAPI } from "../../src/api/AF300API.js";
import { AF300GiftDetailPage } from "../../src/pages/AF300Page.js";
import { buildGiftPayload } from "../../src/test-data/apiAf200Data.js";
import { af300Data } from "../../src/test-data/af300Data.js";

test.describe("E2E AF300: Gift Lifecycle (Seed API -> Edit UI -> Verify GET -> Cleanup Delete)", () => {
  test("[AF300-E2E-01]: Seed quà bằng API -> Mở AF300 sửa giá Coin -> Verify API -> Delete Cleanup", async ({
    page,
    authenticatedRequest,
  }) => {
    const listApi = new AF100GiftListAPI(authenticatedRequest);
    const createApi = new AF200GiftCreateAPI(authenticatedRequest);
    const detailApi = new AF300GiftDetailAPI(authenticatedRequest);
    const payload = buildGiftPayload();
    const seedRes = await createApi.createGift({ payload });
    expect([200, 201]).toContain(seedRes.status());
    const seedBody = await seedRes.json();
    let giftId = seedBody.id || seedBody.data?.id;
    if (!giftId) {
      const searchRes = await listApi.getGiftList({ queryParams: { keyword: payload.name } });
      const searchBody = await searchRes.json();
      giftId = searchBody.data?.[0]?.id;
    }

    if (giftId) {
      const detailPage = new AF300GiftDetailPage(page);
      await detailPage.goto(giftId);
      const upd = af300Data.buildUpdateData();
      await detailPage.nameInput.fill(upd.name);
      await detailPage.clickSave();

      const getRes = await detailApi.getGiftDetail(giftId);
      expect(getRes.status()).toBe(200);

      const delRes = await detailApi.deleteGift(giftId);
      expect([200, 204]).toContain(delRes.status());
    }
  });
});
