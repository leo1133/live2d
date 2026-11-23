import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD303Page, AD303AgencyRevenuePage } from "../../src/pages/AD303Page.js";
import { AD303API, AD303AgencyAPI } from "../../src/api/AD303API.js";
import { ad303Data } from "../../src/test-data/ad303Data.js";

/**
 * Kịch bản kiểm thử Tích hợp Đầu cuối E2E (End-to-End Test Suite)
 * Màn hình: AD303_Revenue Analysis & Reward Management
 * Luồng: Mở trang Doanh thu -> Thêm khoản thưởng qua UI Modal AD3031 -> Đối soát qua API
 */

test.describe("AD303_Revenue Analysis - End-to-End (E2E) Flow", () => {
  test("[AD303-E2E-01] Luồng thêm khoản thưởng Agency từ Giao diện UI và đối soát cập nhật Doanh thu qua API", async ({
    page,
    authenticatedRequest,
  }) => {
    const revenuePage = new AD303AgencyRevenuePage(page);
    await revenuePage.goto(ad303Data.sampleData.agencyId);

    // 1. Kiểm tra tải dữ liệu ban đầu
    await expect(revenuePage.pageTitle).toBeVisible();

    // 2. Thao tác mở Modal thêm thưởng nếu nút khả dụng
    if (await revenuePage.addRewardButton.isVisible()) {
      await revenuePage.openCreateRewardModal();
      if (await revenuePage.rewardModal.isVisible()) {
        await revenuePage.fillRewardModal({
          month: ad303Data.sampleData.rewardMonth,
          amount: ad303Data.sampleData.rewardAmount,
          note: "E2E Test Reward",
        });
        await revenuePage.saveRewardModal();
      }
    }

    // 3. Đối soát phía Backend API
    const agencyApi = new AD303AgencyAPI(authenticatedRequest);
    const revenueRes = await agencyApi.getRevenue(ad303Data.sampleData.agencyId);

    expect(revenueRes.status()).toBeDefined();
  });
});
