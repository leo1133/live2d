import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client cho AF400 (GET/POST/PUT/DELETE /gift/category/ & PUT /gift/category/sort-order/{category_id})
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
    return this.request.post(`${this.baseUrl}${ENDPOINTS.GIFT.CATEGORY_CREATE}`, { data: payload, headers });
  }

  async updateCategory(id, { payload, headers = {} } = {}) {
    return this.request.put(`${this.baseUrl}${ENDPOINTS.GIFT.CATEGORY_UPDATE(id)}`, { data: payload, headers });
  }

  async updateSortOrder(id, { payload, headers = {} } = {}) {
    return this.request.put(`${this.baseUrl}${ENDPOINTS.GIFT.CATEGORY_SORT_ORDER(id)}`, { data: payload, headers });
  }

  async deleteCategory(id, { headers = {} } = {}) {
    return this.request.delete(`${this.baseUrl}${ENDPOINTS.GIFT.CATEGORY_DELETE(id)}`, { headers });
  }

  async deleteCollection({ headers = {} } = {}) {
    return this.request.delete(`${this.baseUrl}${ENDPOINTS.GIFT.CATEGORY_LIST}`, { headers });
  }
}

export { AF400API as AF400CategoryAPI };
