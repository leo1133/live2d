import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client cho AF300 (GET/PUT/PATCH/DELETE /gifts/:id)
 */
export class AF300API {
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  async getGiftDetail(id, { headers = {} } = {}) {
    return this.request.get(`${this.baseUrl}${ENDPOINTS.GIFT.DETAIL(id)}`, { headers });
  }

  async updateGift(id, { method = "PUT", payload, headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.UPDATE(id)}`;
    const options = { headers };
    if (payload !== undefined) options.data = payload;
    return method.toUpperCase() === "PATCH"
      ? this.request.patch(url, options)
      : this.request.put(url, options);
  }

  async deleteGift(id, { headers = {} } = {}) {
    return this.request.delete(`${this.baseUrl}${ENDPOINTS.GIFT.DELETE(id)}`, { headers });
  }

  async deleteCollection({ headers = {} } = {}) {
    return this.request.delete(`${this.baseUrl}${ENDPOINTS.GIFT.GET_LIST}`, { headers });
  }
}

export { AF300API as AF300GiftDetailAPI };
