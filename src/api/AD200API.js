import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client đóng gói các thao tác gọi dịch vụ tạo mới Agency của màn hình AD200
 * Tuân thủ Rule 05: Trả về raw response, không chứa expect() bên trong.
 */
export class AD200API {
  /**
   * @param {import('../fixtures/baseTest.js').CustomApiClient | import('@playwright/test').APIRequestContext} request
   */
  constructor(request) {
    this.request = request;
    this.endpoint = getApiBaseUrl() + ENDPOINTS.AGENCY.CREATE;
  }

  /**
   * Gọi API tạo mới Agency (POST /agency/create/)
   * Hỗ trợ Method, Payload, QueryParams và Headers linh hoạt phục vụ 419 Viewpoints
   */
  async createAgency({
    method = "POST",
    payload = {},
    queryParams = {},
    headers = {},
    endpoint = this.endpoint,
  } = {}) {
    const options = {
      headers,
      params: queryParams,
    };

    if (payload !== undefined && payload !== null) {
      if (typeof payload === "string") {
        options.data = payload;
      } else {
        options.data = payload;
      }
    }

    const httpMethod = method.toUpperCase();

    switch (httpMethod) {
      case "POST":
        return await this.request.post(endpoint, options);
      case "GET":
        return await this.request.get(endpoint, options);
      case "PUT":
        return await this.request.put(endpoint, options);
      case "PATCH":
        return await this.request.patch(endpoint, options);
      case "DELETE":
        return await this.request.delete(endpoint, options);
      default:
        return await this.request.fetch(endpoint, {
          ...options,
          method: httpMethod,
        });
    }
  }
}

export { AD200API as AD200AgencyAPI };
