import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client đóng gói các thao tác gọi dịch vụ Doanh thu & Quản lý thưởng Agency của màn hình AD303
 * Hỗ trợ GET revenue, CRUD reward và xuất Statement PDF (AD3031, AD3032, AD3033)
 * Tuân thủ Rule 05: Trả về raw response, không chứa expect() bên trong.
 */
export class AD303API {
  /**
   * @param {import('../fixtures/baseTest.js').CustomApiClient | import('@playwright/test').APIRequestContext} request
   */
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  /**
   * Lấy tổng quan doanh thu & dữ liệu 2 bảng (GET /agency/{agency_id}/revenue/)
   */
  async getRevenue(agencyId, { method = "GET", queryParams = {}, headers = {} } = {}) {
    const endpoint = this.baseUrl + ENDPOINTS.AGENCY.REVENUE(agencyId);
    return await this.request.fetch(endpoint, {
      method,
      params: queryParams,
      headers,
    });
  }

  /**
   * Tạo bản ghi chuyển thưởng cho Agency (POST /agency/{agency_id}/reward/) - AD3031
   */
  async createReward(agencyId, { method = "POST", payload = {}, headers = {} } = {}) {
    const endpoint = this.baseUrl + ENDPOINTS.AGENCY.REWARD_CREATE(agencyId);
    return await this.request.post(endpoint, {
      headers,
      data: payload,
    });
  }

  /**
   * Chỉnh sửa bản ghi thưởng (PATCH /agency/{agency_id}/reward/{reward_id}/) - AD3032
   */
  async updateReward(agencyId, rewardId, { method = "PATCH", payload = {}, headers = {} } = {}) {
    const endpoint = this.baseUrl + ENDPOINTS.AGENCY.REWARD_UPDATE(agencyId, rewardId);
    return await this.request.patch(endpoint, {
      headers,
      data: payload,
    });
  }

  /**
   * Xóa bản ghi thưởng (DELETE /agency/{agency_id}/reward/{reward_id}/)
   */
  async deleteReward(agencyId, rewardId, { method = "DELETE", headers = {} } = {}) {
    const endpoint = this.baseUrl + ENDPOINTS.AGENCY.REWARD_DELETE(agencyId, rewardId);
    return await this.request.fetch(endpoint, {
      method,
      headers,
    });
  }

  /**
   * Tải chứng từ chi trả PDF (GET /agency/{agency_id}/statement/{reward_id}/pdf) - AD3033
   */
  async getStatementPdf(agencyId, rewardId, { method = "GET", headers = {} } = {}) {
    const endpoint = this.baseUrl + ENDPOINTS.AGENCY.STATEMENT_PDF(agencyId, rewardId);
    return await this.request.fetch(endpoint, {
      method,
      headers,
    });
  }
}

export { AD303API as AD303AgencyAPI };
