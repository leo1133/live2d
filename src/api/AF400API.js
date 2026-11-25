import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client cho AF400 (CRUD /gift-categories)
 */
export class AF400API {
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  async getCategories({ headers = {} } = {}) {
    return this.request.get(`${this.baseUrl}${ENDPOINTS.GIFT.CATEGORY_LIST}`, { headers });
  }

  async createCategory({ payload, headers = {} } = {}) {
    const options = { headers };
    if (payload !== undefined) options.data = payload;
    return this.request.post(`${this.baseUrl}${ENDPOINTS.GIFT.CATEGORY_CREATE}`, options);
  }

  async updateCategory(id, { payload, headers = {} } = {}) {
    const options = { headers };
    if (payload !== undefined) options.data = payload;
    return this.request.put(`${this.baseUrl}${ENDPOINTS.GIFT.CATEGORY_UPDATE(id)}`, options);
  }

  async deleteCategory(id, { headers = {} } = {}) {
    return this.request.delete(`${this.baseUrl}${ENDPOINTS.GIFT.CATEGORY_DELETE(id)}`, { headers });
  }

  async deleteCollection({ headers = {} } = {}) {
    return this.request.delete(`${this.baseUrl}${ENDPOINTS.GIFT.CATEGORY_LIST}`, { headers });
  }
}

export { AF400API as AF400CategoryAPI };
