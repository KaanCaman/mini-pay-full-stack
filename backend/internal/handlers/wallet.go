package handlers

import (
	"mini-pay-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// GetBalance returns current user's wallet balance
// GetBalance giriş yapan kullanıcının bakiyesini döndürür
func GetBalance(walletService *services.WalletService) fiber.Handler {
	return func(c *fiber.Ctx) error {

		// Extract user_id stored by AuthMiddleware
		// AuthMiddleware tarafından saklanan user_id değerini al
		userID := uint(c.Locals("user_id").(float64))

		balance, err := walletService.GetBalance(userID)
		if err != nil {
			return fiber.NewError(fiber.StatusNotFound, "Wallet not found")
		}

		// Convert cents → float for display
		// Kuruşu gösterim için çevir
		return c.JSON(fiber.Map{
			"balance": float64(balance) / 100.0,
		})
	}
}
