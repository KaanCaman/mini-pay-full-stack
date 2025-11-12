# 🪙 Mini-Pay Backend

Mini-Pay is a secure, modular, and testable wallet backend built with **Go**, **Fiber**, **GORM**, and **Zap logger**.
It implements **JWT-based authentication**, **user wallet management**, and **atomic transactions** (Deposit / Withdraw / Transfer).

---

## ⚙️ Tech Stack

| Component          | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| **Language**       | Go (Golang)                                                 |
| **Framework**      | [Fiber v2](https://gofiber.io/)                             |
| **ORM**            | [GORM](https://gorm.io/)                                    |
| **Database**       | SQLite (for development)                                    |
| **Logger**         | [Uber Zap](https://github.com/uber-go/zap)                  |
| **Authentication** | JWT (HS256)                                                 |
| **Architecture**   | Clean Architecture — Repository / Service / Handler pattern |

---

## 🧱 Project Structure

```sh
mini-pay-full-stack/
│
├── backend/
│   ├── cmd/
│   │   └── api/
│   │       └── main.go            # Entry point
│   ├── internal/
│   │   ├── config/                # Future configs
│   │   ├── database/              # DB layer (interface + GORM)
│   │   ├── handlers/              # Fiber HTTP handlers
│   │   ├── logger/                # Zap-based logger
│   │   ├── middleware/            # JWT validation middleware
│   │   ├── models/                # GORM models (User, Wallet)
│   │   ├── repositories/          # Data access layer
│   │   ├── routes/                # Route registration
│   │   ├── services/              # Business logic (Auth, Wallet)
│   │   └── utils/                 # Utility functions (JWT, etc.)
│   └── go.mod
```

---

## 🔐 Authentication

All protected routes use the **JWT middleware**, which validates tokens and extracts the `user_id` claim from the payload.

Each request runs in an **isolated Fiber context**, ensuring no cross-user data leakage.
Every token uniquely identifies one user.

---

## 📡 API Routes

### 🧍 User Authentication

| Method | Endpoint    | Description                                           |
| ------ | ----------- | ----------------------------------------------------- |
| `POST` | `/register` | Register a new user and automatically create a wallet |
| `POST` | `/login`    | Authenticate user and return JWT token                |
| `GET`  | `/me`       | Validate token and return user ID                     |

---

### 💰 Wallet Operations (JWT Protected)

> All routes below require an `Authorization: Bearer <token>` header.

| Method | Endpoint           | Description                               |
| ------ | ------------------ | ----------------------------------------- |
| `GET`  | `/wallet/balance`  | Returns user’s wallet balance             |
| `POST` | `/wallet/deposit`  | Add funds to user’s wallet                |
| `POST` | `/wallet/withdraw` | Withdraw funds if balance is sufficient   |
| `POST` | `/wallet/transfer` | Transfer funds atomically to another user |

---

### 🧾 Example Requests

#### 1. Register a User

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

#### 2. Login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

#### 3. Get Balance

```bash
curl -X GET http://localhost:3000/wallet/balance \
  -H "Authorization: Bearer <TOKEN>"
```

#### 4. Deposit

```bash
curl -X POST http://localhost:3000/wallet/deposit \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000}'
```

#### 5. Transfer

```bash
curl -X POST http://localhost:3000/wallet/transfer \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"to_user_id":2, "amount":2500}'
```

---

## 🧠 Architecture Overview

### ✅ High Cohesion, Low Coupling

- Each package has a **single responsibility**:

  - `services` = business logic
  - `repositories` = database queries
  - `handlers` = HTTP layer

- Dependencies are injected via interfaces (for testability).

### 🔄 Transaction Safety

- `Transfer` uses **GORM transactions** to ensure **atomicity** (ACID-safe).
- Prevents negative balances and ensures rollback on error.

### 🧰 Logging

- Built on **Uber Zap**, with structured `Info` and `Error` logs.
- Logs include contextual fields (user_id, balance, amount, etc.) for easy debugging.

### 🔒 Security

- Token-based authentication (JWT HS256)
- Token validation on every protected route
- Isolated user scopes (no access to other users’ data)

---

## 🧩 Future Roadmap

| Feature                | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| 🧾 Transaction History | Store and display deposit, withdraw, and transfer logs  |
| 🔔 Notifications       | Expo push integration for balance changes and transfers |
| ♻️ Refresh Tokens      | Secure re-authentication for longer sessions            |
| 🧪 Unit Tests          | Repository + Service level testing                      |

---

## 🚀 Run Locally

```bash
# Navigate into backend
cd backend

# Run the server
go run cmd/api/main.go
```

The API will be available at:

```http
http://127.0.0.1:3000
```

---

## 🧑‍💻 Author

**Mini-Pay Backend**
Developed by [Kaan Caman](https://github.com/kaancaman)
Focused on clean Go architecture, security, and modular design.
