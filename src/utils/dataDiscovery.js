import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";
import { HTTP_STATUS_CODE, METHODS } from "./constants.js";
import { apiGachaLimitedData } from "../test-data/apiAq201Data.js";

/**
 * Giá trị ID fallback mặc định khi không tìm thấy entity nào và không truyền fallback cụ thể
 */
const DEFAULT_FALLBACK_ID = 1;

/**
 * Phân trang mặc định khi gọi API khám phá dữ liệu (lấy kích thước đủ lớn để bốc ngẫu nhiên)
 */
const DEFAULT_PAGING_PARAMS = Object.freeze({
  page: 1,
  items_per_page: 50,
});

/**
 * Định danh cache cho các target đặc thù
 */
const CACHE_KEYS = Object.freeze({
  LIMITED_GACHA_TARGET: "target:limited_gacha",
});

/**
 * Bộ nhớ đệm cấp Worker (RAM) giúp tránh gọi API lặp lại trong cùng tiến trình test
 */
const discoveryMemoryCache = new Map();

/**
 * Helper dùng chung để tự động khám phá và bốc ngẫu nhiên Test Data / Target IDs từ hệ thống
 * Phục vụ cho các kịch bản kiểm thử Detail, Update, Delete, E2E mà không cần hardcode ID.
 */
export class DataDiscovery {
  /**
   * @param {import('../fixtures/baseTest.js').CustomApiClient | import('@playwright/test').APIRequestContext} request
   */
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  /**
   * Xóa toàn bộ bộ nhớ đệm khám phá dữ liệu (nếu cần làm mới giữa các test suite)
   */
  static clearCache() {
    discoveryMemoryCache.clear();
  }

  /**
   * Helper dispatch HTTP request an toàn
   */
  async _sendRequest(url, { method = METHODS.GET, queryParams = {}, headers = {}, data } = {}) {
    const options = {
      headers,
      params: queryParams,
    };
    if (data !== undefined && data !== null) {
      options.data = data;
    }

    const httpMethod = method.toUpperCase();
    switch (httpMethod) {
      case METHODS.GET:
        return await this.request.get(url, options);
      case METHODS.POST:
        return await this.request.post(url, options);
      case METHODS.PUT:
        return await this.request.put(url, options);
      case METHODS.PATCH:
        return await this.request.patch(url, options);
      case METHODS.DELETE:
        return await this.request.delete(url, options);
      default:
        return await this.request.fetch(url, {
          ...options,
          method: httpMethod,
        });
    }
  }

  /**
   * Lấy danh sách entities từ endpoint bất kỳ (có cache theo worker)
   */
  async fetchEntityList({
    endpoint,
    method = METHODS.GET,
    queryParams = DEFAULT_PAGING_PARAMS,
    payload = null,
    headers = {},
    forceRefresh = false,
  } = {}) {
    const fullUrl = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    const cacheKey = `${method}:${fullUrl}:${JSON.stringify(queryParams)}:${JSON.stringify(payload)}`;

    if (!forceRefresh && discoveryMemoryCache.has(cacheKey)) {
      return discoveryMemoryCache.get(cacheKey);
    }

    try {
      const response = await this._sendRequest(fullUrl, {
        method,
        queryParams,
        headers,
        data: payload,
      });

      if (response.status() === HTTP_STATUS_CODE.OK) {
        const body = await response.json();
        let items = [];

        if (Array.isArray(body)) {
          items = body;
        } else if (Array.isArray(body.data)) {
          items = body.data;
        } else if (Array.isArray(body.items)) {
          items = body.items;
        }

        discoveryMemoryCache.set(cacheKey, items);
        return items;
      }
    } catch (error) {
      console.warn(`⚠️ [DataDiscovery] Lỗi khi gọi ${method} ${fullUrl}:`, error.message);
    }

    return [];
  }

  /**
   * Bốc ngẫu nhiên 1 entity từ danh sách của endpoint bất kỳ
   */
  async getRandomEntity({
    endpoint,
    method = METHODS.GET,
    queryParams = DEFAULT_PAGING_PARAMS,
    payload = null,
    headers = {},
    filterFn = null,
    fallback = { id: DEFAULT_FALLBACK_ID },
    random = true,
    forceRefresh = false,
  } = {}) {
    const items = await this.fetchEntityList({
      endpoint,
      method,
      queryParams,
      payload,
      headers,
      forceRefresh,
    });

    let candidates = filterFn ? items.filter(filterFn) : [...items];

    if (candidates.length > 0) {
      if (random && candidates.length > 1) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        return candidates[randomIndex];
      }
      return candidates[0];
    }

    return fallback;
  }

  /**
   * Tiện ích bốc ngẫu nhiên ID
   */
  async getRandomId(options = {}) {
    const entity = await this.getRandomEntity(options);
    return entity?.id ?? (options.fallback?.id || DEFAULT_FALLBACK_ID);
  }

  // =========================================================================
  // DOMAIN-SPECIFIC SHORTCUTS
  // =========================================================================

  /**
   * Bốc ngẫu nhiên 1 User hợp lệ (Màn hình AD100 / User Management)
   */
  async getRandomUser({ random = true, fallbackId = DEFAULT_FALLBACK_ID, forceRefresh = false } = {}) {
    const envOverride = process.env.TARGET_USER_ID || process.env.USER_ID;
    if (envOverride) return { id: Number(envOverride) };

    return await this.getRandomEntity({
      endpoint: ENDPOINTS.USER.GET_LIST,
      method: METHODS.GET,
      queryParams: DEFAULT_PAGING_PARAMS,
      fallback: { id: fallbackId },
      random,
      forceRefresh,
    });
  }

  /**
   * Bốc ngẫu nhiên 1 Agency hợp lệ (Màn hình AD100/AD301 / Agency Management)
   */
  async getRandomAgency({ random = true, fallbackId = DEFAULT_FALLBACK_ID, forceRefresh = false } = {}) {
    const envOverride = process.env.TARGET_AGENCY_ID || process.env.AGENCY_ID;
    if (envOverride) return { id: Number(envOverride) };

    return await this.getRandomEntity({
      endpoint: ENDPOINTS.AGENCY.GET_LIST,
      method: METHODS.POST,
      payload: DEFAULT_PAGING_PARAMS,
      fallback: { id: fallbackId },
      random,
      forceRefresh,
    });
  }

  /**
   * Bốc ngẫu nhiên 1 Model 3D Gacha (Màn hình AQ100 / Gacha List)
   */
  async getRandomGachaModel({
    random = true,
    fallbackId = apiGachaLimitedData.defaultModelId,
    forceRefresh = false,
  } = {}) {
    const envOverride = process.env.TARGET_MODEL_ID || process.env.MODEL_ID;
    if (envOverride) return { id: Number(envOverride) };

    return await this.getRandomEntity({
      endpoint: ENDPOINTS.GACHA.GET_LIST,
      method: METHODS.GET,
      queryParams: DEFAULT_PAGING_PARAMS,
      fallback: { id: fallbackId },
      random,
      forceRefresh,
    });
  }

  /**
   * Bốc ngẫu nhiên 1 bộ target Gacha Limited gồm: modelId, packageId, itemId (Màn hình AQ201)
   */
  async getRandomLimitedGachaTarget({ random = true, forceRefresh = false } = {}) {
    const cacheKey = CACHE_KEYS.LIMITED_GACHA_TARGET;
    if (!forceRefresh && discoveryMemoryCache.has(cacheKey)) {
      return discoveryMemoryCache.get(cacheKey);
    }

    const envModel = process.env.LIMITED_GACHA_MODEL_ID ? Number(process.env.LIMITED_GACHA_MODEL_ID) : null;
    const envPackage = process.env.LIMITED_GACHA_PACKAGE_ID ? Number(process.env.LIMITED_GACHA_PACKAGE_ID) : null;
    const envItem = process.env.LIMITED_GACHA_ITEM_ID ? Number(process.env.LIMITED_GACHA_ITEM_ID) : null;

    if (envModel && envPackage && envItem) {
      const result = { modelId: envModel, packageId: envPackage, itemId: envItem };
      discoveryMemoryCache.set(cacheKey, result);
      return result;
    }

    try {
      const models = await this.fetchEntityList({
        endpoint: ENDPOINTS.GACHA.GET_LIST,
        method: METHODS.GET,
        queryParams: DEFAULT_PAGING_PARAMS,
        forceRefresh,
      });

      let modelCandidates = [...models];
      if (random && modelCandidates.length > 1) {
        modelCandidates.sort(() => Math.random() - 0.5);
      }

      if (envModel) {
        const matched = modelCandidates.find((m) => m.id === envModel);
        if (matched) {
          modelCandidates = [matched, ...modelCandidates.filter((m) => m.id !== envModel)];
        } else {
          modelCandidates.unshift({ id: envModel });
        }
      }

      for (const m of modelCandidates) {
        const pkgUrl = `${this.baseUrl}${ENDPOINTS.GACHA_LIMITED.PACKAGE_DETAIL(m.id)}`;
        const pkgRes = await this._sendRequest(pkgUrl, {
          method: METHODS.GET,
          queryParams: { type: apiGachaLimitedData.packageTypes.LIMITED },
        });

        if (pkgRes.status() === HTTP_STATUS_CODE.OK) {
          const pkg = await pkgRes.json();
          const foundPackageId = pkg.id;

          const itemsUrl = `${this.baseUrl}${ENDPOINTS.GACHA_LIMITED.PACKAGE_ITEMS(foundPackageId)}`;
          const itemsRes = await this._sendRequest(itemsUrl, {
            method: METHODS.GET,
            queryParams: DEFAULT_PAGING_PARAMS,
          });

          let foundItemId = null;
          if (itemsRes.status() === HTTP_STATUS_CODE.OK) {
            const itemsData = await itemsRes.json();
            const items = Array.isArray(itemsData.data) ? itemsData.data : [];
            if (items.length > 0) {
              const picked = random
                ? items[Math.floor(Math.random() * items.length)]
                : items[0];
              foundItemId = picked.id;
              const targetResult = {
                modelId: envModel || m.id,
                packageId: envPackage || foundPackageId,
                itemId: envItem || foundItemId,
              };
              discoveryMemoryCache.set(cacheKey, targetResult);
              return targetResult;
            }
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ [DataDiscovery] Lỗi phát hiện target Limited Gacha ngẫu nhiên:", err.message);
    }

    const fallbackResult = {
      modelId: envModel || apiGachaLimitedData.defaultModelId,
      packageId: envPackage || apiGachaLimitedData.defaultPackageId,
      itemId: envItem || apiGachaLimitedData.defaultItemId,
    };
    discoveryMemoryCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }
}
