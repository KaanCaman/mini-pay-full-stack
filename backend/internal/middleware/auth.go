package middleware

import (
	"strings"

	"mini-pay-backend/internal/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware validates JWT token
// AuthMiddleware JWT token’ını doğrular
func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {

		// Get Authorization header
		// Authorization header değerini al
		authHeader := c.Get("Authorization")

		// Must be: "Bearer <token>"
		// Format: "Bearer <token>" olmalı
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return fiber.NewError(fiber.StatusUnauthorized, "Missing or invalid token")
		}

		// Extract token part
		// Token kısmını ayıkla
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Parse and validate token
		// Token’ı doğrula ve çözümle
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return utils.JwtSecret, nil
		})
		if err != nil || !token.Valid {
			return fiber.NewError(fiber.StatusUnauthorized, "Invalid token")
		}

		// Extract user_id from claims
		// Token claim’lerinden user_id’yi al
		claims := token.Claims.(jwt.MapClaims)
		userID := claims["user_id"]

		// Store user_id for downstream handlers
		// Handler’ların erişebilmesi için user_id’yi sakla
		c.Locals("user_id", userID)

		// Continue to next handler
		// Sonraki handler’a geç
		return c.Next()
	}
}
