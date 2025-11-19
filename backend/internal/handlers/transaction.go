package handlers

import (
	"mini-pay-backend/internal/services"
	"mini-pay-backend/internal/utils"

	"github.com/gofiber/fiber/v2"
)

// GetTransactionHistory returns the logged user's transaction list
// GetTransactionHistory giriş yapan kullanıcının işlem geçmişini döndürür
func GetTransactionHistory(transactionService *services.TransactionService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := uint(c.Locals("userID").(float64))

		history, err := transactionService.GetHistory(userID)
		if err != nil {
			return utils.InternalError(
				c,
				utils.CodeInternalErr,
				"Failed to retrieve transaction history",
			)
		}

		return utils.Success(
			c,
			fiber.StatusOK,
			utils.CodeTxHistoryFetched,
			"Transaction history fetched",
			fiber.Map{
				"userID":       userID,
				"transactions": history,
			},
		)
	}
}
