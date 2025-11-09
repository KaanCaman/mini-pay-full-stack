package routes

import (
	"mini-pay-backend/internal/database"
	"mini-pay-backend/internal/logger"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, db database.DB, log logger.Logger) {

	// Health check endpoint
	app.Get("/", func(c *fiber.Ctx) error {

		log.Info("Root endpoint called")

		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Mini Pay API is running...",
		})
	})
}
