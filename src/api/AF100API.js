import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client cho AF100 (GET /gift/, DELETE /gift/{gift_id}/, GET /gift/category/)
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

  async deleteGift(id, { method = "DELETE", headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.DELETE(id)}`;
    return this.send(method, url, { headers });
  }

  async getCategoryList({ method = "GET", headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.CATEGORY_LIST}`;
    return this.send(method, url, { headers });
  }
}

export { AF100API as AF100GiftListAPI };
