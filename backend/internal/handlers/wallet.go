package handlers

import (
	"mini-pay-backend/internal/services"
	"mini-pay-backend/internal/utils"
	"mini-pay-backend/internal/validation"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetBalance returns current user's wallet balance
// GetBalance giriş yapan kullanıcının bakiyesini döndürür
func GetBalance(walletService *services.WalletService) fiber.Handler {
	return func(c *fiber.Ctx) error {

		// Extract userID stored by AuthMiddleware
		// AuthMiddleware tarafından saklanan userID değerini al
		userID := uint(c.Locals("userID").(float64))

		balance, err := walletService.GetBalance(userID)
		if err != nil {
			return utils.NotFoundError(
				c,
				utils.CodeWalletNotFound,
				"Wallet not found",
			)
		}

		return utils.Success(
			c,
			fiber.StatusOK,
			utils.CodeWalletBalanceFetched,
			"Wallet balance retrieved",
			fiber.Map{
				"userID":  userID,
				"balance": float64(balance) / 100.0,
			},
		)
	}
}

// Deposit endpoint – add funds
func Deposit(walletService *services.WalletService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := uint(c.Locals("userID").(float64))

		var body struct {
			Amount int64 `json:"amount"`
		}

		// Parse request body
		// İstek gövdesini ayrıştır
		if err := c.BodyParser(&body); err != nil {
			return utils.BadRequestError(
				c,
				utils.CodeRequestBodyInvalid,
				"Invalid request body",
			)
		}

		// Validate that amount is > 0 before hitting the service layer.
		// Service katmanına geçmeden önce amount değerinin > 0 olduğunu kontrol et.
		if fe := validation.ValidatePositiveAmount("amount", body.Amount); fe != nil {
			return utils.BadRequestError(
				c,
				utils.CodeValidationErr,
				validation.JoinErrors([]validation.FieldError{*fe}),
			)
		}

		// Perform deposit operation
		// Para yatırma işlemini gerçekleştir
		if err := walletService.Deposit(userID, body.Amount); err != nil {
			return utils.BadRequestError(
				c,
				utils.CodeWalletNotFound,
				err.Error(),
			)
		}

		// success response
		return utils.Success(
			c,
			fiber.StatusOK,
			utils.CodeWalletDepositSuccess,
			"Deposit successful",
			fiber.Map{
				"userID": userID,
				"amount": body.Amount,
			},
		)
	}
}

// Withdraw endpoint – remove funds
func Withdraw(walletService *services.WalletService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := uint(c.Locals("userID").(float64))

		var body struct {
			Amount int64 `json:"amount"`
		}

		// Parse request body
		// İstek gövdesini ayrıştır
		if err := c.BodyParser(&body); err != nil {
			return utils.BadRequestError(
				c,
				utils.CodeRequestBodyInvalid,
				"Invalid request body",
			)
		}

		// Validate that amount is > 0 before hitting the service layer.
		// Service katmanına geçmeden önce amount değerinin > 0 olduğunu kontrol et.
		if fe := validation.ValidatePositiveAmount("amount", body.Amount); fe != nil {
			return utils.BadRequestError(
				c,
				utils.CodeValidationErr,
				validation.JoinErrors([]validation.FieldError{*fe}),
			)
		}

		// Perform withdraw operation
		// Para çekme işlemini gerçekleştir
		if err := walletService.Withdraw(userID, body.Amount); err != nil {
			code := utils.CodeWalletInsufficientFunds
			if err.Error() != "insufficient funds" {
				// Daha generic bir hata kodu istersen burada değiştirebilirsin
				code = utils.CodeWalletNotFound
			}
			return utils.BadRequestError(c, code, err.Error())
		}

		// success response
		return utils.Success(
			c,
			fiber.StatusOK,
			utils.CodeWalletWithdrawSuccess,
			"Withdraw successful",
			fiber.Map{
				"userID": userID,
				"amount": body.Amount,
			},
		)
	}
}

// Transfer endpoint
// İki kullanıcı arasında para transferi yapar
func Transfer(walletService *services.WalletService, db any) fiber.Handler {
	return func(c *fiber.Ctx) error {
		fromUserID := uint(c.Locals("userID").(float64))

		var body struct {
			ToUserID uint  `json:"to_userID"`
			Amount   int64 `json:"amount"`
		}

		// Parse request body
		// İstek gövdesini ayrıştır
		if err := c.BodyParser(&body); err != nil {
			return utils.BadRequestError(
				c,
				utils.CodeRequestBodyInvalid,
				"Invalid request body",
			)
		}

		// Validate target user and amount before calling service.
		// Service'e gitmeden önce hedef kullanıcı ve amount değerlerini doğrula.
		var vErrs []validation.FieldError

		//  validate userID > 0
		if fe := validation.ValidatePositiveUint("to_userID", body.ToUserID); fe != nil {
			vErrs = append(vErrs, *fe)
		}

		// Validate that amount is > 0 before hitting the service layer.
		// Service katmanına geçmeden önce amount değerinin > 0 olduğunu kontrol et.
		if fe := validation.ValidatePositiveAmount("amount", body.Amount); fe != nil {
			vErrs = append(vErrs, *fe)
		}

		// If there are validation errors, return bad request
		// Eğer doğrulama hataları varsa, bad request döndür
		if len(vErrs) > 0 {
			msg := validation.JoinErrors(vErrs)
			return utils.BadRequestError(c, utils.CodeValidationErr, msg)
		}

		// do transfer
		// transferi yap
		if err := walletService.Transfer(db.(*gorm.DB), fromUserID, body.ToUserID, body.Amount); err != nil {
			code := utils.CodeWalletInsufficientFunds
			if err.Error() != "insufficient funds" {
				code = utils.CodeInternalErr
			}
			return utils.BadRequestError(c, code, err.Error())
		}

		return utils.Success(
			c,
			fiber.StatusOK,
			utils.CodeWalletTransferSuccess,
			"Transfer successful",
			fiber.Map{
				"fromUserId": fromUserID,
				"toUserId":   body.ToUserID,
				"amount":     body.Amount,
			},
		)
	}
}
