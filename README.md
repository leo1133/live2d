# Surreal Dolls (Live2D Admin) - Automation Test Framework

Dự án kiểm thử tự động toàn diện (**UI**, **API**, **E2E**) cho hệ thống quản trị **Surreal Dolls Live2D Admin**, được xây dựng trên nền tảng **[Playwright](https://playwright.dev/)**.

---

## 📑 Mục lục

1. [Tổng quan kiến trúc](#-tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục & Giải thích chi tiết](#-cấu-trúc-thư-mục--giải-thích-chi-tiết)
3. [Cài đặt & Biến môi trường](#-cài-đặt--biến-môi-trường)
4. [Chi tiết các Modules tích hợp (DB, CSV, Fixtures)](#-chi-tiết-các-modules-tích-hợp-db-csv-fixtures)
5. [Các giải pháp tối ưu tiêu biểu (Best Practices & Optimizations)](#-các-giải-pháp-tối-ưu-tiêu-biểu-best-practices--optimizations)
6. [Hướng dẫn chạy kiểm thử](#-hướng-dẫn-chạy-kiểm-thử)
7. [Cơ chế Data-Driven Testing (CSV)](#-cơ-chế-data-driven-testing-csv)
8. [Quản lý Token & Authentication Fixtures](#-quản-lý-token--authentication-fixtures)
9. [Quy chuẩn & Hướng dẫn mở rộng](#-quy-chuẩn--hướng-dẫn-mở-rộng)

---

## 🏛 Tổng quan kiến trúc

Dự án áp dụng các mô hình chuẩn trong kiểm thử tự động:

- **Page Object Model (POM)**: Tách biệt selector & hành vi UI khỏi mã kiểm thử.
- **API Object Model**: Đóng gói các HTTP endpoint thành các class service có thể tái sử dụng.
- **Custom Test Fixtures**: Tự động inject dependency (`loginPage`, `authAPI`, `authenticatedRequest`, `unauthenticatedRequest`, `db`).
- **Token Cache & Auto Refresh**: Lưu trữ token API theo môi trường (`tests/auth/api_token_<env>.json`) và tự động thu hồi/cấp lại khi token hết hạn.
- **Data-Driven Testing (DDT)**: Kết hợp kiểm thử tham số hóa từ file CSV cho hàng trăm tổ hợp query params.
- **Hybrid Execution Strategy**: Đặt tiền tố số thứ tự (`01.`, `02.`, `03.`) cho các file test kết hợp `workers: 1` cho UI/E2E để đảm bảo tính tuần tự ổn định (Login ➔ User ➔ Gacha), đồng thời kích hoạt `fullyParallel: true` cho tầng API Tests để tối đa hóa tốc độ thực thi.

---

## 📂 Cấu trúc thư mục & Giải thích chi tiết

```text
live2d/
├── .env.dev                      # Biến môi trường cho môi trường Dev
├── .env.staging                  # Biến môi trường cho môi trường Staging
├── package.json                  # Danh sách dependencies và các scripts thực thi
├── playwright.config.js          # File cấu hình trung tâm của Playwright Test Runner
│
├── src/                          # Mã nguồn khung kiểm thử (Framework Source)
│   ├── api/                      # API Services Wrapper (API Object Model)
│   │   ├── AuthAPI.js            # Xử lý các endpoint xác thực (Login, Refresh Token)
│   │   ├── GachaAPI.js           # Xử lý các endpoint quản lý Gacha/Avatar
│   │   └── UserAPI.js            # Xử lý các endpoint quản lý người dùng (User List)
│   │
│   ├── config/                   # Cấu hình dự án & API Endpoints
│   │   └── endpoint.js           # Định nghĩa danh sách các URI Endpoints tập trung
│   │
│   ├── fixtures/                 # Playwright Custom Fixtures
│   │   └── baseTest.js           # Khởi tạo custom test, token cache, authenticated/unauthenticated contexts & DB fixture
│   │
│   ├── pages/                    # Page Object Model (UI Pages)
│   │   ├── LoginPage.js          # Tương tác giao diện màn hình Đăng nhập (Sign-in)
│   │   ├── UserPage.js           # Tương tác giao diện màn hình Quản lý người dùng (User List)
│   │   └── GachaPage.js          # Tương tác giao diện màn hình Quản lý Gacha (Avatar List)
│   │
│   ├── test-data/                # Dữ liệu phục vụ kiểm thử (Test Data)
│   │   ├── index.js              # Barrel export giúp import dữ liệu tập trung
│   │   ├── commonApiData.js      # Dữ liệu chung cho API: tokens giả lập, generic accept/auth test cases, responses chuẩn
│   │   ├── loginData.js          # Dữ liệu kiểm thử đăng nhập (UI credentials, payloads, status expectations)
│   │   ├── userData.js           # Dữ liệu kiểm thử UI User (Selectors, labels, headers bảng, search cases)
│   │   ├── gachaData.js          # Dữ liệu kiểm thử UI Gacha (Selectors, bộ lọc, pagination regex)
│   │   ├── apiUserData.js        # Dữ liệu kiểm thử API User (Default params, error responses, schema expectations)
│   │   ├── apiGachaData.js       # Dữ liệu kiểm thử API Gacha (Filter params, error responses, schema expectations)
│   │   └── csv/                  # Thư mục chứa file CSV cho Data-Driven Testing
│   │       ├── getListUser.csv   # Bộ test cases tổ hợp query parameters cho API User List (128+ cases)
│   │       └── getListGacha.csv  # Bộ test cases tổ hợp query parameters cho API Gacha List (40+ cases)
│   │
│   └── utils/                    # Thư viện tiện ích (Helpers & Constants)
│       ├── constants.js          # Các hằng số (HTTP_STATUS_CODE, METHODS, CONTENT_TYPE, độ dài chuỗi)
│       ├── csvHelper.js          # Parser đọc file CSV và chuyển đổi thành test cases data-driven
│       ├── db.helper.js          # Kết nối và truy vấn cơ sở dữ liệu PostgreSQL (`pg`)
│       └── helpers.js            # Hàm random chuỗi/email, sinh phương thức HTTP không hợp lệ
│
└── tests/                        # Kịch bản kiểm thử (Test Specs)
    ├── api/                      # Kiểm thử tầng API (API Integration Tests)
    │   ├── 01.login.api.spec.js  # Test xác thực API (Status code, methods, headers, payload validation)
    │   ├── 02.user.api.spec.js   # Test API User (Happy path, 405 methods, Accept/Auth headers, CSV Data-Driven)
    │   └── 03.gacha.api.spec.js  # Test API Gacha (Happy path, 405 methods, Accept/Auth headers, CSV Data-Driven, DB Verification)
    │
    ├── auth/                     # Quản lý xác thực và cache session
    │   ├── .gitkeep              # Giữ thư mục tests/auth trên Git (các file .json được .gitignore bảo vệ)
    │   ├── admin.setup.js        # Global Setup: Đăng nhập UI Admin và xuất storageState dùng chung
    │   ├── ui_session_<env>.json # Cache session / cookies cho UI test suites theo môi trường (tinh gọn ~1KB)
    │   └── api_token_<env>.json  # Cache token Bearer API tự động theo môi trường (Dev/Staging)
    │
    ├── e2e/                      # Kiểm thử End-to-End kết hợp UI + API
    │   ├── 01.login.e2e.spec.js  # Kiểm tra luồng đăng nhập toàn diện giữa UI và phản hồi API
    │   ├── 02.user.e2e.spec.js   # Kiểm tra tính đồng bộ dữ liệu (Total count, table data, filter) giữa UI và API
    │   └── 03.gacha.e2e.spec.js  # Kiểm tra tính đồng bộ dữ liệu Gacha giữa UI và API
    │
    └── ui/                       # Kiểm thử giao diện người dùng (UI DOM / User Actions)
        ├── 01.login.ui.spec.js   # Kiểm tra DOM form login, validate ký tự, validation messages
        ├── 02.user.ui.spec.js    # Kiểm tra giao diện danh sách người dùng, bảng, bộ lọc, phân trang
        └── 03.gacha.ui.spec.js   # Kiểm tra giao diện danh sách gacha, thao tác tìm kiếm, phân trang
```

---

## ⚙️ Cài đặt & Biến môi trường

### 1. Danh sách thư viện & Lệnh cài đặt

Dự án sử dụng các gói thư viện sau:

| Thư viện               | Mục đích                                                      | Lệnh cài đặt                      |
| :--------------------- | :------------------------------------------------------------ | :-------------------------------- |
| **`@playwright/test`** | Core Test Runner cho UI, API & E2E Testing                    | `npm install -D @playwright/test` |
| **`dotenv`**           | Quản lý nạp biến môi trường (`.env.dev`, `.env.staging`)      | `npm install -D dotenv`           |
| **`@types/node`**      | Cung cấp Type definitions cho môi trường Node.js              | `npm install -D @types/node`      |
| **`pg`**               | PostgreSQL Client hỗ trợ kết nối, query & clean data trong DB | `npm install pg`                  |
| **`csv-parse`**        | Parser đọc và chuyển đổi file CSV phục vụ Data-Driven Testing | `npm install csv-parse`           |

#### Cài đặt toàn bộ dự án từ đầu:

```bash
# 1. Cài đặt tất cả dependencies từ package.json
npm install

# 2. Cài đặt trình duyệt Playwright (Chromium) & các dependencies hệ thống
npx playwright install --with-deps chromium
```

### 2. Cấu hình biến môi trường (Environment - `dotenv`)

Hệ thống hỗ trợ chạy đa môi trường (Dev, Staging) thông qua cờ `ENV=<env>`. Bạn có thể sao chép từ file mẫu [`.env.example`](.env.example):

```bash
cp .env.example .env.dev
```

Nội dung cấu hình cơ bản trong `.env.<env>`:

```env
# URL Cấu hình hệ thống (tự động nạp qua src/config/endpoint.js)
UI_BASE_URL=https://admin-dev.surrealdolls.com
API_BASE_URL=https://admin-dev.surrealdolls.com

# HTTP Basic Auth (Lớp bảo vệ server / popup trình duyệt nếu có)
BASIC_AUTH_USER=
BASIC_AUTH_PASS=

# Tài khoản Admin dùng để test
ADMIN_EMAIL=
ADMIN_ID=
ADMIN_PASSWORD=
LOGIN_TYPE=email

# Kết nối Database PostgreSQL (cho src/utils/db.helper.js)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=
```

> **Bảo mật**: Các file chứa thông tin nhạy cảm (`.env*` trừ `.env.example`) và các file cache token/cookies (`tests/auth/*.json`) đều đã được cấu hình trong [`.gitignore`](.gitignore), đảm bảo không vô tình commit thông tin mật lên Git repository.

---

## 🛠 Chi tiết các Modules tích hợp (DB, CSV, Fixtures)

### 1. Quản lý Cơ sở dữ liệu (`pg` - PostgreSQL)

- **Vị trí**: [`src/utils/db.helper.js`](src/utils/db.helper.js)
- **Chức năng**:
  - `DBHelper.isConnected()`: Kiểm tra trạng thái kết nối Database (Health check) an toàn, hỗ trợ cơ chế tự động Skip test khi DB offline.
  - `DBHelper.query(sql, params)`: Thực thi câu lệnh SQL trực tiếp với connection pool.
  - `DBHelper.getUserByEmail(email)`: Truy vấn dữ liệu người dùng từ database để verify với API/UI.
  - `DBHelper.deleteUserByEmail(email)`: Xóa / dọn dẹp dữ liệu rác sau khi chạy test.
  - `DBHelper.getGachaById(id)`: Truy vấn chi tiết 1 Model/Gacha từ bảng `public.three_d_models` (kèm điều kiện `is_deleted = false`).
  - `DBHelper.getGachaList(options)`: Truy vấn danh sách Model/Gacha từ bảng `public.three_d_models` có phân trang (`LIMIT`/`OFFSET`), bộ lọc (`keyword`, `status`), lọc `is_deleted = false` và sắp xếp chuẩn `ORDER BY id DESC`.
  - `DBHelper.closePool()`: Đóng connection pool kết nối PostgreSQL.

### 2. Xử lý dữ liệu CSV Data-Driven (`csv-parse`)

- **Vị trí**: [`src/utils/csvHelper.js`](src/utils/csvHelper.js)
- **Data files**: [`src/test-data/csv/getListUser.csv`](src/test-data/csv/getListUser.csv), [`src/test-data/csv/getListGacha.csv`](src/test-data/csv/getListGacha.csv)
- **Chức năng**:
  - `loadUserListCsvCases(path)` / `loadGachaListCsvCases(path)`: Tự động đọc file CSV, parse dữ liệu chuỗi thành kiểu nguyên bản (`number`, `boolean`, `null`, `""`), tạo ma trận test cases tham số hóa cho API.

### 3. Cơ chế Database Verification (API vs DB) & Auto-Skip

- **Áp dụng tại**: [`tests/api/03.gacha.api.spec.js`](tests/api/03.gacha.api.spec.js)
- **Cơ chế so khớp**:
  - **Total Count & Pagination**: So sánh `total_count` và độ dài mảng dữ liệu trả về từ API với `COUNT(*)` và `LIMIT/OFFSET` từ PostgreSQL.
  - **Field-by-Field Integrity**: Lấy item từ API, truy vấn trực tiếp từ bảng `public.three_d_models` theo `id` để đối chiếu từng trường (`name`, `status`, `created_at`, `updated_at`...).
  - **Filter & Search Sync**: Đối chiếu kết quả khi lọc `status` (公開 / 非公開) và tìm kiếm `keyword` giữa API và câu lệnh SQL tương ứng.
- **Auto-Skip an toàn khi DB Offline**:
  - Trước khi chạy suite test DB, hệ thống tự động kiểm tra `DBHelper.isConnected()`.
  - Nếu Database cục bộ chưa được bật hoặc không thể kết nối, test runner sẽ **tự động Skip** nhóm test DB với lý do rõ ràng, đảm bảo toàn bộ các test cases API khác vẫn chạy thành công mà không bị crash/fail.

### 4. Cơ chế kiểm thử E2E & Đồng bộ Dữ liệu (UI vs API)

- **Áp dụng tại**: [`tests/e2e/03.gacha.e2e.spec.js`](tests/e2e/03.gacha.e2e.spec.js), [`tests/e2e/02.user.e2e.spec.js`](tests/e2e/02.user.e2e.spec.js)
- **Mô hình kiến trúc**:
  - **Single Browser Session (`describe.serial`)**: Đăng nhập 1 lần tại `beforeAll` và dùng chung context giúp tăng tốc độ kiểm thử.
  - **Dynamic Network Synchronization (`executeWithApiResponse`)**: Lắng nghe chính xác thời điểm Backend trả về response `200` qua `page.waitForResponse` thay vì dùng timeout tĩnh, loại bỏ hoàn toàn tình trạng flaky test.
  - **Clean API Call Abstraction (`fetchGachaApi`)**: Tái sử dụng query parameters mặc định và tự động assert `HTTP_STATUS_CODE.OK`.
- **Nội dung kiểm thử toàn diện**:
  1. `TC01`: Đối chiếu **Total Count** & **Số dòng bảng** (UI vs API).
  2. `TC02`: Đối chiếu chi tiết **từng hàng trong bảng** (`ID`, `Tên Model`, mapping trạng thái `公開`/`非公開`).
  3. `TC03`: Tìm kiếm **Keyword động** (lấy dữ liệu thực tế từ API để search, verify hàng đầu tiên chứa từ khóa).
  4. `TC04`: Lọc theo **Trạng thái (Status)** và đối chiếu số bản ghi tương ứng.
  5. `TC05`: Tìm kiếm **No Data** với từ khóa không tồn tại, kiểm tra message thông báo rỗng.
  6. `TC06`: **Clear Filter** và khôi phục trạng thái danh sách ban đầu.

---

## 🎯 Các giải pháp tối ưu tiêu biểu (Best Practices & Optimizations)

Dự án áp dụng các kỹ thuật tự động hóa nâng cao nhằm tối ưu hiệu năng, độ ổn định và tính mở rộng của toàn bộ test framework:

### 1. Tối ưu hóa Authentication UI với Setup Project & `storageState` thông minh

- **Kiểm tra hạn Token JWT trước khi đăng nhập (`isSessionValid`)**:
  - `tests/auth/admin.setup.js` đọc trực tiếp `access_token` từ file cache `tests/auth/ui_session_<env>.json` và giải mã JWT payload để kiểm tra trường `exp`.
  - Nếu phiên còn hạn ít nhất 60 giây, hệ thống **bỏ qua hoàn toàn bước mở trình duyệt và tương tác login form**, tái sử dụng ngay phiên làm việc chỉ trong **vài chục miligiây (< 100ms)**.
- **Thanh lọc dữ liệu lưu trữ (Payload Diet)**:
  - Khi Playwright trích xuất `storageState()`, nó sẽ lưu toàn bộ `localStorage` của trình duyệt bao gồm hàng chục KB metadata video/quà tặng của hệ thống (`surreal-resource-*`).
  - File setup áp dụng bộ lọc tự động: loại bỏ hoàn toàn các key cache tĩnh không phục vụ xác thực, chỉ giữ lại auth cookies (`access_token`, `refresh_token`), giúp dung lượng file `ui_session_<env>.json` giảm hơn **75%** (từ ~4.6 KB xuống chỉ còn ~1.1 KB).
- **Cách ly phiên cho các bài test Form Login**:
  - Các bài kiểm thử giao diện đăng nhập (`01.login.ui.spec.js` và `01.login.e2e.spec.js`) sử dụng `test.use({ storageState: { cookies: [], origins: [] } })` để giữ trạng thái chưa đăng nhập biệt lập, không bị ảnh hưởng bởi session toàn cục.

### 2. Tối ưu hóa Token API & An toàn đa luồng (In-Memory & Atomic File Caching)

- **Bộ nhớ đệm trong tiến trình (`inMemoryToken`)**:
  - Fixture `authenticatedRequest` trong [`src/fixtures/baseTest.js`](src/fixtures/baseTest.js) ưu tiên đọc token từ RAM của tiến trình worker, hạn chế tối đa việc đọc ghi file liên tục từ đĩa khi chạy hàng trăm test case API.
- **Ghi file nguyên tử (Atomic File Write)**:
  - Khi lưu `tests/auth/api_token_<env>.json`, hệ thống ghi dữ liệu vào một file tạm (`.tmp`) rồi thực hiện lệnh đổi tên nguyên tử (`fs.renameSync`). Điều này loại trừ triệt để hiện tượng tranh chấp ghi file (Race Condition) và file bị rỗng/hỏng khi tầng API chạy song song (`fullyParallel: true`).
- **Cơ chế Refresh Token tự động**:
  - Khi token hết hạn, hệ thống ưu tiên gọi endpoint `/api/v1/auth/refresh/` để gia hạn `access_token` nhanh chóng trước khi fallback về gọi API đăng nhập đầy đủ.

### 3. Nạp biến môi trường động & Loại bỏ hoàn toàn Hardcode URL

- **Cấu hình tập trung tại [`src/config/endpoint.js`](src/config/endpoint.js)**:
  - Nạp động file `.env.<env>` tương ứng dựa trên cờ `ENV` (`ENV=dev` ➔ `.env.dev`, `ENV=staging` ➔ `.env.staging`).
  - Toàn bộ URL Backend (`API_BASE_URL`) và Frontend (`UI_BASE_URL`) được đọc 100% từ `process.env`.
  - Các service (`AuthAPI`, `UserAPI`, `GachaAPI`, `baseTest`) kế thừa trực tiếp từ cấu hình này mà không chứa bất kỳ URL cố định nào trong mã nguồn.

### 4. Đồng bộ hóa mạng động (Dynamic Network Synchronization - No Sleep)

- Tuyệt đối không sử dụng `page.waitForTimeout(ms)` (Anti-pattern gây flaky test và lãng phí thời gian).
- Áp dụng kỹ thuật bắt sự kiện mạng thời gian thực:
  - Lắng nghe response thành công của API ngay khi người dùng thao tác bấm nút Tìm kiếm / Lọc / Chuyển trang:
  ```javascript
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/v1/users') && resp.status() === 200),
    page.click('#btn-search')
  ]);
  ```

### 5. Network Interception & API Route Mocking (`page.route`)

Playwright cung cấp khả năng can thiệp trực tiếp vào tầng mạng của trình duyệt, được ứng dụng cho 2 mục đích cốt lõi:

#### a. Tăng tốc độ kiểm thử bằng cách chặn tài nguyên tĩnh (Static Asset Aborting)
- Trong các trang UI phức tạp chứa nhiều hình ảnh, 3D model preview hoặc avatar người dùng, việc tải các file ảnh lớn làm chậm đáng kể quá trình render DOM.
- Kỹ thuật định tuyến chặn ảnh giúp trang tải gần như tức thì:
  ```javascript
  await sharedPage.route(/\.(png|jpeg|jpg|svg|webp)$/, (route) => route.abort());
  ```

#### b. Giả lập phản hồi Backend (Fault Injection & Mock Responses)
- Dùng `route.fulfill()` để giả lập phản hồi của Backend mà không cần can thiệp vào máy chủ thật.
- Cho phép kiểm thử các tình huống biên khó tái hiện như: **Lỗi máy chủ 500 Internal Server Error**, mất kết nối mạng, hoặc phản hồi danh sách rỗng để verify UI có hiển thị đúng thông báo lỗi/thông báo rỗng hay không:
  ```javascript
  await sharedPage.route("**/api/v1/users/**", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Mocked Internal Server Error 500" }),
    });
  });
  ```

### 6. Database Health Check & Graceful Auto-Skip

- Module `DBHelper` được bọc lớp kiểm tra an toàn `isConnected()`.
- Khi chạy trên các môi trường CI/CD không có kết nối cơ sở dữ liệu PostgreSQL cục bộ, runner sẽ tự động Skip các test case kiểm tra đối chiếu dữ liệu DB thay vì làm crash pipeline, đảm bảo các bộ test UI/API thuần túy vẫn hoàn thành trọn vẹn.

---

## 🚀 Hướng dẫn chạy kiểm thử

### 1. Lệnh NPM Scripts có sẵn

| Lệnh                  | Mô tả                                                        | Chi tiết lệnh thực thi                 |
| :-------------------- | :----------------------------------------------------------- | :------------------------------------- |
| `npm run test:dev`    | Chạy toàn bộ test suites trên môi trường **Dev**             | `ENV=dev npx playwright test`          |
| `npm run test:stg`    | Chạy toàn bộ test suites trên môi trường **Staging**         | `ENV=staging npx playwright test`      |
| `npm run test:ui:dev` | Mở giao diện tương tác **Playwright UI Mode** (Dev)          | `ENV=dev npx playwright test --ui`     |
| `npm run test:ui:stg` | Mở giao diện tương tác **Playwright UI Mode** (Staging)      | `ENV=staging npx playwright test --ui` |
| `npm run report`      | Mở báo cáo kết quả kiểm thử HTML gần nhất                    | `npx playwright show-report`           |
| `npm run codegen:dev` | Mở công cụ Playwright Codegen để sinh mã selector UI tự động | `ENV=dev npx playwright codegen ...`   |

### 2. Chạy theo từng nhóm kiểm thử (CLI)

```bash
# Chạy riêng API Tests
ENV=dev npx playwright test tests/api/

# Chạy riêng UI Tests
ENV=dev npx playwright test tests/ui/

# Chạy riêng E2E Tests
ENV=dev npx playwright test tests/e2e/

# Chạy một file test cụ thể
ENV=dev npx playwright test tests/api/02.user.api.spec.js

# Chạy ở chế độ Debug (có UI từng bước)
ENV=dev npx playwright test tests/api/01.login.api.spec.js --debug

# Chạy có hiển thị trình duyệt (Headed mode)
ENV=dev npx playwright test tests/ui/ --headed
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
  - **Phân tầng Cache 4 bước**:
    1. **RAM Cache (`inMemoryToken`)**: Kiểm tra token trong bộ nhớ tiến trình Worker để trả về ngay lập tức mà không cần đọc đĩa.
    2. **Disk Cache (`tests/auth/api_token_<env>.json`)**: Đọc file cache theo môi trường hiện tại (được bảo vệ bằng cơ chế ghi file nguyên tử `.tmp` + `renameSync`).
    3. **Auto Refresh**: Nếu token nhận mã lỗi `401`/`403` hoặc sắp hết hạn, tự động gọi API `/api/v1/auth/refresh/` để gia hạn `access_token`.
    4. **Auto Re-login**: Nếu refresh thất bại, tự động gọi API `/api/v1/auth/login/` lấy token mới và đồng bộ lại vào RAM & file cache.
  - Tự động gắn header `Authorization: Bearer <token>` vào mọi request gửi đi.
- **`unauthenticatedRequest`**:
  - Dùng cho các test case kiểm tra bảo mật (truyền token sai định dạng, token hết hạn, không truyền header Auth).
- **`loginPage` & `authAPI`**:
  - Được khởi tạo tự động sẵn trong context của test case.

---

## 📝 Quy chuẩn & Hướng dẫn mở rộng

### Thêm một trang UI mới:

1. Tạo Page Object trong `src/pages/MyNewPage.js`.
2. Tạo file Test Data trong `src/test-data/myNewData.js` và export qua `src/test-data/index.js`.
3. Viết kịch bản kiểm thử trong `tests/ui/04.myNewPage.ui.spec.js`.

### Thêm một API Service mới:

1. Khai báo endpoint trong `src/config/endpoint.js`.
2. Tạo API client trong `src/api/MyNewAPI.js`.
3. Tạo file Test Data trong `src/test-data/apiMyNewData.js` kế thừa từ `commonApiData.js`.
4. Viết kịch bản kiểm thử trong `tests/api/04.myNew.api.spec.js`.
