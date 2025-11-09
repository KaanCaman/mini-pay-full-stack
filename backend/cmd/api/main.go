package main

import (
	"log"

	"mini-pay-backend/internal/database"
	"mini-pay-backend/internal/logger"
	"mini-pay-backend/internal/routes"

	"github.com/gofiber/fiber/v2"
)

func main() {

	// Logger init
	appLogger, err := logger.NewZapLogger()
	if err != nil {
		log.Fatal("Logger failed to start:", err)
	}
	appLogger.Info("Application starting...")

	// DB init
	db, err := database.NewGormDB()
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
	appLogger.Info("Server running on port 3000")
	app.Listen(":3000")
}
