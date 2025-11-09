package services

import (
	"mini-pay-backend/internal/logger"
	"mini-pay-backend/internal/models"
	"mini-pay-backend/internal/repositories"
	"mini-pay-backend/internal/utils"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// AuthService encapsulates authentication business logic
// AuthService kimlik doğrulama işlem mantığını kapsüller
type AuthService struct {
	repo *repositories.UserRepository
	log  logger.Logger
}

// NewAuthService creates a new service instance with dependencies injected
// NewAuthService bağımlılıkları enjekte edilerek yeni bir servis örneği oluşturur
func NewAuthService(repo *repositories.UserRepository, log logger.Logger) *AuthService {
	return &AuthService{repo: repo, log: log}
}

// Register handles user creation and password hashing
// Register kullanıcı kaydı ve şifre hashleme işlemini gerçekleştirir
func (s *AuthService) Register(email, password string) error {

	// Hash the user's password securely
	// Kullanıcının şifresini güvenli bir şekilde hash'le
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		s.log.Error("Password hashing failed")
		return err
	}

	// Construct user model
	// Kullanıcı modelini oluştur
	user := models.User{
		Email:        email,
		PasswordHash: string(hash),
	}

	// Save user via repository
	// Kullanıcıyı repository aracılığı ile kaydet
	if err := s.repo.Create(&user); err != nil {
		s.log.Error("User creation failed")
		return err
	}

	s.log.Info("User registered successfully", map[string]interface{}{
		"email": user.Email,
		"id":    user.ID,
	})

	return nil
}

// Login verifies user credentials and returns JWT token
// Login kullanıcı bilgilerini doğrular ve JWT token döner
func (s *AuthService) Login(email, password string) (string, error) {

	// Fetch user by email from database
	// Kullanıcıyı email üzerinden veritabanından al
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return "", fiber.ErrUnauthorized
	}

	// Compare stored hash with given password
	// Saklanan hash ile kullanıcı giriş şifresini karşılaştır
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", fiber.ErrUnauthorized
	}

	// Create JWT token tied to user ID
	// Kullanıcı ID'sine bağlı JWT token oluştur
	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		s.log.Error("Token generation failed")
		return "", err
	}

	s.log.Info("User logged in", map[string]interface{}{
		"email": user.Email,
		"id":    user.ID,
	})

	return token, nil
}
