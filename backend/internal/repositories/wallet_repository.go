package repositories

import (
	"mini-pay-backend/internal/database"
	"mini-pay-backend/internal/models"
)

// WalletRepository handles DB queries related to wallet table
// WalletRepository, cüzdan ile ilgili DB sorgularını yönetir
type WalletRepository struct {
	db database.DB
}

// Constructor to initialize repository instance
// Repository örneğini başlatan constructor
func NewWalletRepository(db database.DB) *WalletRepository {
	return &WalletRepository{db: db}
}

// FindByUserID retrieves wallet belonging to the specified user
// FindByUserID belirtilen kullanıcıya ait cüzdanı getirir
func (r *WalletRepository) FindByUserID(userID uint) (*models.Wallet, error) {
	var wallet models.Wallet
	if err := r.db.GetDB().Where("user_id = ?", userID).First(&wallet).Error; err != nil {
		return nil, err
	}
	return &wallet, nil
}

// Update saves wallet changes into the database
// Update cüzdandaki değişiklikleri veritabanına kaydeder
func (r *WalletRepository) Update(wallet *models.Wallet) error {
	return r.db.GetDB().Save(wallet).Error
}

// Create creates a new wallet record
// Create yeni bir cüzdan kaydı oluşturur
func (r *WalletRepository) Create(wallet *models.Wallet) error {
	return r.db.GetDB().Create(wallet).Error
}
