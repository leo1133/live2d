import { ENDPOINTS } from "../config/endpoint.js";

export class GachaAPI {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   */
  constructor(request) {
    this.request = request;
    const apiBaseUrl = process.env.API_BASE_URL || 'https://api-admin-dev.surrealdolls.com';
    this.gachaEndpoint = apiBaseUrl + ENDPOINTS.GACHA.GET_LIST;
  }

  /**
   * Gọi API Get List Gacha linh hoạt theo Method, Params và Headers
   */
  async getGachas({ method = "GET", queryParams = {}, headers = {} }) {
    const options = {
      headers,
      params: queryParams,
    };

    const httpMethod = method.toUpperCase();

    switch (httpMethod) {
      case "GET":
        return await this.request.get(this.gachaEndpoint, options);
      case "POST":
        return await this.request.post(this.gachaEndpoint, options);
      case "PUT":
        return await this.request.put(this.gachaEndpoint, options);
      case "DELETE":
        return await this.request.delete(this.gachaEndpoint, options);
      default:
        return await this.request.fetch(this.gachaEndpoint, {
          ...options,
          method: httpMethod,
        });
    }
  }
}
