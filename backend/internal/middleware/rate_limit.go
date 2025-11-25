package middleware

import (
	"mini-pay-backend/internal/utils"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// RateLimiter returns a Fiber middleware that limits incoming requests.
// RateLimiter, gelen istekleri sınırlandıran bir Fiber middleware döndürür.
//
// This middleware protects the API from brute-force, flooding,
//
//	and prevents excessive traffic per client IP.
//
// Bu middleware API’yi brute-force saldırılarından, aşırı trafikten
//
//	ve IP başına çok fazla isteğin gelmesinden korur.
func RateLimiter(maxRequests int, window time.Duration) fiber.Handler {

	// Fiber's built-in limiter supports:
	// - per-IP tracking
	// - expiring counters
	// - smooth limiting
	return limiter.New(limiter.Config{

		// Limit X requests per period
		// Belirtilen sürede X istek izni verir
		Max: maxRequests,

		// Duration of the window
		// Limit penceresinin süresi
		Expiration: window,

		// Called when limit is exceeded
		// Limit aşıldığında çalışır
		LimitReached: func(c *fiber.Ctx) error {
			// Retry-After header: tells the client when to retry
			// Retry-After header: istemciye ne zaman tekrar deneyebileceğini bildirir
			c.Set("Retry-After", window.String())

			return utils.TooManyRequestsError(c, utils.CodeRateLimitExceeded, "Rate limit exceeded")
		},
	})
}
