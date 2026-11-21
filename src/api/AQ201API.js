import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

let cachedDiscoveredTarget = null;

export class AQ201API {
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

  /**
   * Tự động phát hiện ngẫu nhiên 1 bộ target (modelId, packageId, itemId) hợp lệ từ API
   * Tôn trọng biến ENV nếu được truyền, tự động shuffle ngẫu nhiên, và fallback an toàn nếu API lỗi.
   * @param {Object} [options]
   * @param {boolean} [options.random=true] Chọn ngẫu nhiên thay vì lấy phần tử đầu tiên
   * @param {boolean} [options.forceRefresh=false] Bỏ qua cache nội bộ
   * @returns {Promise<{ modelId: number, packageId: number, itemId: number }>}
   */
  async discoverRandomTarget({ random = true, forceRefresh = false } = {}) {
    if (!forceRefresh && cachedDiscoveredTarget) {
      return cachedDiscoveredTarget;
    }

    const envModel = process.env.LIMITED_GACHA_MODEL_ID ? Number(process.env.LIMITED_GACHA_MODEL_ID) : null;
    const envPackage = process.env.LIMITED_GACHA_PACKAGE_ID ? Number(process.env.LIMITED_GACHA_PACKAGE_ID) : null;
    const envItem = process.env.LIMITED_GACHA_ITEM_ID ? Number(process.env.LIMITED_GACHA_ITEM_ID) : null;

    // Nếu người dùng đã cung cấp đủ biến qua ENV thì dùng luôn
    if (envModel && envPackage && envItem) {
      cachedDiscoveredTarget = { modelId: envModel, packageId: envPackage, itemId: envItem };
      return cachedDiscoveredTarget;
    }

    try {
      // 1. Lấy danh sách Models từ API
      const gachaRes = await this._request(`${this.baseUrl}${ENDPOINTS.GACHA.GET_LIST}`, {
        queryParams: { page: 1, items_per_page: 50 },
      });

      if (gachaRes.status() === 200) {
        const gachaData = await gachaRes.json();
        let models = Array.isArray(gachaData.data) ? [...gachaData.data] : [];

        if (random && models.length > 1) {
          // Shuffle ngẫu nhiên danh sách model
          models.sort(() => Math.random() - 0.5);
        }

        // Nếu có envModel chỉ định thì ưu tiên model đó
        if (envModel) {
          const matched = models.find((m) => m.id === envModel);
          if (matched) {
            models = [matched, ...models.filter((m) => m.id !== envModel)];
          } else {
            models.unshift({ id: envModel });
          }
        }

        // 2. Tìm model có Package Limited (type = 2)
        for (const m of models) {
          const pkgRes = await this.getPackageDetail({
            modelId: m.id,
            queryParams: { type: 2 },
          });

          if (pkgRes.status() === 200) {
            const pkg = await pkgRes.json();
            const foundPackageId = pkg.id;

            // 3. Lấy danh sách items thuộc package
            const itemsRes = await this.getPackageItems({
              packageId: foundPackageId,
              queryParams: { page: 1, items_per_page: 50 },
            });

            let foundItemId = null;
            if (itemsRes.status() === 200) {
              const itemsData = await itemsRes.json();
              const items = Array.isArray(itemsData.data) ? itemsData.data : [];
              if (items.length > 0) {
                const picked = random
                  ? items[Math.floor(Math.random() * items.length)]
                  : items[0];
                foundItemId = picked.id;
              }
            }

            cachedDiscoveredTarget = {
              modelId: envModel || m.id,
              packageId: envPackage || foundPackageId,
              itemId: envItem || foundItemId || 133,
            };
            return cachedDiscoveredTarget;
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ [AQ201] Không thể phát hiện target ngẫu nhiên qua API, fallback về giá trị mặc định:", err.message);
    }

    // Fallback dự phòng nếu API không khả dụng
    cachedDiscoveredTarget = {
      modelId: envModel || 45,
      packageId: envPackage || 53,
      itemId: envItem || 133,
    };
    return cachedDiscoveredTarget;
  }
}

export { AQ201API as AQ201GachaLimitedAPI, AQ201API as GachaLimitedAPI };

