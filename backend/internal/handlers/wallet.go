package handlers

import (
	"mini-pay-backend/internal/services"
	"mini-pay-backend/internal/utils"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
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
			return utils.NotFoundError(c, "Wallet not found")
		}

		// Convert cents → float for display
		// Kuruşu gösterim için çevir
		return c.JSON(fiber.Map{
			"balance": float64(balance) / 100.0,
		})
	}
}

// Deposit endpoint
// Kullanıcının cüzdanına para ekler
func Deposit(walletService *services.WalletService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := uint(c.Locals("user_id").(float64))

		var body struct {
			Amount int64 `json:"amount"`
		}
		if err := c.BodyParser(&body); err != nil {
			return utils.BadRequestError(c, "Invalid request body")
		}

		if err := walletService.Deposit(userID, body.Amount); err != nil {
			return utils.BadRequestError(c, err.Error())
		}

		return c.JSON(fiber.Map{"message": "Deposit successful"})
	}
}

// Withdraw endpoint
// Kullanıcının cüzdanından para çeker
func Withdraw(walletService *services.WalletService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := uint(c.Locals("user_id").(float64))

		var body struct {
			Amount int64 `json:"amount"`
		}
		if err := c.BodyParser(&body); err != nil {
			return utils.BadRequestError(c, "Invalid request body")
		}

		if err := walletService.Withdraw(userID, body.Amount); err != nil {
			return utils.BadRequestError(c, err.Error())
		}

		return c.JSON(fiber.Map{"message": "Withdraw successful"})
	}
}

// Transfer endpoint
// İki kullanıcı arasında para transferi yapar
func Transfer(walletService *services.WalletService, db any) fiber.Handler {
	return func(c *fiber.Ctx) error {
		fromUserID := uint(c.Locals("user_id").(float64))

		var body struct {
			ToUserID uint  `json:"to_user_id"`
			Amount   int64 `json:"amount"`
		}
		if err := c.BodyParser(&body); err != nil {
			return utils.BadRequestError(c, "Invalid request body")
		}

		if err := walletService.Transfer(db.(*gorm.DB), fromUserID, body.ToUserID, body.Amount); err != nil {
			return utils.BadRequestError(c, err.Error())
		}

		return c.JSON(fiber.Map{"message": "Transfer successful"})
	}
}
