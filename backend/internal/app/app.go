package app

import (
	"log"
	"mini-pay-backend/internal/config"
	"mini-pay-backend/internal/database"
	"mini-pay-backend/internal/logger"
	"mini-pay-backend/internal/routes"
	"mini-pay-backend/internal/utils"

	"github.com/gofiber/fiber/v2"
)

// CreateApp initializes all application components and prepares them
// CreateApp uygulamanın tüm bileşenlerini başlatır ve hazır hale getirir
func CreateApp(cfg *config.AppConfig) (*fiber.App, database.DB, logger.Logger) {
	// Load JWT settings
	// JWT ayarlarını yükle
	utils.InitJWT(cfg.JWTSecret)

	// Initialize logger
	// Logger'ı başlat
	appLogger, err := logger.NewZapLogger(cfg.LogLevel)
	if err != nil {
		log.Fatal("Logger failed to start:", err)
	}

	// Establish database connection
	// Veritabanı bağlantısını kur
	//
	// Uses DB_NAME from config (critical for testing!)
	// Config'den gelen DB_NAME kullanılır (test için kritik!)
	db, err := database.NewGormDB(cfg)
	if err != nil {
		appLogger.Error("Database connection failed")
		log.Fatal(err)
	}

	// Create Fiber application
	// Fiber uygulamasını oluştur
	app := fiber.New(
	/*
			fiber.Config{
			AppName: "MiniPay API",
			ErrorHandler: func(c *fiber.Ctx, err error) error {
				appLogger.Error("Fiber Error: " + err.Error())
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Internal Server Error",
				})
			},
		}
	*/
	)

	// Register routes
	// Route'ları kaydet
	routes.RegisterRoutes(app, db, appLogger)

	// Return ready application
	// Hazır uygulamayı döndür
	return app, db, appLogger
}
