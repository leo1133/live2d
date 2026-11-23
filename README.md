# Surreal Dolls (Live2D Admin) - Automation Test Framework

> Framework kiểm thử tự động toàn diện (**API**, **UI**, **E2E**) cho hệ thống quản trị **Surreal Dolls Live2D Admin**, xây dựng trên nền tảng **[Playwright](https://playwright.dev/)**.

---

## 📑 Mục lục
1. [Tổng quan dự án](#-1-tổng-quan-dự-án)
2. [Hướng dẫn thiết lập môi trường (Setup Guide)](#-2-hướng-dẫn-thiết-lập-môi-trường-setup-guide)
3. [Cấu trúc Framework & Quy chuẩn đặt tên](#-3-cấu-trúc-framework--quy-chuẩn-đặt-tên)
4. [Cẩm nang chạy Kiểm thử (Execution Guide)](#-4-cẩm-nang-chạy-kiểm-thử-execution-guide)
5. [Hướng dẫn thêm Màn hình / Test Case mới](#-5-hướng-dẫn-thêm-màn-hình--test-case-mới)
6. [Báo cáo & CI/CD Pipeline](#-6-báo-cáo--cicd-pipeline)

---

## 🎯 1. Tổng quan dự án

Dự án áp dụng mô hình kiểm thử tự động đa tầng:
- **API Testing**: Kiểm thử độc lập từng endpoint (Status code, Schema, Boundary values, Data-driven qua file CSV). Chạy song song tốc độ cao.
- **UI Testing**: Kiểm thử giao diện và tương tác người dùng theo mô hình **Page Object Model (POM)**.
- **E2E Testing**: Kiểm thử luồng tích hợp toàn trình, đối chiếu tính đồng bộ dữ liệu giữa UI, API và Database (PostgreSQL).
- **Cơ chế tối ưu hóa tự động**:
  - **Auto Auth / Token Cache**: Tự động quản lý JWT token và phiên đăng nhập UI. Bỏ qua bước login form khi session còn hạn (< 100ms).
  - **Dynamic Data Discovery**: Custom fixture `discovery` tự động bốc ngẫu nhiên Target IDs hợp lệ (User, Agency, Gacha...) từ API phục vụ các bài test Detail/Update mà không cần hardcode ID.
  - **Dynamic Sync**: Đồng bộ 100% bằng sự kiện mạng (`waitForResponse`), loại bỏ hoàn toàn `sleep/waitForTimeout` gây flaky.
  - **DB Auto-Skip**: Tự động bỏ qua các bài test đối chiếu DB nếu môi trường cục bộ chưa bật database, không làm gián đoạn suite test.

---

## ⚡ 2. Hướng dẫn thiết lập môi trường (Setup Guide)

### Bước 1: Yêu cầu môi trường
- **Node.js**: Phiên bản `>= 18.x` (khuyến nghị Node 20 LTS).

### Bước 2: Cài đặt Dependencies & Trình duyệt
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
# 1. Cài đặt các gói thư viện
npm install

# 2. Cài đặt trình duyệt Chromium cho Playwright
npx playwright install --with-deps chromium
```

### Bước 3: Cấu hình biến môi trường
Tạo file cấu hình cá nhân từ file mẫu:
```bash
cp .env.example .env.dev
```
Mở file `.env.dev` và điền thông tin tài khoản được cấp:
- `UI_BASE_URL` / `API_BASE_URL`: Địa chỉ web và backend môi trường test.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: Tài khoản Admin dùng để test.
- `BASIC_AUTH_USER` / `BASIC_AUTH_PASS`: (Nếu server yêu cầu Basic Auth popup).

### Bước 4: Chạy thử bài test đầu tiên
Kiểm tra môi trường đã sẵn sàng chưa bằng lệnh:
```bash
npm run test:aa000
```
> 🎉 Nếu test case Đăng nhập (AA000) chạy thành công, môi trường của bạn đã hoàn tất thiết lập!

---

## 📂 3. Cấu trúc Framework & Quy chuẩn đặt tên

Dự án quy ước tổ chức mã nguồn theo **Mã màn hình (Screen Code)** (ví dụ: `aa000` = Login, `ad100` = User Management, `ad301` = Gacha...).

```text
live2d/
├── src/                              # Framework Core & Page Objects
│   ├── api/                          # [API Object Model] Xử lý gọi API HTTP
│   │   └── <ScreenCode>API.js        # Ví dụ: AA000API.js, AD100API.js
│   ├── pages/                        # [Page Object Model] Chứa selector & hành động UI
│   │   └── <ScreenCode>Page.js       # Ví dụ: AA000Page.js, AD100Page.js
│   ├── fixtures/                     # Custom test fixtures (tự động inject auth, page, db)
│   │   └── baseTest.js
│   ├── test-data/                    # Dữ liệu kiểm thử
│   │   ├── <screenCode>Data.js       # Dữ liệu tĩnh, payload mẫu, selector config
│   │   └── csv/                      # File CSV phục vụ Data-Driven Testing (nếu có)
│   └── utils/                        # Thư viện dùng chung: dataDiscovery.js, db.helper.js, csvHelper.js, constants.js
│
├── tests/                            # Kịch bản kiểm thử (Test Suites)
│   ├── auth/                         # Setup project khởi tạo session đăng nhập ban đầu
│   ├── api/                          # Kiểm thử tầng API (<screencode>.api.spec.js)
│   ├── ui/                           # Kiểm thử giao diện (<screencode>.ui.spec.js)
│   └── e2e/                          # Kiểm thử tích hợp UI + API (<screencode>.e2e.spec.js)
│
├── .env.dev / .env.staging           # File cấu hình biến môi trường
├── playwright.config.js              # Cấu hình Playwright Runner (timeout, workers, retries)
└── package.json                      # Các câu lệnh thực thi nhanh (NPM Scripts)
```

---

## 🚀 4. Cẩm nang chạy Kiểm thử (Execution Guide)

Mọi lệnh thực thi đều tuân theo chuẩn NPM Scripts trong `package.json`:

### 1. Các lệnh phổ biến nhất hàng ngày

| Nhu cầu kiểm thử | Câu lệnh NPM | Ghi chú |
| :--- | :--- | :--- |
| **Chạy toàn bộ test (Dev)** | `npm run test:dev` | Chạy headless toàn bộ test suites |
| **Chạy toàn bộ test (Staging)** | `npm run test:stg` | Chạy trên môi trường Staging |
| **Mở giao diện trực quan (UI Mode)** | `npm run test:ui:dev` | **Khuyên dùng khi debug**: Xem live từng bước, timeline, time-travel |
| **Xem báo cáo HTML gần nhất** | `npm run report` | Mở Playwright HTML Report trên trình duyệt |
| **Bật công cụ bắt Locator (Codegen)**| `npm run codegen:dev` | Mở browser tự động sinh mã code khi click chuột |

### 2. Chạy theo từng Màn hình / Chức năng (`<screen_code>`)

Quy ước lệnh chạy theo mã màn hình rất đơn giản:

```bash
# Chạy tất cả các tầng (UI + API + E2E) của 1 màn hình
npm run test:<screencode>          # Ví dụ: npm run test:ad100

# Chạy riêng từng tầng cụ thể của màn hình đó
npm run test:<screencode>:ui       # Ví dụ: npm run test:ad100:ui
npm run test:<screencode>:api      # Ví dụ: npm run test:ad100:api
npm run test:<screencode>:e2e      # Ví dụ: npm run test:ad100:e2e
```

### 3. Lệnh nâng cao qua Playwright CLI

```bash
# Chạy 1 file test bất kỳ
ENV=dev npx playwright test tests/ui/ad100.ui.spec.js

# Chạy chế độ hiện trình duyệt thực tế (Headed)
ENV=dev npx playwright test tests/ui/ad100.ui.spec.js --headed

# Chạy chế độ Debug (dừng tại breakpoint và xem từng hành động)
ENV=dev npx playwright test tests/ui/ad100.ui.spec.js --debug
```

---

## 📝 5. Hướng dẫn thêm Màn hình / Test Case mới

Khi bạn được phân công viết test cho một màn hình mới (ví dụ có mã `XX999`):

### Bước 1: Tạo Page Object và/hoặc API Client
- **Nếu có UI**: Tạo `src/pages/XX999Page.js` kế thừa locator và thao tác của màn hình.
- **Nếu có API**: Tạo `src/api/XX999API.js` khai báo các phương thức gọi endpoint.

### Bước 2: Tạo Test Data
- Tạo `src/test-data/xx999Data.js` chứa selector, dữ liệu test, thông báo lỗi kỳ vọng.
- Export trong `src/test-data/index.js` để tiện import ở mọi nơi.

### Bước 3: Viết Kịch bản Kiểm thử
Tạo file test trong thư mục tương ứng (`tests/ui/`, `tests/api/`, hoặc `tests/e2e/`):
```javascript
// tests/ui/xx999.ui.spec.js
import { test, expect } from '../../src/fixtures/baseTest.js';
import { XX999Page } from '../../src/pages/XX999Page.js';

test.describe('XX999 - Feature Title', () => {
  test('TC01 - Verify basic element display', async ({ page, discovery }) => {
    // Tự động bốc ngẫu nhiên ID/entity từ hệ thống nếu cần test màn hình Detail/Edit
    // const randomEntity = await discovery.getRandomEntity({ endpoint: '/api/v1/xx999/' });
    const xx999Page = new XX999Page(page);
    await xx999Page.navigate();
    // Viết các assertions tại đây...
  });
});
```

### Bước 4: (Tùy chọn) Thêm shortcut vào `package.json`
Thêm script vào `package.json` để bạn và đồng đội chạy nhanh:
```json
"test:xx999": "ENV=dev npx playwright test tests/**/xx999.*.spec.js"
```

---

## 🔄 6. Báo cáo & CI/CD Pipeline

Dự án đã tích hợp sẵn quy trình kiểm thử tự động liên tục:

- **GitHub Actions Pipeline**:
  - Tự động chạy kiểm thử mỗi khi bạn mở **Pull Request** hoặc **Push** code vào nhánh chính.
  - Tích hợp **Pre-flight Health Check** (ngắt ngay nếu backend sập để tránh tốn runner).
  - Tự động xuất bản báo cáo trực quan lên: **[GitHub Pages Report](https://leo1133.github.io/live2d/)**.
- **Jenkins Pipeline**:
  - Dành cho môi trường nội bộ / self-hosted qua [Jenkinsfile](Jenkinsfile).
  - Tự động lưu trữ báo cáo **Playwright HTML Report** cho từng lượt build.
