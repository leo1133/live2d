import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client cho AF100 (GET /gifts & PATCH /gifts/:id/status)
 */
export class AF100API {
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  async send(method, url, { payload, queryParams = {}, headers = {} } = {}) {
    const options = { headers, params: queryParams };
    if (payload !== undefined) options.data = payload;
    const m = method.toUpperCase();
    if (m === "GET") return this.request.get(url, options);
    if (m === "POST") return this.request.post(url, options);
    if (m === "PUT") return this.request.put(url, options);
    if (m === "PATCH") return this.request.patch(url, options);
    if (m === "DELETE") return this.request.delete(url, options);
    return this.request.fetch(url, { ...options, method: m });
  }

  async getGiftList({ method = "GET", queryParams = {}, headers = {}, rawQuery = "" } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.GET_LIST}${rawQuery}`;
    return this.send(method, url, { queryParams, headers });
  }

  async toggleGiftStatus(id, { method = "PATCH", payload, headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.TOGGLE_STATUS(id)}`;
    return this.send(method, url, { payload, headers });
  }
}

export { AF100API as AF100GiftListAPI };
