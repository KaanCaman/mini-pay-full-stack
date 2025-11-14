# 🪙 Mini-Pay Backend (Go + Fiber + GORM)

Mini-Pay is a secure, modular, and testable backend wallet system built with **Go**, **Fiber**, **GORM**, **Zap Logger**, and **JWT authentication**.

It supports:

- **User registration & login**
- **JWT-protected wallet operations**
- **Deposit / Withdraw / Transfer**
- **Atomic ACID-safe transfers**
- **Full Transaction History**
- **Configurable environment via `.env`**
- **Standardized JSON Error Responses**
- **Clean Architecture (Handlers → Services → Repositories)**

---

## ⚙️ Tech Stack

| Component          | Description                                   |
| ------------------ | --------------------------------------------- |
| **Language**       | Go (Golang)                                   |
| **HTTP Framework** | Fiber v2                                      |
| **ORM**            | GORM                                          |
| **Database**       | SQLite (dev) — easily switchable in config    |
| **Logging**        | Uber Zap (structured logs)                    |
| **Auth**           | JWT (HS256)                                   |
| **Config**         | Environment variables via `.env` + LoadConfig |
| **Architecture**   | Clean Architecture + Dependency Injection     |

---

## 🧱 Project Structure

```shell
backend/
│
├── cmd/
│   └── api/
│       └── main.go              # App entrypoint
│
├── internal/
│   ├── config/                  # .env loader, AppConfig
│   ├── database/                # DB interface + GORM implementation
│   ├── handlers/                # HTTP handlers (Auth, Wallet, Transactions)
│   ├── logger/                  # Zap logger wrapper
│   ├── middleware/              # JWT Auth middleware
│   ├── models/                  # GORM models (User, Wallet, Transaction)
│   ├── repositories/            # Database access layer
│   ├── routes/                  # Route definitions
│   ├── services/                # Business logic
│   └── utils/                   # JWT utils, Error utils
│
└── go.mod
```

---

# 🔐 Authentication

All protected endpoints use:

```
Authorization: Bearer <token>
```

Middleware extracts claims:

- Validates token
- Extracts `user_id`
- Stores `user_id` in `c.Locals("user_id")`
- Ensures users **cannot access each other’s data**

---

# 📡 API Routes

## 🧍 User Authentication

| Method | Endpoint    | Description                                   |
| ------ | ----------- | --------------------------------------------- |
| POST   | `/register` | Create a user + auto-create wallet            |
| POST   | `/login`    | Login, return JWT token                       |
| GET    | `/me`       | Validate JWT and return authenticated user ID |

---

## 💰 Wallet Operations (JWT Required)

| Method | Endpoint           | Description                               |
| ------ | ------------------ | ----------------------------------------- |
| GET    | `/wallet/balance`  | Get current wallet balance                |
| POST   | `/wallet/deposit`  | Add funds to your wallet                  |
| POST   | `/wallet/withdraw` | Withdraw money if balance is sufficient   |
| POST   | `/wallet/transfer` | Send money **atomically** to another user |
| GET    | `/wallet/history`  | View complete transaction history         |

---

# 🧾 Example Requests

### Register

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

### Login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

### Get Balance

```bash
curl -X GET http://localhost:3000/wallet/balance \
  -H "Authorization: Bearer <TOKEN>"
```

### Deposit

```bash
curl -X POST http://localhost:3000/wallet/deposit \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"amount":10000}'
```

### Transfer

```bash
curl -X POST http://localhost:3000/wallet/transfer \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"to_user_id":2, "amount":5000}'
```

### Transaction History

```bash
curl -X GET http://localhost:3000/wallet/history \
  -H "Authorization: Bearer <TOKEN>"
```

---

# 🗃️ Models Overview

### User

- ID
- Email (unique)
- PasswordHash

### Wallet

- ID
- UserID (1:1)
- Balance (in cents, int64)

### Transaction

- UserID
- Type: `deposit`, `withdraw`, `transfer_sent`, `transfer_received`
- Amount
- TargetUserID (nullable)
- BalanceAfter
- Timestamp

---

# 🧠 Architecture Overview

### ✔ High Cohesion, Low Coupling

- **Handlers** → Handle HTTP only
- **Services** → Pure business rules
- **Repositories** → Database access
- **Models** → ORM structures

Everything depends on **interfaces**, not implementations.

---

## 🔄 Transaction Safety (ACID)

Transfers run inside:

```go
db.Transaction(func(tx *gorm.DB) error {
    ...
})
```

Meaning:

- Either _everything succeeds_
  or
- _Everything is rolled back_

Protection includes:

- No negative balances
- No half-complete transfers
- Correct transaction logs for sender + receiver

---

## 📜 Standardized Error Handling

All errors follow a single JSON shape:

```json
{
  "error": true,
  "message": "Invalid request"
}
```

Helpers:

- `BadRequestError()`
- `UnauthorizedError()`
- `NotFoundError()`
- `InternalError()`

---

## 🧰 Configuration System (.env)

Your `.env` file can contain:

```shell
APP_ENV=development
APP_PORT=3000
DB_DRIVER=sqlite
DB_NAME=mini_pay.db
JWT_SECRET=SUPER_SECRET_KEY_123
LOG_LEVEL=development
```

Loaded by:

```go
cfg := config.LoadConfig()
```

---

## 🔍 Logging

Built with **Zap SugaredLogger**.

Examples:

```go
log.Info("Deposit successful", map[string]interface{}{
    "user_id": userID,
    "amount": amount,
})
```

Structured logs are clean and searchable.

---

# 🚀 Run Locally

```bash
cd backend
go run cmd/api/main.go
```

Server runs at:

```shell
http://localhost:3000
```

---

# 🧩 Roadmap

| Feature                  | Status |
| ------------------------ | ------ |
| Deposit / Withdraw       | ✅     |
| Transfer (atomic)        | ✅     |
| Transaction history      | ✅     |
| JWT Auth                 | ✅     |
| Standardized errors      | ✅     |
| Config / .env            | ✅     |
| Push notifications       | 🔜     |
| Refresh tokens           | 🔜     |
| Unit + integration tests | 🔜     |

---

# 👨‍💻 Author

**Mini-Pay Backend — by Kaan Caman**
Clean, secure, and scalable financial backend architecture powered by Go.
