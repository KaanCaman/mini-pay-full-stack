import express from "express";
import notificationRoutes from "./routes/notficationRoutes";

// Create express app instance
// Express uygulama instance'ını oluştur
const app = express();

// Built-in JSON body parser
// JSON gövdeyi parse eden middleware
app.use(express.json());

// Health check route (will keep it simple for now)
// Basit bir health check endpoint'i
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Expo Notification Gateway",
    uptime: process.uptime(),
  });
});

// notification routes
// bildirim endpoint'leri
app.use("/api/notifications", notificationRoutes);

// We will add /send and other routes in the next step
// Bir sonraki adımda /send ve diğer endpoint'leri ekleyeceğiz
export default app;
