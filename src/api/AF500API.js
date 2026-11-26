import { ENDPOINTS, getApiBaseUrl } from "../config/endpoint.js";

/**
 * API Client cho AF500 (animation_type trên POST /gift/, PATCH /gift/{id}/, GET /gift/)
 */
export class AF500API {
  constructor(request) {
    this.request = request;
    this.baseUrl = getApiBaseUrl();
  }

  async createGift({ payload, headers = {} } = {}) {
    return this.request.post(`${this.baseUrl}${ENDPOINTS.GIFT.CREATE}`, { data: payload, headers });
  }

  async getGiftList({ queryParams = {}, headers = {} } = {}) {
    return this.request.get(`${this.baseUrl}${ENDPOINTS.GIFT.GET_LIST}`, { params: queryParams, headers });
  }

  async updateGift(id, { payload, headers = {} } = {}) {
    return this.request.patch(`${this.baseUrl}${ENDPOINTS.GIFT.UPDATE(id)}`, { data: payload, headers });
  }
}

export { AF500API as AF500AnimationTypeAPI };
