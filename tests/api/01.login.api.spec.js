import { test, expect } from '../../src/fixtures/baseTest.js';
import { loginData, invalidContentTypePayloads, missingFieldCases, invalidValueCases, headerTestCases } from '../../src/test-data/loginData.js';
import { generateRandomString, generateRandomEmail, generateOtherMethodNotChoose } from '../../src/utils/helpers.js';
import { METHODS, HTTP_STATUS_CODE } from '../../src/utils/constants.js';

/**
 * API LOGIN SUITE
 * Case 14 - 44: Chỉ gọi HTTP requests, không mở browser
 * Không cần loginPage
 */
test.describe('API Login Suite: Kiểm tra Server & Security', () => {

  test('Case 19: Login thành công với credentials hợp lệ', async ({ authAPI }) => {
    const response = await authAPI.login(loginData.apiCredentials);
    const { status, contentType, body: expectedBody } = loginData.expectedResponses.success;

    expect(response.status()).toBe(status);
    expect(response.headers()['content-type']).toContain(contentType);

    const body = await response.json();
    expect(body.access_token).toBeDefined();
    expect(typeof body.access_token).toBe(expectedBody.access_token);
    expect(body.access_token).not.toBe('');

    expect(body.refresh_token).toBeDefined();
    expect(typeof body.refresh_token).toBe(expectedBody.refresh_token);

    expect(body.firebase_access_token).toBeDefined();
    expect(typeof body.firebase_access_token).toBe(expectedBody.firebase_access_token);

    expect(typeof body.is_agency).toBe(expectedBody.is_agency);
    expect(body.is_agency).toBe(false);
  });

  test('Case 20: Login thất bại với sai password', async ({ authAPI }) => {
    const response = await authAPI.login({
      ...loginData.apiCredentials,
      password: generateRandomString(10, true, true),
    });
    const { status, contentType, body: expectedBody } = loginData.expectedResponses.unauthorized;
    expect(response.status()).toBe(status);
    expect(response.headers()['content-type']).toContain(contentType);

    const body = await response.json();
    expect(body).toEqual(expectedBody);
  });

  test('Case 21: Login thất bại với sai tài khoản (email)', async ({ authAPI }) => {
    const response = await authAPI.login({
      ...loginData.apiCredentials,
      email_user_id: generateRandomEmail(true),
    });
    const { status, contentType, body: expectedBody } = loginData.expectedResponses.unauthorized;
    expect(response.status()).toBe(status);
    expect(response.headers()['content-type']).toContain(contentType);

    const body = await response.json();
    expect(body).toEqual(expectedBody);
  });

  const invalidMethods = generateOtherMethodNotChoose(METHODS.POST);

  invalidMethods.forEach((method, index) => {
    test(`Case ${22 + index}: Login từ chối phương thức ${method}`, async ({ authAPI }) => {
      const response = await authAPI.loginWithMethod(method);
      const { status, contentType, body: expectedBody } = loginData.expectedResponses.invalidMethod;

      expect(response.status()).toBe(status);
      expect(response.headers()['content-type']).toContain(contentType);

      const body = await response.json();
      expect(body.detail).toBe(expectedBody.detail);
    });
  });

  invalidContentTypePayloads.forEach(({ type, payload }, index) => {
    test(`Case ${26 + index}: Login thất bại - Sai Content-Type: ${type}`, async ({ authAPI }) => {
      const response = await authAPI.login(payload, { 'Content-Type': type });
      const { status, contentType } = loginData.expectedResponses.invalidBodyFormat;

      expect(response.status()).toBe(status);
      expect(response.headers()['content-type']).toContain(contentType);

      const body = await response.json();
      expect(body).toHaveProperty('detail');
    });
  });

  test('Case 29: Login thất bại khi thiếu tất cả fields', async ({ authAPI }) => {
    const response = await authAPI.login({});
    const { status, detail } = loginData.expectedResponses.missingAllFields;

    expect(response.status()).toBe(status);

    const body = await response.json();
    expect(body.detail).toEqual(
      expect.arrayContaining([
        expect.objectContaining(detail[0]),
        expect.objectContaining(detail[1]),
      ])
    );
  });

  missingFieldCases.forEach(({ field, title, expectedStatus, isOptional }, index) => {
    test(`Case ${30 + index}: ${title}`, async ({ authAPI }) => {
      const { [field]: omitted, ...payloadWithoutField } = loginData.apiCredentials;
      const response = await authAPI.login(payloadWithoutField);

      expect(response.status()).toBe(expectedStatus);

      if (!isOptional) {
        await expect(response.json()).resolves.toMatchObject({
          detail: [{ type: 'missing', loc: ['body', field] }],
        });
      }
    });
  });

  invalidValueCases.forEach(({ title, override, expectedStatus }, index) => {
    test(`Case ${33 + index}: ${title}`, async ({ authAPI }) => {
      const payload = { ...loginData.apiCredentials, ...override };
      const response = await authAPI.login(payload);

      expect(response.status()).toBe(expectedStatus);
    });
  });

  headerTestCases.forEach(({ title, headers, expectedStatus }, index) => {
    test(`Case ${42 + index}: Header test - ${title}`, async ({ authAPI }) => {
      const response = await authAPI.login(loginData.apiCredentials, headers);
      expect(response.status()).toBe(expectedStatus);
    });
  });

});