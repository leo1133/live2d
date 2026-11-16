import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client đóng gói các thao tác gọi dịch vụ Agency của màn hình AD301
 * Hỗ trợ GET /agency/{id}/, PATCH /agency/{id}/, DELETE /agency/{id}/, POST /agency/auth/verify-email-change/
 * Tuân thủ Rule 05: Trả về raw response, không chứa expect() bên trong.
 */
export class AD301API {
  /**
   * @param {import('../fixtures/baseTest.js').CustomApiClient | import('@playwright/test').APIRequestContext} request
   */
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  /**
   * Lấy chi tiết thông tin Agency (GET /agency/{id}/)
   */
  async getAgencyDetail(agencyId, { method = "GET", headers = {}, queryParams = {} } = {}) {
    const endpoint = this.baseUrl + ENDPOINTS.AGENCY.DETAIL(agencyId);
    return await this.request.fetch(endpoint, {
      method,
      headers,
      params: queryParams,
    });
  }

  /**
   * Cập nhật thông tin Agency (PATCH /agency/{id}/)
   */
  async updateAgency(agencyId, { method = "PATCH", payload = {}, headers = {} } = {}) {
    const endpoint = this.baseUrl + ENDPOINTS.AGENCY.UPDATE(agencyId);
    const options = {
      headers,
      data: payload,
    };

    const httpMethod = method.toUpperCase();
    switch (httpMethod) {
      case "PATCH":
        return await this.request.patch(endpoint, options);
      case "PUT":
        return await this.request.put(endpoint, options);
      case "POST":
        return await this.request.post(endpoint, options);
      default:
        return await this.request.fetch(endpoint, { ...options, method: httpMethod });
    }
  }

  /**
   * Xóa Agency (DELETE /agency/{id}/)
   */
  async deleteAgency(agencyId, { method = "DELETE", headers = {} } = {}) {
    const endpoint = this.baseUrl + ENDPOINTS.AGENCY.DELETE(agencyId);
    return await this.request.fetch(endpoint, {
      method,
      headers,
    });
  }

  /**
   * Xác thực link đổi email Owner (POST /agency/auth/verify-email-change/)
   */
  async verifyEmailChange({ payload = {}, headers = {} } = {}) {
    const endpoint = this.baseUrl + ENDPOINTS.AGENCY.VERIFY_EMAIL;
    return await this.request.post(endpoint, {
      headers,
      data: payload,
    });
  }
}

export { AD301API as AD301AgencyAPI };
