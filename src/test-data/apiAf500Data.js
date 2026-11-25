/**
 * API Test Data cho AF500 — animation_type trên POST /gift/, PATCH /gift/{id}/ & GET /gift/
 */
export const apiAf500Data = {
  createInvalidPriceCases: [
    { tcId: "[AF500-API-06]", vpId: "BIZ-02", title: "shutter giá 1000", animation_type: "shutter", price: 1000, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-07]", vpId: "BIZ-02", title: "shutter giá 3000", animation_type: "shutter", price: 3000, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-08]", vpId: "BIZ-02", title: "shutter giá 0", animation_type: "shutter", price: 0, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-13]", vpId: "BIZ-04", title: "continuous giá 500", animation_type: "continuous", price: 500, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-14]", vpId: "BIZ-04", title: "continuous giá 2000", animation_type: "continuous", price: 2000, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-18]", vpId: "ENUM-004", title: 'animation_type="special"', animation_type: "special", price: 1000, expectedStatus: [400, 422] },
    { tcId: "[AF500-API-19]", vpId: "ENUM-005", title: 'animation_type="SHUTTER"', animation_type: "SHUTTER", price: 5000, expectedStatus: [400, 422] },
  ],
  filterCases: [
    { tcId: "[AF500-API-20]", vpId: "ENUM-001", title: "GET /gift/?animation_type=normal", queryParams: { animation_type: "normal" }, expectedStatus: [200] },
    { tcId: "[AF500-API-21]", vpId: "ENUM-002", title: "GET /gift/?animation_type=shutter", queryParams: { animation_type: "shutter" }, expectedStatus: [200] },
    { tcId: "[AF500-API-22]", vpId: "ENUM-003", title: "GET /gift/?animation_type=continuous", queryParams: { animation_type: "continuous" }, expectedStatus: [200] },
    { tcId: "[AF500-API-23]", vpId: "RESP-001", title: "GET /gift/ mặc định (all)", queryParams: {}, expectedStatus: [200] },
    { tcId: "[AF500-API-24]", vpId: "ENUM-004", title: "GET /gift/?animation_type=abc ngoài enum", queryParams: { animation_type: "abc" }, expectedStatus: [400, 422] },
  ],
};
