package utils

import "github.com/gofiber/fiber/v2"

// JSONError returns a consistent error response
// JSONError tutarlı JSON hata çıktısı döndürür
func JSONError(c *fiber.Ctx, status int, msg string) error {
	return c.Status(status).JSON(fiber.Map{
		"error":   true,
		"message": msg,
	})
}

// BadRequestError shortcut for 400 errors
func BadRequestError(c *fiber.Ctx, msg string) error {
	return JSONError(c, fiber.StatusBadRequest, msg)
}

// UnauthorizedError shortcut for 401
func UnauthorizedError(c *fiber.Ctx, msg string) error {
	return JSONError(c, fiber.StatusUnauthorized, msg)
}

// NotFoundError shortcut for 404
func NotFoundError(c *fiber.Ctx, msg string) error {
	return JSONError(c, fiber.StatusNotFound, msg)
}

// InternalError shortcut for 500
func InternalError(c *fiber.Ctx, msg string) error {
	return JSONError(c, fiber.StatusInternalServerError, msg)
}
