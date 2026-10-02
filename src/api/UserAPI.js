import { ENDPOINTS } from "../config/endpoint.js";
export class UserAPI {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   */
  constructor(request) {
    this.request = request;
    const apiBaseUrl = process.env.API_BASE_URL || 'https://api-admin-dev.surrealdolls.com';
    this.userEndpoint = apiBaseUrl + ENDPOINTS.USER.GET_LIST;
  }

  /**
   * Gọi API Get List User linh hoạt theo Method, Params và Headers
   */
  async getUsers({ method = "GET", queryParams = {}, headers = {} }) {
    const options = {
      headers,
      params: queryParams,
    };

    const httpMethod = method.toUpperCase();

    switch (httpMethod) {
      case "GET":
        return await this.request.get(this.userEndpoint, options);
      case "POST":
        return await this.request.post(this.userEndpoint, options);
      case "PUT":
        return await this.request.put(this.userEndpoint, options);
      case "DELETE":
        return await this.request.delete(this.userEndpoint, options);
      default:
        return await this.request.fetch(this.userEndpoint, {
          ...options,
          method: httpMethod,
        });
    }
  }
}
