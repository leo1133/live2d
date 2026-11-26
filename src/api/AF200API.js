import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client cho AF200 (POST /gift/, POST /gift/category/, GET /gift/category/)
 */
export class AF200API {
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  async createGift({ payload, multipart, headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.CREATE}`;
    const options = { headers };
    if (multipart !== undefined) options.multipart = multipart;
    else if (payload !== undefined) options.data = payload;
    return this.request.post(url, options);
  }

  async createCategory({ payload, headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.CATEGORY_CREATE}`;
    return this.request.post(url, { data: payload, headers });
  }
}

export { AF200API as AF200GiftCreateAPI };
