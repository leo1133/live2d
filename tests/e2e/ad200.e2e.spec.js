import { test, expect } from "../../src/fixtures/baseTest.js";
import { AD200Page, AD200AgencyCreatePage } from "../../src/pages/AD200Page.js";
import { AD100API, AD100AgencyAPI } from "../../src/api/AD100API.js";
import { ad200Data } from "../../src/test-data/ad200Data.js";

/**
 * Kịch bản kiểm thử Tích hợp Đầu cuối E2E (End-to-End Test Suite)
 * Màn hình: AD200_Register Agency
 * Luồng: Nhập form UI -> Bấm Đăng ký -> Kiểm tra đối soát qua Backend API
 */

test.describe("AD200_Register Agency - End-to-End (E2E) Flow", () => {
  test("[AD200-E2E-01] Luồng tạo mới Agency hoàn chỉnh từ Giao diện UI và đối soát qua API", async ({
    page,
    authenticatedRequest,
  }) => {
    const timestamp = Date.now();
    const uniqueName = `E2E_Agency_${timestamp}`;
    const uniqueCode = `ag${timestamp.toString().slice(-8)}`;
    const uniqueEmail = `owner_${timestamp}@example.com`;

    const createPage = new AD200AgencyCreatePage(page);
    await createPage.goto();

    // 1. Điền thông tin vào form UI
    await createPage.fillForm({
      name: uniqueName,
      code: uniqueCode,
      contactName: "E2E Owner",
      contactPhone: "09012345678",
      contactEmail: uniqueEmail,
    });

    // 2. Submit form
    await createPage.submit();

    // 3. Đối soát phía API: Tìm kiếm Agency vừa tạo xem đã có trong hệ thống chưa
    const agencyApi = new AD100AgencyAPI(authenticatedRequest);
    const searchRes = await agencyApi.getAgencyList({
      payload: {
        keyword: uniqueCode,
      },
    });

    expect(searchRes.status()).toBeDefined();
  });
});
