import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

export class GachaLimitedAPI {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   */
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  /**
   * Helper dispatch HTTP request
   */
  async _request(url, { method = "GET", queryParams = {}, headers = {}, data } = {}) {
    const options = {
      headers,
      params: queryParams,
    };
    if (data !== undefined) {
      options.data = data;
    }

    const httpMethod = method.toUpperCase();
    switch (httpMethod) {
      case "GET":
        return await this.request.get(url, options);
      case "POST":
        return await this.request.post(url, options);
      case "PUT":
        return await this.request.put(url, options);
      case "PATCH":
        return await this.request.patch(url, options);
      case "DELETE":
        return await this.request.delete(url, options);
      default:
        return await this.request.fetch(url, {
          ...options,
          method: httpMethod,
        });
    }
  }

  /**
   * Lấy chi tiết Limited Gacha Package theo modelId (mặc định type = 2)
   */
  async getPackageDetail({ modelId, queryParams = { type: 2 }, headers = {}, method = "GET", data } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GACHA_LIMITED.PACKAGE_DETAIL(modelId)}`;
    return await this._request(url, { method, queryParams, headers, data });
  }

  /**
   * Lấy danh sách Items của Package theo packageId
   */
  async getPackageItems({ packageId, queryParams = { page: 1, items_per_page: 10 }, headers = {}, method = "GET", data } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GACHA_LIMITED.PACKAGE_ITEMS(packageId)}`;
    return await this._request(url, { method, queryParams, headers, data });
  }

  /**
   * Cập nhật thông số Pity cho Package
   */
  async updatePity({ packageId, payload, headers = {}, method = "PATCH" } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GACHA_LIMITED.UPDATE_PITY(packageId)}`;
    return await this._request(url, { method, headers, data: payload });
  }

  /**
   * Cập nhật ảnh Banner cho Package
   */
  async updatePackageImage({ packageId, payload, headers = {}, method = "PATCH" } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GACHA_LIMITED.UPDATE_IMAGE(packageId)}`;
    return await this._request(url, { method, headers, data: payload });
  }

  /**
   * Lấy thông tin chi tiết của Item
   */
  async getItem({ itemId, headers = {}, method = "GET" } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GACHA_LIMITED.ITEM(itemId)}`;
    return await this._request(url, { method, headers });
  }

  /**
   * Cập nhật cấu hình của Item
   */
  async updateItem({ itemId, payload, headers = {}, method = "PATCH" } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GACHA_LIMITED.ITEM(itemId)}`;
    return await this._request(url, { method, headers, data: payload });
  }

  /**
   * Xóa Item khỏi Package
   */
  async deleteItem({ itemId, headers = {}, method = "DELETE" } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GACHA_LIMITED.ITEM(itemId)}`;
    return await this._request(url, { method, headers });
  }

  /**
   * Đăng ký mới Item vào Package
   */
  async createItem({ payload, headers = {}, method = "POST" } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GACHA_LIMITED.CREATE_ITEM}`;
    return await this._request(url, { method, headers, data: payload });
  }

  /**
   * Lấy danh sách Sub-model phục vụ chọn gacha item
   */
  async getSubModelList({ packageId, queryParams = { type: 2 }, headers = {}, method = "GET" } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GACHA_LIMITED.SUB_MODEL_LIST(packageId)}`;
    return await this._request(url, { method, queryParams, headers });
  }
}

