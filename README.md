<div align="center">

  <h1>🧧 Tết Countdown & Mini Games System 🎆</h1>
  <h3>Hệ thống API & Real-time WebSockets cho sự kiện Tết</h3>

  <p>
    Một giải pháp Backend mạnh mẽ được xây dựng bằng kiến trúc Microservices/Modular. 
    Hệ thống cung cấp API đếm ngược Tết, quản lý người dùng, xử lý logic quà tặng (Hái lộc, Xin chữ) và đặc biệt là hệ thống sòng game dân gian (Bầu Cua, Lô Tô) theo thời gian thực (Real-time) với độ trễ thấp.
  </p>

  <p>
    <img src="https://img.shields.io/badge/license-UNLICENSED-red" alt="License">
    <img src="https://img.shields.io/badge/status-Active_Development-success" alt="Status">
    <img src="https://img.shields.io/badge/framework-NestJS_11-E0234E?logo=nestjs" alt="NestJS">
  </p>

</div>

<br />

# ⚙️ BACKEND API & SOCKET SERVICE

Đây là Repository chứa mã nguồn **Backend**, đóng vai trò là lõi xử lý nghiệp vụ, quản lý cơ sở dữ liệu, cung cấp RESTful API và máy chủ WebSockets cho toàn bộ hệ thống Tết.

## 🛠️ Công nghệ & Phiên bản

Dựa trên cấu hình `package.json`:

| Công nghệ | Phiên bản | Vai trò |
| :--- | :--- | :--- |
| **[NestJS](https://nestjs.com/)** | `^11.0.1` | Framework backend Node.js, kiến trúc Modular |
| **[@nestjs/mongoose](https://docs.nestjs.com/techniques/mongodb)** | `^11.0.4` | Tích hợp MongoDB với NestJS |
| **[Mongoose](https://mongoosejs.com/)** | `^9.2.1` | ODM MongoDB, quản lý Schema & Validation |
| **[Socket.io](https://socket.io/)** | `^4.8.3` | Máy chủ WebSockets xử lý Real-time Gaming |
| **[lunar-javascript](https://github.com/6tail/lunar-javascript)**| `^1.7.7` | Xử lý logic Lịch Âm, kiểm tra thời gian Giao thừa/Ngày Tết |
| **[@google/genai](https://ai.google.dev/)** | `^1.41.0` | Tích hợp AI Gemini (Tạo thơ, câu đối Xin Chữ Ông Đồ) |
| **[google-auth-library](https://github.com/googleapis/google-auth-library-nodejs)** | `^10.6.2` | Xử lý xác thực Token từ Google OAuth2 (Google Login) |
| **[Axios](https://axios-http.com/)** | `^1.16.0` | Gọi HTTP Request lấy thông tin người dùng từ Google API |
| **[@getbrevo/brevo](https://www.brevo.com/)** | `^3.0.1` | Dịch vụ gửi Email (OTP, Quên mật khẩu) |
| **[bcrypt](https://www.npmjs.com/package/bcrypt)** | `^6.0.0` | Mã hóa và bảo mật mật khẩu người dùng |
| **[passport-jwt](https://www.passportjs.org/)**| `^4.0.1` | Strategy xác thực người dùng bằng JWT |
| **[@nestjs/swagger](https://docs.nestjs.com/openapi/introduction)**| `^11.2.6` | Tự động tạo tài liệu API (OpenAPI) |

## 🌟 Tính năng nghiệp vụ (Modules)

* **🔐 Auth & Users:**
  * Xác thực người dùng đa phương thức: JWT truyền thống và Google OAuth2 (Tự động liên kết/tạo tài khoản).
  * Mã hóa mật khẩu bảo mật chuẩn bcrypt.
  * Tính năng cập nhật hồ sơ cá nhân và thay đổi mật khẩu (yêu cầu xác thực mật khẩu cũ).
  * Hệ thống tài khoản dùng chung (SSO): Người dùng có thể sử dụng cùng một tài khoản cho cả sự kiện Tết và Giáng sinh.
  * Quản lý tài khoản và số dư Xu (Coins) an toàn, chống race-condition.

* **🎲 Bầu Cua Tôm Cá (Real-time Socket):**
  * Quản lý phòng chơi tự động đếm ngược.
  * Xử lý đặt cược, hủy cược, xóc đĩa và tính toán trả thưởng (x1, x2, x3) tự động qua WebSockets.

* **🎟️ Lô Tô Đầu Xuân (Real-time Socket):**
  * Mở bán vé, tự động bốc số định kỳ.
  * Thuật toán tự động dò vé "Kinh", quản lý quỹ thưởng Jackpot cộng dồn.

* **🌳 Hái Lộc (Lucky Buds):**
  * Thuật toán quay thưởng theo tỷ lệ phần trăm (Rớt lộc Ngày thường vs Siêu lộc Giao thừa).
  * Giới hạn lượt hái lộc mỗi ngày.

* **🖌️ Xin Chữ Ông Đồ (Calligraphy):**
  * Lưu trữ lịch sử xin chữ.
  * (Tích hợp AI) Phân tích từ khóa và xuất câu đối/lời chúc phù hợp.

## 🚀 Cài đặt & Khởi chạy

### 1️⃣ Yêu cầu hệ thống (Prerequisites)

- Node.js >= 20
- MongoDB (Local hoặc MongoDB Atlas)

### 2️⃣ Clone & Cài đặt Dependencies

```bash
git clone https://github.com/hvt299/Tet-Countdown-Backend.git
cd Tet-Countdown-Backend
npm install
```

### 3️⃣ Cấu hình môi trường (.env)

Tạo file `.env` tại thư mục gốc của dự án:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/festive_events

GEMINI_API_KEY=YourSecretKeyHere

JWT_SECRET=YourSecretKeyHere
JWT_EXPIRATION=1d

SENDER_EMAIL=YourEmailHere
BREVO_API_KEY=YourSecretKeyHere
GOOGLE_CLIENT_ID=YourSecretKeyHere
```

### 4️⃣ Lệnh chạy (Scripts)

```bash
# Chạy môi trường phát triển (Watch mode)
npm run start:dev

# Build ra production
npm run build

# Chạy bản production
npm run start:prod
```

### 5️⃣ Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

## 📚 Tài liệu API & WebSockets

### RESTful API

Sau khi chạy server, truy cập đường dẫn sau để xem toàn bộ tài liệu API:

http://localhost:3001/api

Swagger UI hiển thị đầy đủ danh sách Route, Request Body và Response Schema.

### WebSockets Events

Hệ thống sử dụng namespace cho từng game:

* **🎲 Sảnh Bầu Cua:** http://localhost:3001/bau-cua

* **🎟️ Sảnh Lô Tô:** http://localhost:3001/loto

## 📂 Cấu trúc Module

```text
src/
├── app.module.ts          # Root module
├── main.ts                # Application entry point & Socket Adapter
├── auth/                  # Đăng nhập, Đăng ký, JWT
├── users/                 # Quản lý User, Số dư Xu
├── bau-cua/               # Logic Server Bầu Cua (Service + Gateway)
├── loto/                  # Logic Server Lô Tô (Service + Gateway)
├── lucky-buds/            # Logic Hái Lộc & Tính tỷ lệ
├── calligraphy/           # Logic Xin chữ Ông Đồ & AI integration
├── email/                 # Service gửi email OTP và Khôi phục mật khẩu qua Brevo
└── ...
```

## 👨‍💻 Author

Developed by **Mr.T (hvt299)**  
GitHub: [https://github.com/hvt299](https://github.com/hvt299)