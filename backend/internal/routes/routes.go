package routes

import (
	"mini-pay-backend/internal/database"
	"mini-pay-backend/internal/handlers"
	"mini-pay-backend/internal/logger"
	"mini-pay-backend/internal/middleware"
	"mini-pay-backend/internal/repositories"
	"mini-pay-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, db database.DB, log logger.Logger) {

	// Build repository
	// Repository oluştur
	userRepo := repositories.NewUserRepository(db)
	walletRepo := repositories.NewWalletRepository(db)
	transactionRepo := repositories.NewTransactionRepository(db)

	// Build service
	// Service oluştur
	authService := services.NewAuthService(userRepo, walletRepo, log)
	transactionService := services.NewTransactionService(transactionRepo, log)
	walletService := services.NewWalletService(walletRepo, transactionService, log)

	// Register routes
	// Route’ları bağla
	app.Post("/register", handlers.Register(authService))
	app.Post("/login", handlers.Login(authService))
	app.Get("/me", middleware.AuthMiddleware(), func(c *fiber.Ctx) error {

		// Access logged user id
		// Giriş yapan kullanıcının ID’sine eriş
		userID := c.Locals("user_id")

		return c.JSON(fiber.Map{
			"message": "Authenticated ✅",
			"user_id": userID,
		})
	})

	auth := app.Group("/wallet", middleware.AuthMiddleware())
	auth.Get("/balance", handlers.GetBalance(walletService))
	auth.Post("/deposit", handlers.Deposit(walletService))
	auth.Post("/withdraw", handlers.Withdraw(walletService))
	auth.Post("/transfer", handlers.Transfer(walletService, db.GetDB()))
	auth.Get("/history", handlers.GetTransactionHistory(transactionService))

	// Test endpoint
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Mini Pay API is running 🚀",
			"status":  "ok",
		})
	})
}
