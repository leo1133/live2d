import { HTTP_STATUS_CODE } from '../utils/constants.js';
import { ENDPOINTS, getApiBaseUrl } from '../config/endpoint.js';

export class AuthAPI {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   */
  constructor(request) {
    this.request = request;
    this.apiBaseUrl = getApiBaseUrl();
    this.loginEndpoint = `${this.apiBaseUrl}${ENDPOINTS.AUTH.LOGIN}`;
    this.refreshEndpoint = `${this.apiBaseUrl}${ENDPOINTS.AUTH.REFRESH_TOKEN}`;
  }

  getHeaders() {
    return { 'Accept': 'application/json' };
  }

  /**
   * Gọi API Login (POST)
   * @param {Object} payload - Thông tin credentials
   * @param {Object} [customHeaders] - Header tuỳ chỉnh (nếu có)
   */
  async login(payload, customHeaders) {
    const headers = customHeaders !== undefined
      ? { ...this.getHeaders(), ...customHeaders }
      : this.getHeaders();

    return await this.request.post(this.loginEndpoint, { data: payload, headers });
  }

  /**
   * Gọi API Login với HTTP Method không hợp lệ (test 405)
   * @param {string} method - 'GET' | 'PUT' | 'PATCH' | 'DELETE'
   */
  async loginWithMethod(method) {
    const headers = this.getHeaders();
    const httpMethod = method.toUpperCase();

    switch (httpMethod) {
      case 'GET':
        return await this.request.get(this.loginEndpoint, { headers });
      case 'PUT':
        return await this.request.put(this.loginEndpoint, { headers });
      case 'PATCH':
        return await this.request.patch(this.loginEndpoint, { headers });
      case 'DELETE':
        return await this.request.delete(this.loginEndpoint, { headers });
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}
