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
			return utils.UnauthorizedError(c, utils.CodeAuthTokenMissing, "Missing or invalid token")
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
			return utils.UnauthorizedError(c, utils.CodeAuthTokenInvalid, "Invalid token")
		}

		// Extract userID from claims
		// Token claim’lerinden userID’yi al
		claims := token.Claims.(jwt.MapClaims)
		userID := claims["userID"]

		// Store userID for downstream handlers
		// Handler’ların erişebilmesi için userID’yi sakla
		c.Locals("userID", userID)

		// Continue to next handler
		// Sonraki handler’a geç
		return c.Next()
	}
}
