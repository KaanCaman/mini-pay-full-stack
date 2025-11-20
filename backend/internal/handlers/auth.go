package handlers

import (
	"mini-pay-backend/internal/services"
	"mini-pay-backend/internal/utils"

	"github.com/gofiber/fiber/v2"
)

// Register handler processes user registration requests
// Register handler, kullanıcı kayıt isteklerini işler
func Register(authService *services.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {

		var body struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := c.BodyParser(&body); err != nil {
			return utils.BadRequestError(c, utils.CodeValidationErr, "Invalid request body")
		}

		if err := authService.Register(body.Email, body.Password); err != nil {
			// Burada ileride err türüne göre farklı code da dönebilirsin
			// Later you can switch on err to return specific codes
			return utils.BadRequestError(c, utils.CodeAuthUserExists, "User already exists or invalid input")
		}

		return utils.Success(c, fiber.StatusCreated, utils.CodeOK, "Registration successful", nil)
	}
}

// Login handler processes user authentication requests
// Login handler, kullanıcı giriş isteklerini işler
func Login(authService *services.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {

		var body struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := c.BodyParser(&body); err != nil {
			return utils.BadRequestError(c, utils.CodeValidationErr, "Invalid request body")
		}

		token, userID, err := authService.Login(body.Email, body.Password)
		if err != nil {
			return utils.UnauthorizedError(c, utils.CodeAuthInvalidCreds, "Invalid email or password")
		}

		return utils.Success(c, fiber.StatusOK, utils.CodeOK, "Login successful", fiber.Map{
			"token":  token,
			"userID": userID,
		})
	}
}
