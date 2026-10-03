# Surreal Dolls (Live2D Admin) - Automation Test Framework

Dự án kiểm thử tự động toàn diện (**UI**, **API**, **E2E**) cho hệ thống quản trị **Surreal Dolls Live2D Admin**, được xây dựng trên nền tảng **[Playwright](https://playwright.dev/)**.

---

## 📑 Mục lục

1. [Tổng quan kiến trúc](#-tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục & Giải thích chi tiết](#-cấu-trúc-thư-mục--giải-thích-chi-tiết)
3. [Cài đặt & Biến môi trường](#-cài-đặt--biến-môi-trường)
4. [Hướng dẫn chạy kiểm thử](#-hướng-dẫn-chạy-kiểm-thử)
5. [Cơ chế Data-Driven Testing (CSV)](#-cơ-chế-data-driven-testing-csv)
6. [Quản lý Token & Authentication Fixtures](#-quản-lý-token--authentication-fixtures)
7. [Quy chuẩn & Hướng dẫn mở rộng](#-quy-chuẩn--hướng-dẫn-mở-rộng)

---

## 🏛 Tổng quan kiến trúc

Dự án áp dụng các mô hình chuẩn trong kiểm thử tự động:

- **Page Object Model (POM)**: Tách biệt selector & hành vi UI khỏi mã kiểm thử.
- **API Object Model**: Đóng gói các HTTP endpoint thành các class service có thể tái sử dụng.
- **Custom Test Fixtures**: Tự động inject dependency (`loginPage`, `authAPI`, `authenticatedRequest`, `unauthenticatedRequest`, `db`).
- **Token Cache & Auto Refresh**: Lưu trữ token đăng nhập môi trường (`tests/auth/user_<env>.json`) và tự động thu hồi/cấp lại khi token hết hạn.
- **Data-Driven Testing (DDT)**: Kết hợp kiểm thử tham số hóa từ file CSV cho hàng trăm tổ hợp query params.

---

## 📂 Cấu trúc thư mục & Giải thích chi tiết

```text
live2d/
├── .env.dev                    # Biến môi trường cho môi trường Dev
├── .env.staging                # Biến môi trường cho môi trường Staging
├── package.json                # Danh sách dependencies và các scripts thực thi
├── playwright.config.js        # File cấu hình trung tâm của Playwright Test Runner
│
├── src/                        # Mã nguồn khung kiểm thử (Framework Source)
│   ├── api/                    # API Services Wrapper (API Object Model)
│   │   ├── AuthAPI.js          # Xử lý các endpoint xác thực (Login, Refresh Token)
│   │   ├── GachaAPI.js         # Xử lý các endpoint quản lý Gacha/Avatar
│   │   └── UserAPI.js          # Xử lý các endpoint quản lý người dùng (User List)
│   │
│   ├── config/                 # Cấu hình dự án & API Endpoints
│   │   └── endpoint.js         # Định nghĩa danh sách các URI Endpoints tập trung
│   │
│   ├── fixtures/               # Playwright Custom Fixtures
│   │   └── baseTest.js         # Khởi tạo custom test, token cache, authenticated/unauthenticated contexts & DB fixture
│   │
│   ├── pages/                  # Page Object Model (UI Pages)
│   │   ├── LoginPage.js        # Tương tác giao diện màn hình Đăng nhập (Sign-in)
│   │   ├── UserPage.js         # Tương tác giao diện màn hình Quản lý người dùng (User List)
│   │   └── GachaPage.js        # Tương tác giao diện màn hình Quản lý Gacha (Avatar List)
│   │
│   ├── test-data/              # Dữ liệu phục vụ kiểm thử (Test Data)
│   │   ├── index.js            # Barrel export giúp import dữ liệu tập trung
│   │   ├── commonApiData.js    # Dữ liệu chung cho API: tokens giả lập, generic accept/auth test cases, responses chuẩn
│   │   ├── loginData.js        # Dữ liệu kiểm thử đăng nhập (UI credentials, payloads, status expectations)
│   │   ├── userData.js         # Dữ liệu kiểm thử UI User (Selectors, labels, headers bảng, search cases)
│   │   ├── gachaData.js        # Dữ liệu kiểm thử UI Gacha (Selectors, bộ lọc, pagination regex)
│   │   ├── apiUserData.js      # Dữ liệu kiểm thử API User (Default params, error responses, schema expectations)
│   │   ├── apiGachaData.js     # Dữ liệu kiểm thử API Gacha (Filter params, error responses, schema expectations)
│   │   └── csv/                # Thư mục chứa file CSV cho Data-Driven Testing
│   │       ├── getListUser.csv # Bộ test cases tổ hợp query parameters cho API User List (128+ cases)
│   │       └── getListGacha.csv# Bộ test cases tổ hợp query parameters cho API Gacha List (40+ cases)
│   │
│   └── utils/                  # Thư viện tiện ích (Helpers & Constants)
│       ├── constants.js        # Các hằng số (HTTP_STATUS_CODE, METHODS, CONTENT_TYPE, độ dài chuỗi)
│       ├── csvHelper.js        # Parser đọc file CSV và chuyển đổi thành test cases data-driven
│       ├── db.helper.js        # Kết nối và truy vấn cơ sở dữ liệu PostgreSQL (`pg`)
│       └── helpers.js          # Hàm random chuỗi/email, sinh phương thức HTTP không hợp lệ
│
└── tests/                      # Kịch bản kiểm thử (Test Specs)
    ├── api/                    # Kiểm thử tầng API (API Integration Tests)
    │   ├── login.api.spec.js   # Test xác thực API (Status code, methods, headers, payload validation)
    │   ├── user.api.spec.js    # Test API User (Happy path, 405 methods, Accept/Auth headers, CSV Data-Driven)
    │   └── gacha.api.spec.js   # Test API Gacha (Happy path, 405 methods, Accept/Auth headers, CSV Data-Driven)
    │
    ├── auth/                   # Cache trạng thái xác thực
    │   └── user_dev.json       # Lưu trữ token truy cập tự động cho môi trường Dev
    │
    ├── e2e/                    # Kiểm thử End-to-End kết hợp UI + API
    │   ├── login.e2e.spec.js   # Kiểm tra luồng đăng nhập toàn diện giữa UI và phản hồi API
    │   ├── user.e2e.spec.js    # Kiểm tra tính đồng bộ dữ liệu (Total count, table data, filter) giữa UI và API
    │   └── gacha.e2e.spec.js   # Kiểm tra tính đồng bộ dữ liệu Gacha giữa UI và API
    │
    └── ui/                     # Kiểm thử giao diện người dùng (UI DOM / User Actions)
        ├── login.ui.spec.js    # Kiểm tra DOM form login, validate ký tự, validation messages
        ├── user.ui.spec.js     # Kiểm tra giao diện danh sách người dùng, bảng, bộ lọc, phân trang
        └── gacha.ui.spec.js    # Kiểm tra giao diện danh sách gacha, thao tác tìm kiếm, phân trang
```

---

## ⚙️ Cài đặt & Biến môi trường

### 1. Cài đặt dependencies

```bash
npm install
npx playwright install --with-deps chromium
```

### 2. Cấu hình biến môi trường

Tạo các file `.env.dev` hoặc `.env.staging` ở thư mục gốc:

```env
# URL Cấu hình
UI_BASE_URL=https://admin-dev.example.com
API_BASE_URL=https://api-admin-dev.example.com

# HTTP Basic Auth (nếu có popup bảo vệ browser)
BASIC_AUTH_USER=your_basic_auth_user
BASIC_AUTH_PASS=your_basic_auth_password

# Tài khoản Admin dùng để test
ADMIN_EMAIL=admin@example.com
ADMIN_ID=admin
ADMIN_PASSWORD=your_password
LOGIN_TYPE=1

# Kết nối Database (Tùy chọn cho DB Helper)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=live2d_db
```

---

## 🚀 Hướng dẫn chạy kiểm thử

### 1. Lệnh NPM Scripts có sẵn

| Lệnh                  | Ý nghĩa                                                      |
| :-------------------- | :----------------------------------------------------------- |
| `npm run test:dev`    | Chạy toàn bộ test suites trên môi trường **Dev**             |
| `npm run test:stg`    | Chạy toàn bộ test suites trên môi trường **Staging**         |
| `npm run test:ui:dev` | Mở giao diện tương tác **Playwright UI Mode** (Dev)          |
| `npm run test:ui:stg` | Mở giao diện tương tác **Playwright UI Mode** (Staging)      |
| `npm run report`      | Mở báo cáo kết quả kiểm thử HTML gần nhất                    |
| `npm run codegen:dev` | Mở công cụ Playwright Codegen để sinh mã selector UI tự động |

### 2. Chạy theo từng nhóm kiểm thử (CLI)

```bash
# Chạy riêng API Tests
ENV=dev npx playwright test tests/api/

# Chạy riêng UI Tests
ENV=dev npx playwright test tests/ui/

# Chạy riêng E2E Tests
ENV=dev npx playwright test tests/e2e/

# Chạy một file test cụ thể
ENV=dev npx playwright test tests/api/user.api.spec.js

# Chạy ở chế độ Debug (có UI từng bước)
ENV=dev npx playwright test tests/api/login.api.spec.js --debug
```

---

## 📊 Cơ chế Data-Driven Testing (CSV)

Các API phức tạp như lấy danh sách (`/api/v1/user/`, `/api/v1/model-gacha/`) có rất nhiều tổ hợp query parameters (phân trang, sắp xếp, lọc, validate kiểu dữ liệu, SQL Injection, XSS...).

Toàn bộ test matrix được lưu trữ dưới dạng bảng CSV trong [`src/test-data/csv/`](src/test-data/csv/):

- **`getListUser.csv`**: 128+ trường hợp kiểm thử cho danh sách User.
- **`getListGacha.csv`**: 41+ trường hợp kiểm thử cho danh sách Gacha.

Module [`src/utils/csvHelper.js`](src/utils/csvHelper.js) tự động:

1. Đọc và parse file CSV.
2. Ép kiểu dữ liệu tự động (`null`, số nguyên, chuỗi rỗng `<empty>`).
3. Chuyển đổi thành mảng test cases để thực thi vòng lặp `describe/test` trong Playwright.

---

## 🔐 Quản lý Token & Authentication Fixtures

Dự án áp dụng cơ chế quản lý Token tự động thông qua [`src/fixtures/baseTest.js`](src/fixtures/baseTest.js):

- **`authenticatedRequest`**:
  - Kiểm tra file cache `tests/auth/user_<env>.json`.
  - Nếu chưa có hoặc token hết hạn (nhận mã lỗi `401`/`403`), hệ thống tự động gọi API `/api/v1/auth/login/` lấy token mới và lưu vào file.
  - Tự động gắn header `Authorization: Bearer <token>` vào mọi request.
- **`unauthenticatedRequest`**:
  - Dùng cho các test case kiểm tra bảo mật (truyền token sai định dạng, token hết hạn, không truyền header Auth).
- **`loginPage` & `authAPI`**:
  - Được khởi tạo tự động sẵn trong context của test case.

---

## 📝 Quy chuẩn & Hướng dẫn mở rộng

### Thêm một trang UI mới:

1. Tạo Page Object trong `src/pages/MyNewPage.js`.
2. Tạo file Test Data trong `src/test-data/myNewData.js` và export qua `src/test-data/index.js`.
3. Viết kịch bản kiểm thử trong `tests/ui/myNewPage.ui.spec.js`.

### Thêm một API Service mới:

1. Khai báo endpoint trong `src/config/endpoint.js`.
2. Tạo API client trong `src/api/MyNewAPI.js`.
3. Tạo file Test Data trong `src/test-data/apiMyNewData.js` kế thừa từ `commonApiData.js`.
4. Viết kịch bản kiểm thử trong `tests/api/myNew.api.spec.js`.
