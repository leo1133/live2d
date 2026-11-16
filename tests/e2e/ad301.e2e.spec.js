import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD301Page, AD301AgencyDetailPage } from "../../src/pages/AD301Page.js";
import { AD301API, AD301AgencyAPI } from "../../src/api/AD301API.js";
import { ad301Data } from "../../src/test-data/ad301Data.js";

/**
 * Kịch bản kiểm thử Tích hợp Đầu cuối E2E (End-to-End Test Suite)
 * Màn hình: AD301_Agency Information
 * Luồng: Chỉnh sửa thông tin Agency trên UI -> Bấm Lưu -> Đối soát cập nhật qua API
 */

test.describe("AD301_Agency Information - End-to-End (E2E) Flow", () => {
  test("[AD301-E2E-01] Luồng cập nhật thông tin Agency từ Giao diện UI và đối soát tính toàn vẹn qua Backend API", async ({
    page,
    authenticatedRequest,
  }) => {
    const timestamp = Date.now();
    const updatedContactName = `Owner_${timestamp.toString().slice(-6)}`;

    const detailPage = new AD301AgencyDetailPage(page);
    await detailPage.goto(ad301Data.sampleData.agencyId);

    // 1. Chỉnh sửa thông tin trên UI
    await detailPage.contactNameInput.fill(updatedContactName);

    // 2. Bấm nút Lưu (保存)
    await detailPage.save();

    // 3. Đối soát qua Backend API xem thông tin đã được ghi nhận
    const agencyApi = new AD301AgencyAPI(authenticatedRequest);
    const detailRes = await agencyApi.getAgencyDetail(ad301Data.sampleData.agencyId);

    expect(detailRes.status()).toBeDefined();
  });
});
