import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client cho AF200 (POST /gifts & POST /gifts/upload-asset)
 */
export class AF200API {
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  async createGift({ method = "POST", payload, headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.CREATE}`;
    const options = { headers };
    if (payload !== undefined) options.data = payload;
    const m = method.toUpperCase();
    if (m === "POST") return this.request.post(url, options);
    return this.request.fetch(url, { ...options, method: m });
  }

  async uploadAsset({ multipart, data, headers = {} } = {}) {
    const url = `${this.baseUrl}${ENDPOINTS.GIFT.UPLOAD_ASSET}`;
    const options = { headers };
    if (multipart !== undefined) options.multipart = multipart;
    if (data !== undefined) options.data = data;
    return this.request.post(url, options);
  }
}

export { AF200API as AF200GiftCreateAPI };
