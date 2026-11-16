import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client đóng gói các thao tác gọi dịch vụ danh sách Liver của màn hình AD302
 * Hỗ trợ GET /agency/list/{agency_id} & POST /agency/{agency_id}/user/{user_id}
 * Tuân thủ Rule 05: Trả về raw response, không chứa expect() bên trong.
 */
export class AD302API {
  /**
   * @param {import('../fixtures/baseTest.js').CustomApiClient | import('@playwright/test').APIRequestContext} request
   */
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  /**
   * Lấy danh sách streamer trực thuộc Agency (GET /agency/list/{agency_id})
   */
  async getLiverList(agencyId, { method = "GET", queryParams = {}, headers = {} } = {}) {
    const endpoint = this.baseUrl + ENDPOINTS.AGENCY.LIVER_LIST(agencyId);
    return await this.request.fetch(endpoint, {
      method,
      params: queryParams,
      headers,
    });
  }

  /**
   * Phê duyệt gia nhập / rời Agency của Streamer (POST /agency/{agency_id}/user/{user_id})
   */
  async approveUser(agencyId, userId, { method = "POST", payload = {}, headers = {} } = {}) {
    const endpoint = this.baseUrl + ENDPOINTS.AGENCY.USER_APPROVE(agencyId, userId);
    return await this.request.post(endpoint, {
      headers,
      data: payload,
    });
  }
}

export { AD302API as AD302AgencyAPI };
