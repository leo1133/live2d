import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client cho AF300 (GET/PATCH/DELETE /gift/{gift_id}/)
 */
export class AF300API {
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  async getGiftDetail(id, { method = "GET", headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.DETAIL(id)}`;
    const m = method.toUpperCase();
    if (m === "POST") return this.request.post(url, { headers });
    return this.request.get(url, { headers });
  }

  async updateGift(id, { payload, headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.UPDATE(id)}`;
    return this.request.patch(url, { data: payload, headers });
  }

  async deleteGift(id, { headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.DELETE(id)}`;
    return this.request.delete(url, { headers });
  }

  async deleteCollection({ headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.GET_LIST}`;
    return this.request.delete(url, { headers });
  }
}

export { AF300API as AF300GiftDetailAPI };
