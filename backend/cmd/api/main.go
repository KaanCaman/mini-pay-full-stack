package main

import (
	"mini-pay-backend/internal/app"
	"mini-pay-backend/internal/config"
)

func main() {
	// Load configuration
	// Konfigürasyonu yükle
	cfg := config.LoadConfig()

	// Create application with app package.
	// Uygulamayı app paketi ile oluştur.
	app, _, appLogger := app.CreateApp(cfg)

	// Start server
	appLogger.Info("Server running on port " + cfg.AppPort)
	app.Listen(":" + cfg.AppPort)
}
