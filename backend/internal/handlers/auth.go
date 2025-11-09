package handlers

import (
	"mini-pay-backend/internal/services"

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
			return fiber.NewError(fiber.StatusBadRequest, "Invalid request")
		}

		if err := authService.Register(body.Email, body.Password); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "User already exists or invalid input")
		}

		return c.JSON(fiber.Map{"message": "Registration successful ✅"})
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
			return fiber.NewError(fiber.StatusBadRequest, "Invalid request")
		}

		token, err := authService.Login(body.Email, body.Password)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "Invalid email or password")
		}

		return c.JSON(fiber.Map{"token": token})
	}
}
