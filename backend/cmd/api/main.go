package main

import (
	"log"

	"mini-pay-backend/internal/config"
	"mini-pay-backend/internal/database"
	"mini-pay-backend/internal/logger"
	"mini-pay-backend/internal/routes"
	"mini-pay-backend/internal/utils"

	"github.com/gofiber/fiber/v2"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	utils.InitJWT(cfg.JWTSecret)

	// Logger init
	appLogger, err := logger.NewZapLogger(cfg.LogLevel)
	if err != nil {
		log.Fatal("Logger failed to start:", err)
	}
	appLogger.Info("Application starting...")

	// DB init
	db, err := database.NewGormDB(cfg)
	if err != nil {
		appLogger.Error("Database connection failed")
		return
	}
	appLogger.Info("Database connected successfully")

	// Fiber app
	app := fiber.New()

	// Routing
	routes.RegisterRoutes(app, db, appLogger)

	// Start server
	appLogger.Info("Server running on port " + cfg.AppPort)
	app.Listen(":" + cfg.AppPort)
}
