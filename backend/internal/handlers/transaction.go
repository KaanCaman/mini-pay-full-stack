package handlers

import (
	"mini-pay-backend/internal/services"

	"github.com/gofiber/fiber/v2"
)

// GetTransactionHistory returns the logged user's transaction list
// GetTransactionHistory giriş yapan kullanıcının işlem geçmişini döndürür
func GetTransactionHistory(transactionService *services.TransactionService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := uint(c.Locals("user_id").(float64))

		history, err := transactionService.GetHistory(userID)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "Failed to retrieve transaction history")
		}

		return c.JSON(fiber.Map{
			"user_id":      userID,
			"transactions": history,
		})
	}
}
