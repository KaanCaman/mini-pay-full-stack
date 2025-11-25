package handlers

import (
	"mini-pay-backend/internal/sanitize"
	"mini-pay-backend/internal/services"
	"mini-pay-backend/internal/utils"
	"mini-pay-backend/internal/validation"

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

		// Parse request body
		// İstek gövdesini ayrıştır
		if err := c.BodyParser(&body); err != nil {
			return utils.BadRequestError(c, utils.CodeValidationErr, "Invalid request body")
		}

		// SANITIZATION (General Hardening)
		// Girdi temizliği (Injection önleme)
		body.Email = sanitize.CleanEmail(body.Email)
		body.Password = sanitize.CleanPassword(body.Password)

		// Request Validation
		// İstek Validasyonu
		var vErr []validation.FieldError

		// Validate email format
		// Email formatını doğrula
		if fe := validation.ValidateEmail("email", body.Email); fe != nil {
			vErr = append(vErr, *fe)
		}

		// Validate password length
		// Parola uzunluğunu doğrula
		if fe := validation.ValidateMinLen("password", body.Password, 6); fe != nil {
			vErr = append(vErr, *fe)
		}

		// If there are validation errors, return bad request
		// Eğer doğrulama hataları varsa, bad request döndür
		if len(vErr) > 0 {
			//  Combine all field errors into a single human-readable message.
			//  Tüm alan hatalarını tek bir okunabilir mesajda birleştir.
			return utils.BadRequestError(c, utils.CodeValidationErr, validation.JoinErrors(vErr))
		}

		// Register user
		// Kullanıcıyı kaydet
		if err := authService.Register(body.Email, body.Password); err != nil {
			// Burada ileride err türüne göre farklı code da dönebilirsin
			// Later you can switch on err to return specific codes
			return utils.BadRequestError(c, utils.CodeAuthUserExists, "User already exists or invalid input")
		}

		// Success response
		return utils.Success(c, fiber.StatusCreated, utils.CodeOK, "Registration successful", nil)
	}
}

// Login handler processes user authentication requests
// Login handler, kullanıcı giriş isteklerini işler
func Login(authService *services.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {

		// Parse request body
		// İstek gövdesini ayrıştır
		var body struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		// Handle body parsing error
		// İstek gövdesi ayrıştırma hatasını işle
		if err := c.BodyParser(&body); err != nil {
			return utils.BadRequestError(c, utils.CodeValidationErr, "Invalid request body")
		}

		// Girdi temizliği (Injection önleme)
		body.Email = sanitize.CleanEmail(body.Email)
		body.Password = sanitize.CleanPassword(body.Password)

		// Validate email format
		// Email formatını doğrula
		if fe := validation.ValidateEmail("email", body.Email); fe != nil {
			return utils.BadRequestError(c, utils.CodeValidationInvalidEmail, validation.JoinErrors([]validation.FieldError{*fe}))
		}

		// Validate password length
		// Parola uzunluğunu doğrula
		if fe := validation.ValidateMinLen("password", body.Password, 6); fe != nil {
			return utils.BadRequestError(c, utils.CodeValidationMinLength, validation.JoinErrors([]validation.FieldError{*fe}))
		}

		// Authenticate user
		// Kullanıcıyı doğrula
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
