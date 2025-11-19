# 🪙 Mini-Pay Backend

### Clean, Secure, Cohesive Financial Wallet API (Go + Fiber + GORM)

Mini-Pay is a clean-architecture backend wallet system built using **Go**, **Fiber**, **GORM**, **Zap Logger**, and **JWT authentication** — designed with **high cohesion** and **low coupling** principles.

Provides atomic money transfers, clean domain modeling, structured logs, camelCase JSON responses, and consistent error schemas.

---

# ⚙️ Tech Stack

| Component            | Description                                    |
| -------------------- | ---------------------------------------------- |
| **Language**         | Go (Golang)                                    |
| **HTTP Framework**   | Fiber v2                                       |
| **ORM**              | GORM                                           |
| **Database**         | SQLite (WAL mode, dev) / switchable via config |
| **Logging**          | Uber Zap (Sugared) — Info / Warn / Error       |
| **Auth**             | JWT (HS256, 14-min expiry)                     |
| **Config**           | `.env` via LoadConfig                          |
| **Architecture**     | Clean Architecture + DI                        |
| **JSON Model Style** | camelCase fields via custom `MyModel`          |

---

# 🧱 Project Structure

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

All protected endpoints require:

```
Authorization: Bearer <jwt_token>
```

Middleware:

- Validates HS256 token
- Extracts `userID` from claims (`userID` camelCase!)
- Stores it into `c.Locals("userID")`
- Passed to handlers safely

---

# 📡 API Routes

## 🧍 Authentication

| Method | Endpoint    | Description                      |
| ------ | ----------- | -------------------------------- |
| POST   | `/register` | Create user + auto-create wallet |
| POST   | `/login`    | Login & get JWT                  |
| GET    | `/me`       | Validate token & return userID   |

---

## 💰 Wallet Operations (Protected)

| Method | Endpoint           | Description                          |
| ------ | ------------------ | ------------------------------------ |
| GET    | `/wallet/balance`  | Get wallet balance                   |
| POST   | `/wallet/deposit`  | Add funds                            |
| POST   | `/wallet/withdraw` | Withdraw if balance >= amount        |
| POST   | `/wallet/transfer` | Atomic ACID-safe money transfer      |
| GET    | `/wallet/history`  | List all transactions (newest first) |

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

### Transfer (camelCase parameter!)

```bash
curl -X POST http://localhost:3000/wallet/transfer \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"toUserID":2,"amount":1500}'
```

### Transaction History (camelCase response)

```json
{
  "success": true,
  "code": "TX_HISTORY_FETCHED",
  "message": "Transaction history fetched",
  "data": {
    "userID": 1,
    "transactions": [
      {
        "id": 3,
        "createdAt": "2025-11-19T18:52:06.67+03:00",
        "updatedAt": "2025-11-19T18:52:06.67+03:00",
        "deletedAt": null,
        "userID": 1,
        "type": "transfer_sent",
        "amount": 1500,
        "targetUserID": 2,
        "balanceAfter": 6000
      }
    ]
  }
}
```

---

# 🗃️ Models (camelCase JSON)

### `MyModel` (Base)

```go
id
createdAt
updatedAt
deletedAt (nullable)
```

### User

```json
id
email
createdAt
updatedAt
```

### Wallet

```json
id
userID
balance
```

### Transaction

```json
id
userID
type
amount
targetUserID
balanceAfter
createdAt
```

---

# 🧠 Architecture Principles

### ✔ High Cohesion

Each folder has **one responsibility**.

### ✔ Low Coupling

Handlers → Services → Repos are connected through constructor injection.

### ✔ Clean Contracts

Services return **only business logic errors**, not framework errors.

### ✔ No ORM Leakage

Handlers never touch GORM.

---

# 🔄 ACID-Safe Transfers

Transfers run inside:

```go
db.Transaction(func(tx *gorm.DB) error {
   ...
})
```

Guarantees:

- No partial updates
- Sender + Receiver logs always consistent
- Prevents race conditions
- Prevents SQLite write-lock issues via:

  - WAL mode
  - tx-aware RecordWithTx

---

# 🧰 Configuration (.env)

```env
APP_ENV=development
APP_PORT=3000
DB_DRIVER=sqlite
DB_NAME=mini_pay.db
JWT_SECRET=SUPER_SECRET
LOG_LEVEL=development
```

---

# 🔍 Logging (Zap)

Example:

```go
log.Warn("Insufficient funds", map[string]interface{}{
    "userID": userID,
    "balance": balance,
    "attempt": amount,
})
```

Levels:

- `Info()` — normal operations
- `Warn()` — business rule violations
- `Error()` — system errors

---

# 🚀 Run Project

```bash
cd backend
go run cmd/api/main.go
```

Server:

```
http://localhost:3000
```

---

# 🧩 Roadmap

| Feature              | Status |
| -------------------- | ------ |
| Deposit / Withdraw   | ✅     |
| Transfer (TX-safe)   | ✅     |
| Transaction logs     | ✅     |
| JWT Auth             | ✅     |
| camelCase models     | ✅     |
| SQLite WAL           | ✅     |
| Interface-based DI   | ✅     |
| Tests                | 🔜     |
| Notification Gateway | 🔜     |
| Refresh Tokens       | 🔜     |

---

# 👨‍💻 Author

**Mini-Pay Backend — by Kaan Caman**
Clean, secure, and scalable wallet architecture powered by Go.
