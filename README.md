<div align="center">

  <h1>Tết Countdown & Mini Games System</h1>
  <h3>Hệ thống API & Real-time WebSockets cho sự kiện Tết</h3>

  <p>
    Một giải pháp Backend mạnh mẽ được xây dựng bằng kiến trúc Microservices/Modular. 
    Hệ thống cung cấp API đếm ngược Tết, quản lý người dùng, xử lý logic quà tặng (Hái lộc, Xin chữ) và đặc biệt là hệ thống sòng game dân gian (Bầu Cua, Lô Tô) theo thời gian thực (Real-time) với độ trễ thấp.
  </p>

  <p>
    <img src="https://img.shields.io/badge/NestJS-11.2.8-E0234E?logo=nestjs&logoColor=white" alt="NestJS">
    <img src="https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/MongoDB-Mongoose_9.11.4-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
    <img src="https://img.shields.io/badge/Socket.io-4.8.4-black?logo=socketdotio&logoColor=white" alt="Socket.io">
    <img src="https://img.shields.io/badge/Gemini_AI-Google_GenAI-4285F4?logo=google&logoColor=white" alt="Gemini">
    <img src="https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger&logoColor=black" alt="Swagger">
    <img src="https://img.shields.io/badge/license-UNLICENSED-red" alt="License">
    <img src="https://img.shields.io/badge/status-Active_Development-success" alt="Status">
  </p>

</div>

<br />

# BACKEND API & SOCKET SERVICE

Đây là Repository chứa mã nguồn **Backend**, đóng vai trò là lõi xử lý nghiệp vụ, quản lý cơ sở dữ liệu, cung cấp RESTful API và máy chủ WebSockets cho toàn bộ hệ thống Tết.

---

## Mục lục

- [1. Công nghệ & Thư viện Cốt lõi](#1-công-nghệ--thư-viện-cốt-lõi)
- [2. Tính năng Nghiệp vụ (Modules)](#2-tính-năng-nghiệp-vụ-modules)
  - [2.1. Xác thực & Người dùng (Auth & Users)](#21-xác-thực--người-dùng-auth--users)
  - [2.2. Sảnh Bầu Cua Tôm Cá (Real-time Socket)](#22-sảnh-bầu-cua-tôm-cá-real-time-socket)
  - [2.3. Sảnh Lô Tô Đầu Xuân (Real-time Socket)](#23-sảnh-lô-tô-đầu-xuân-real-time-socket)
  - [2.4. Hái Lộc Đầu Xuân (Lucky Buds)](#24-hái-lộc-đầu-xuân-lucky-buds)
  - [2.5. Xin Chữ Ông Đồ (Calligraphy AI)](#25-xin-chữ-ông-đồ-calligraphy-ai)
- [3. Cài đặt & Khởi chạy](#3-cài-đặt--khởi-chạy)
  - [3.1. Yêu cầu Hệ thống (Prerequisites)](#31-yêu-cầu-hệ-thống-prerequisites)
  - [3.2. Quy trình Cài đặt](#32-quy-trình-cài-đặt)
  - [3.3. Cấu hình Môi trường (.env)](#33-cấu-hình-môi-trường-env)
  - [3.4. Các Lệnh Thực thi (Scripts)](#34-các-lệnh-thực-thi-scripts)
  - [3.5. Kiểm thử (Testing)](#35-kiểm-thử-testing)
- [4. Tài liệu API & WebSockets](#4-tài-liệu-api--websockets)
  - [4.1. RESTful API Documentation](#41-restful-api-documentation)
  - [4.2. WebSockets Events](#42-websockets-events)
- [5. Cấu trúc Module Thư mục](#5-cấu-trúc-module-thư-mục)
- [6. Tác giả](#6-tác-giả)

---

## 1. Công nghệ & Thư viện Cốt lõi

Dựa trên cấu hình `package.json` đã được rà soát và nâng cấp phiên bản bảo mật:

| Công nghệ / Thư viện | Phiên bản | Vai trò Kỹ thuật |
| :--- | :--- | :--- |
| **[NestJS](https://nestjs.com/)** | `^11.2.8` | Framework backend Node.js, kiến trúc Modular |
| **[@nestjs/mongoose](https://docs.nestjs.com/techniques/mongodb)** | `^11.0.4` | Tích hợp MongoDB với NestJS |
| **[Mongoose](https://mongoosejs.com/)** | `^9.11.4` | ODM MongoDB, quản lý Schema & Validation |
| **[Socket.io](https://socket.io/)** | `^4.8.4` | Máy chủ WebSockets xử lý Real-time Gaming |
| **[lunar-javascript](https://github.com/6tail/lunar-javascript)**| `^1.7.7` | Xử lý logic Lịch Âm, kiểm tra thời gian Giao thừa/Ngày Tết |
| **[@google/genai](https://ai.google.dev/)** | `^1.52.0` | Tích hợp AI Gemini (Tạo thơ, câu đối Xin Chữ Ông Đồ) |
| **[google-auth-library](https://github.com/googleapis/google-auth-library-nodejs)** | `^10.9.1` | Xử lý xác thực Token từ Google OAuth2 (Google Login) |
| **[Axios](https://axios-http.com/)** | `^1.20.0` | Gọi HTTP Request lấy thông tin người dùng từ Google API |
| **[@getbrevo/brevo](https://www.brevo.com/)** | `^3.0.4` | Dịch vụ gửi Email (OTP, Quên mật khẩu) |
| **[bcrypt](https://www.npmjs.com/package/bcrypt)** | `^6.0.0` | Mã hóa và bảo mật mật khẩu người dùng |
| **[passport-jwt](https://www.passportjs.org/)**| `^4.0.1` | Strategy xác thực người dùng bằng JWT |
| **[@nestjs/swagger](https://docs.nestjs.com/openapi/introduction)**| `^11.4.7` | Tự động tạo tài liệu API (OpenAPI) |
| **[TypeScript](https://www.typescriptlang.org/)**| `^5.9.3` | Đảm bảo tính an toàn kiểu dữ liệu (Type Safety) |

---

## 2. Tính năng Nghiệp vụ (Modules)

### 2.1. Xác thực & Người dùng (Auth & Users)
* Xác thực người dùng đa phương thức: JWT truyền thống và Google OAuth2 (Tự động liên kết/tạo tài khoản).
* Mã hóa mật khẩu bảo mật chuẩn bcrypt.
* Tính năng cập nhật hồ sơ cá nhân và thay đổi mật khẩu (yêu cầu xác thực mật khẩu cũ).
* Hệ thống tài khoản dùng chung (SSO): Người dùng có thể sử dụng cùng một tài khoản cho cả sự kiện Tết và Giáng sinh.
* Quản lý tài khoản và số dư Xu (Coins) an toàn, chống race-condition.

### 2.2. Sảnh Bầu Cua Tôm Cá (Real-time Socket)
* Quản lý phòng chơi tự động đếm ngược.
* Xử lý đặt cược, hủy cược, xóc đĩa và tính toán trả thưởng (x1, x2, x3) tự động qua WebSockets.

### 2.3. Sảnh Lô Tô Đầu Xuân (Real-time Socket)
* Mở bán vé, tự động bốc số định kỳ.
* Thuật toán tự động dò vé "Kinh", quản lý quỹ thưởng Jackpot cộng dồn.

### 2.4. Hái Lộc Đầu Xuân (Lucky Buds)
* Thuật toán quay thưởng theo tỷ lệ phần trăm (Rớt lộc Ngày thường vs Siêu lộc Giao thừa).
* Giới hạn lượt hái lộc mỗi ngày.

### 2.5. Xin Chữ Ông Đồ (Calligraphy AI)
* Lưu trữ lịch sử xin chữ.
* (Tích hợp AI) Phân tích từ khóa và xuất câu đối/lời chúc phù hợp.

---

## 3. Cài đặt & Khởi chạy

### 3.1. Yêu cầu Hệ thống (Prerequisites)
* Node.js >= 20.x LTS
* MongoDB (Local hoặc MongoDB Atlas)

### 3.2. Quy trình Cài đặt

```bash
# 1. Tải mã nguồn Backend về máy cục bộ
git clone https://github.com/hvt299/Tet-Countdown-Backend.git
cd Tet-Countdown-Backend

# 2. Cài đặt toàn bộ thư viện phụ thuộc
npm install
```

### 3.3. Cấu hình Môi trường (.env)

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

### 3.4. Các Lệnh Thực thi (Scripts)

```bash
# Chạy môi trường phát triển (Watch mode)
npm run start:dev

# Build ra production
npm run build

# Chạy bản production
npm run start:prod
```

### 3.5. Kiểm thử (Testing)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

---

## 4. Tài liệu API & WebSockets

### 4.1. RESTful API Documentation

Sau khi chạy server, truy cập đường dẫn sau để xem toàn bộ tài liệu API:
```text
http://localhost:3001/api
```
Swagger UI hiển thị đầy đủ danh sách Route, Request Body và Response Schema.

### 4.2. WebSockets Events

Hệ thống sử dụng namespace cho từng game:
* **Sảnh Bầu Cua:** `http://localhost:3001/bau-cua`
* **Sảnh Lô Tô:** `http://localhost:3001/loto`

---

## 5. Cấu trúc Module Thư mục

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

---

## 6. Tác giả

Developed by **Mr.T (hvt299)**  
GitHub: [https://github.com/hvt299](https://github.com/hvt299)
