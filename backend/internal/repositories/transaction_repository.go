package repositories

import (
	"mini-pay-backend/internal/database"
	"mini-pay-backend/internal/models"

	"gorm.io/gorm"
)

// TransactionRepository handles DB operations for transactions
// TransactionRepository, transaction veritabanı işlemlerini yönetir
type TransactionRepository struct {
	db database.DB
}

func NewTransactionRepository(db database.DB) *TransactionRepository {
	return &TransactionRepository{db: db}
}

// Create saves a new transaction record
// Create yeni bir transaction kaydı oluşturur
func (r *TransactionRepository) Create(tx *gorm.DB, model *models.Transaction) error {
	return tx.Create(model).Error
}

// CreateStandalone saves a new transaction record without a transaction context
// CreateStandalone transaction bağlamı olmadan yeni bir transaction kaydı oluşturur
func (r *TransactionRepository) CreateStandalone(tx *models.Transaction) error {
	return r.db.GetDB().Create(tx).Error
}

// FindByUser retrieves all transactions for a user, newest first
// FindByUser bir kullanıcının tüm işlemlerini döndürür (yeniden eskiye)
func (r *TransactionRepository) FindByUser(userID uint) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := r.db.GetDB().Where("userID = ?", userID).
		Order("createdAt DESC").Find(&transactions).Error
	return transactions, err
}
