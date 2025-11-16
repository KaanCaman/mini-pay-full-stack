# 🚀 Expo Notification Gateway (Node.js + TypeScript)

The **Expo Notification Gateway** is a lightweight, fast, and production-ready microservice built with **Node.js**, **Express**, **TypeScript**, and the **Expo Push API**.

Its purpose is to act as a bridge between:

```
Go Backend → Notification Gateway → Expo Push API → iOS / Android Devices
```

The gateway:

- Validates Expo push tokens
- Sends notifications (single or batch)
- Provides unified error handling
- Offers clean, stateless architecture
- Can be deployed standalone (Railway / Render / VPS)
- Works perfectly with Expo Development Builds

---

## ⚙️ Tech Stack

| Component        | Description                                    |
| ---------------- | ---------------------------------------------- |
| **Language**     | TypeScript                                     |
| **Runtime**      | Node.js                                        |
| **HTTP Server**  | Express                                        |
| **Push API**     | Expo Push API (fetch → `https://exp.host/...`) |
| **Logging**      | Console (future: Pino or Winston)              |
| **Environment**  | `.env` variables via dotenv                    |
| **Runner**       | `tsx` (no ts-node-dev required)                |
| **Architecture** | Layered: App → Routes → Services → Utils       |

---

## 🧱 Project Structure

```shell
expo-notification-gateway/
│
├── src/
│   ├── app.ts                   # Express instance + middleware
│   ├── server.ts                # Entrypoint
│   ├── services/
│   │   └── sendPush.ts          # Expo push send/batch logic
│   ├── types/
│   │   └── NotificationPayload.ts
│   └── utils/                   # Helper functions (future)
│
├── package.json
├── tsconfig.json
├── .env
└── README.md
```

---

# 🔔 What This Gateway Does

The gateway handles all notification logic so your backend can stay clean and focused.

It provides:

### ✔ **Single Notification Endpoint**

Send one notification to one device.

### ✔ **Batch Notifications**

Send up to 100 notifications in a single request (Expo API limit).

### ✔ **Token Validation**

Uses Expo token validation (`ExponentPushToken[...]` format).

### ✔ **Unified Error Handling**

Consistent JSON responses for any error.

### ✔ **Stateless Architecture**

No database required. Perfect for hobby, demo, and lightweight apps.

---

# 📡 API Routes

## 1. Health Check

| Method | Endpoint  | Description          |
| ------ | --------- | -------------------- |
| GET    | `/health` | Check if server live |

Response:

```json
{
  "status": "ok",
  "service": "Expo Notification Gateway",
  "uptime": 12.3
}
```

---

## 2. Send Notification (Single)

| Method | Endpoint                  | Description   |
| ------ | ------------------------- | ------------- |
| POST   | `/api/notifications/send` | Send one push |

### Request Body

```json
{
  "to": "ExponentPushToken[xxxx]",
  "title": "Mini-Pay",
  "body": "Balance updated!",
  "data": { "amount": 100 }
}
```

### Example cURL

```bash
curl -X POST http://localhost:4001/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[xxxx]",
    "title": "Hello",
    "body": "Test message"
  }'
```

---

## 3. Send Batch (Up to 100)

| Method | Endpoint                        | Description      |
| ------ | ------------------------------- | ---------------- |
| POST   | `/api/notifications/send-batch` | Send bulk pushes |

### Body

```json
{
  "notifications": [
    { "to": "ExponentPushToken[A1]", "title": "Hi", "body": "Msg1" },
    { "to": "ExponentPushToken[A2]", "title": "Hi", "body": "Msg2" }
  ]
}
```

---

# 🧾 Notification Payload Model

```ts
export interface NotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}
```

---

# 🧠 How It Works (Architecture Overview)

### ✔ Express handles HTTP

Fast, small footprint, perfect for microservices.

### ✔ Services send push requests

`sendPush.ts` handles:

- token validation
- request formatting
- fetch to Expo API
- batch chunking (max 100)

### ✔ No state or DB needed

Gateway is stateless → horizontal scaling possible.

### ✔ Easy to replace or extend

Replace Expo Push API with FCM/APNS directly if needed.

---

# 🌍 Environment Variables

`.env` file:

```env
PORT=4001
EXPO_ACCESS_TOKEN=
```

`EXPO_ACCESS_TOKEN` is **optional** (only for enhanced security).

---

# 🚀 Run Locally

```bash
npm install
npm run dev
```

Server runs at:

```
http://localhost:4001
```

---

# ☁️ Deploy (Recommended Options)

| Platform    | Status   | Notes               |
| ----------- | -------- | ------------------- |
| **Railway** | ⭐ Best  | Free tier ok        |
| **Render**  | ⭐ Great | Auto-redeploy       |
| **VPS**     | ⭐ Pro   | PM2 suggested       |
| **Docker**  | 🔜 Soon  | Dockerfile optional |

Minimal deploy configuration is enough since the app is stateless.

---

# 🧪 Example: Send Notification From Go Backend

```go
reqBody := map[string]interface{}{
    "to": expoToken,
    "title": "Payment Received",
    "body": "You got 100₺",
}

jsonData, _ := json.Marshal(reqBody)

http.Post(
    "http://gateway-server/api/notifications/send",
    "application/json",
    bytes.NewReader(jsonData),
)
```

---

# 🧩 Roadmap

| Feature                | Status |
| ---------------------- | ------ |
| Single notification    | ✅     |
| Batch notifications    | ✅     |
| Token validation       | ✅     |
| Unified error handling | ✅     |
| Logging (Pino/Winston) | 🔜     |
| Rate limiting          | 🔜     |
| Queue support (BullMQ) | 🔜     |
| Dockerfile             | 🔜     |
| E2E Tests (SuperTest)  | 🔜     |

---

# 👨‍💻 Author

**Expo Notification Gateway — by Kaan Caman**
Lightweight, fast, clean, and perfect companion for the Mini-Pay backend.
