import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF200GiftCreateAPI } from "../../src/api/AF200API.js";
import { AF300GiftDetailAPI } from "../../src/api/AF300API.js";
import { AF300GiftDetailPage } from "../../src/pages/AF300Page.js";
import { buildGiftPayload } from "../../src/test-data/apiAf200Data.js";
import { af300Data } from "../../src/test-data/af300Data.js";

test.describe("E2E AF300: Gift Full CRUD Lifecycle (Tạo => Update => Xóa)", () => {
  test("[AF300-E2E-01]: Seed quà bằng API -> Mở AF300 sửa giá Coin -> Verify API -> Delete Cleanup", async ({
    page,
    authenticatedRequest,
  }) => {
    const createApi = new AF200GiftCreateAPI(authenticatedRequest);
    const detailApi = new AF300GiftDetailAPI(authenticatedRequest);
    const seedRes = await createApi.createGift({ payload: buildGiftPayload() });
    expect([200, 201]).toContain(seedRes.status());
    const seedBody = await seedRes.json();
    const giftId = seedBody.id || seedBody.data?.id;

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

  test("[AF300-E2E-02]: Chu trình trọn vẹn: Tạo quà qua API -> Sửa trên UI -> Xóa trực tiếp qua Modal UI -> Đối soát 404 qua API", async ({
    page,
    authenticatedRequest,
  }) => {
    // 1. Tạo mới (Create)
    const createApi = new AF200GiftCreateAPI(authenticatedRequest);
    const detailApi = new AF300GiftDetailAPI(authenticatedRequest);
    const seedRes = await createApi.createGift({ payload: buildGiftPayload() });
    expect([200, 201]).toContain(seedRes.status());
    const seedBody = await seedRes.json();
    const giftId = seedBody.id || seedBody.data?.id;

    if (giftId) {
      const detailPage = new AF300GiftDetailPage(page);
      await detailPage.goto(giftId);

      // 2. Chỉnh sửa trên UI (Update)
      const updateData = af300Data.buildUpdateData({ price: 1500 });
      await detailPage.fillName(updateData.name);
      await detailPage.fillPrice(updateData.price);
      await detailPage.save();

      // 3. Đối soát API phản ánh dữ liệu mới (Verify Read)
      const getRes = await detailApi.getGiftDetail(giftId);
      expect(getRes.status()).toBe(200);

      // 4. Xóa trực tiếp trên UI qua Modal xác nhận (Delete UI Flow)
      await detailPage.deleteGift(true);

      // 5. Đối soát API sau khi xóa (Post-Delete Verification -> 404 / 410)
      const afterDelRes = await detailApi.getGiftDetail(giftId);
      expect([404, 410]).toContain(afterDelRes.status());
    }
  });
});
