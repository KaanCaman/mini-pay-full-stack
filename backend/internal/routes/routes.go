package routes

import (
	"mini-pay-backend/internal/database"
	"mini-pay-backend/internal/handlers"
	"mini-pay-backend/internal/logger"
	"mini-pay-backend/internal/middleware"
	"mini-pay-backend/internal/repositories"
	"mini-pay-backend/internal/services"
	"mini-pay-backend/internal/utils"
	"time"

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

	// Rate limit : max 3 req per 10 minutes /register
	// Register route’una 10 dakikada en fazla 3 istek izni ver
	app.Post("/register", middleware.RateLimiter(3, 10*time.Minute), handlers.Register(authService))

	// Rate limit : max 5 req per minute /login
	// Login route’una dakikada en fazla 5 istek izni ver
	app.Post("/login", middleware.RateLimiter(5, time.Minute), handlers.Login(authService))

	// Rate limit : max 5 req per minute /me
	// /me route’una dakikada en fazla 5 istek izni ver
	meGroup := app.Group("/me", middleware.AuthMiddleware(), middleware.RateLimiter(5, time.Minute))
	meGroup.Get("/", func(c *fiber.Ctx) error {

		// Access logged user id
		// Giriş yapan kullanıcının ID’sine eriş
		userID := c.Locals("userID")

		return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Token is valid", fiber.Map{
			"userID": userID,
		})
	})

	// Wallet routes
	// Cüzdan route’ları

	// Protected by AuthMiddleware and RateLimiter (45 req/minute)
	// AuthMiddleware ve RateLimiter (dakikada 45 istek) ile korunur
	auth := app.Group("/wallet", middleware.AuthMiddleware(), middleware.RateLimiter(45, time.Minute))

	// ballance, deposit, withdraw, transfer, history endpoints
	auth.Get("/balance", handlers.GetBalance(walletService))
	auth.Post("/deposit", handlers.Deposit(walletService))
	auth.Post("/withdraw", handlers.Withdraw(walletService))
	auth.Post("/transfer", handlers.Transfer(walletService, db.GetDB()))
	auth.Get("/history", handlers.GetTransactionHistory(transactionService))

	// Test endpoint
	app.Get("/", middleware.RateLimiter(10, time.Minute), func(c *fiber.Ctx) error {
		return utils.Success(
			c,
			fiber.StatusOK,
			utils.CodeOK,
			"Mini Pay Backend is running!",
			nil,
		)
	})
}
