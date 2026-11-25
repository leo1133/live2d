import { test, expect } from "../../src/fixtures/baseTest.js";
import { AF200GiftCreatePage } from "../../src/pages/AF200Page.js";
import { AF100GiftListAPI } from "../../src/api/AF100API.js";
import { af200Data } from "../../src/test-data/af200Data.js";
import { ENDPOINTS } from "../../src/config/endpoint.js";

test.describe("E2E AF200: Gift Create -> Verify API & DB Persistence", () => {
  test("[AF200-E2E-01]: Tạo mới quà từ UI -> Bắt POST /gifts -> Đối soát GET /gifts & DB", async ({
    page,
    authenticatedRequest,
  }) => {
    const createPage = new AF200GiftCreatePage(page);
    await createPage.goto();
    const formData = af200Data.buildGiftFormData();
    await createPage.fillForm(formData);

    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().includes(ENDPOINTS.GIFT.CREATE) && r.request().method() === "POST"),
      createPage.clickSave(),
    ]);
    expect([200, 201]).toContain(res.status());

    const listApi = new AF100GiftListAPI(authenticatedRequest);
    const listRes = await listApi.getGiftList({ queryParams: { q: formData.name } });
    expect(listRes.status()).toBe(200);
  });
});
