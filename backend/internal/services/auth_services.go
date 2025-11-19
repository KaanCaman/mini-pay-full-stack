package services

import (
	"mini-pay-backend/internal/logger"
	"mini-pay-backend/internal/models"
	"mini-pay-backend/internal/repositories"
	"mini-pay-backend/internal/utils"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo   *repositories.UserRepository
	walletRepo *repositories.WalletRepository
	log        logger.Logger
}

// Updated constructor to inject walletRepo too
// Constructor güncellendi → walletRepo enjekte ediliyor
func NewAuthService(
	userRepo *repositories.UserRepository,
	walletRepo *repositories.WalletRepository,
	log logger.Logger,
) *AuthService {
	return &AuthService{userRepo: userRepo, walletRepo: walletRepo, log: log}
}

// Register handles user creation + wallet creation
// Register kullanıcı oluşturur ve otomatik olarak cüzdan açar
func (s *AuthService) Register(email, password string) error {

	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		s.log.Error("Password hashing failed")
		return err
	}

	user := models.User{
		Email:        email,
		PasswordHash: string(hash),
	}

	if err := s.userRepo.Create(&user); err != nil {
		s.log.Error("User creation failed")
		return err
	}

	// Create wallet with balance = 0
	// Cüzdan oluşturulur, başlangıç bakiyesi = 0
	wallet := models.Wallet{
		UserID:  user.ID,
		Balance: 0,
	}

	if err := s.walletRepo.Create(&wallet); err != nil {
		s.log.Error("Wallet creation failed", map[string]interface{}{
			"userID": user.ID,
		})
		// optional: rollback user creation
		return err
	}

	s.log.Info("User and wallet created successfully", map[string]interface{}{
		"userID":   user.ID,
		"wallet_id": wallet.ID,
		"balance":   wallet.Balance,
	})

	return nil
}

// Login verifies user credentials and returns JWT token
// Login kullanıcı bilgilerini doğrular ve JWT token döner
func (s *AuthService) Login(email, password string) (string, error) {

	// Fetch user by email from database
	// Kullanıcıyı email üzerinden veritabanından al
	user, err := s.userRepo.FindByEmail(email)
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
