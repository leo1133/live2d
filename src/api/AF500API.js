import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client cho AF500 (GET/PUT /high-value-gift/config)
 */
export class AF500API {
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  async getConfig({ headers = {} } = {}) {
    return this.request.get(`${this.baseUrl}${ENDPOINTS.GIFT.HIGH_VALUE_CONFIG}`, { headers });
  }

  async updateConfig({ method = "PUT", payload, headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.HIGH_VALUE_CONFIG}`;
    const options = { headers };
    if (payload !== undefined) options.data = payload;
    if (method.toUpperCase() === "DELETE") return this.request.delete(url, options);
    return this.request.put(url, options);
  }
}

export { AF500API as AF500HighValueGiftAPI };
