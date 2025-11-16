import "dotenv/config";
import app from "./app";

// Read port from environment or use default 4001
// Port'u environment'tan oku, yoksa varsayılan 4001'i kullan
const PORT = process.env.PORT || 4001;

// Start HTTP server
// HTTP sunucusunu başlat
app.listen(PORT, () => {
  console.log(`
=================================================
  🚀 Expo Notification Gateway is running
  🌐 Port: ${PORT}
=================================================
`);
});
