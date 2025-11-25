package middleware

import "github.com/gofiber/fiber/v2"

// JSONOnly enforces that incoming requests must send JSON
// and all responses are declared as JSON.
//
// Ensures client and server communicate strictly in JSON format.
// İstemci ve sunucunun sadece JSON formatında iletişim kurmasını zorunlu kılar.
func JSONOnly() fiber.Handler {
	return func(c *fiber.Ctx) error {

		// RESPONSE HEADER (Server → Client)
		c.Set("Content-Type", "application/json")

		// REQUEST VALIDATION (Client → Server)
		if content := c.Get("Content-Type"); content != "" && content != "application/json" {
			return c.Status(fiber.StatusUnsupportedMediaType).JSON(fiber.Map{
				"success": false,
				"code":    "UNSUPPORTED_CONTENT_TYPE",
				"message": "Only application/json requests are accepted.",
			})
		}

		return c.Next()
	}
}
