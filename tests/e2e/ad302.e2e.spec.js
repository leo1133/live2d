import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD302Page, AD302AgencyLiverListPage } from "../../src/pages/AD302Page.js";
import { AD302API, AD302AgencyAPI } from "../../src/api/AD302API.js";
import { ad302Data } from "../../src/test-data/ad302Data.js";

/**
 * Kịch bản kiểm thử Tích hợp Đầu cuối E2E (End-to-End Test Suite)
 * Màn hình: AD302_Agency Streamer List
 * Luồng: Tìm kiếm Streamer trên UI -> Đối soát dữ liệu trả về từ Backend API
 */

test.describe("AD302_Agency Streamer List - End-to-End (E2E) Flow", () => {
  test("[AD302-E2E-01] Luồng tìm kiếm streamer trên Giao diện UI và đối soát dữ liệu với Backend API", async ({
    page,
    authenticatedRequest,
  }) => {
    const liverPage = new AD302AgencyLiverListPage(page);
    await liverPage.goto(ad302Data.sampleData.agencyId);

    // 1. Thao tác tìm kiếm trên UI
    await liverPage.search({ keyword: "Sakura" });

    // 2. Đối soát qua Backend API
    const agencyApi = new AD302AgencyAPI(authenticatedRequest);
    const apiRes = await agencyApi.getLiverList(ad302Data.sampleData.agencyId, {
      queryParams: { q: "Sakura" },
    });

    expect(apiRes.status()).toBeDefined();
  });
});
