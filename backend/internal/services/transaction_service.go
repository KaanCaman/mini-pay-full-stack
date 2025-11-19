package services

import (
	"mini-pay-backend/internal/logger"
	"mini-pay-backend/internal/models"
	"mini-pay-backend/internal/repositories"

	"gorm.io/gorm"
)

// TransactionService provides business logic for transaction history
// TransactionService, işlem geçmişi iş mantığını sağlar
type TransactionService struct {
	transactionRepo *repositories.TransactionRepository
	log             logger.Logger
}

func NewTransactionService(repo *repositories.TransactionRepository, log logger.Logger) *TransactionService {
	return &TransactionService{transactionRepo: repo, log: log}
}

// Record creates a transaction record
// Record yeni bir işlem kaydı oluşturur
func (s *TransactionService) Record(userID uint, txType string, amount int64, balanceAfter int64, targetUserID *uint) {
	transaction := &models.Transaction{
		UserID:       userID,
		Type:         txType,
		Amount:       amount,
		TargetUserID: targetUserID,
		BalanceAfter: balanceAfter,
	}
	if err := s.transactionRepo.CreateStandalone(transaction); err != nil {
		s.log.Error("Failed to record transaction", map[string]interface{}{
			"userID": userID,
			"type":    txType,
		})
	} else {
		s.log.Info("Transaction recorded", map[string]interface{}{
			"userID": userID,
			"type":    txType,
			"amount":  amount,
		})
	}
}

// RecordWithTx creates a transaction record within a DB transaction
// RecordWithTx, bir veritabanı işlemi içinde yeni bir işlem kaydı oluşturur
func (s *TransactionService) RecordWithTx(
	tx *gorm.DB,
	userID uint,
	txType string,
	amount int64,
	balanceAfter int64,
	targetUserID *uint,
) error {

	// Create transaction record
	// İşlem kaydı oluştur
	transaction := &models.Transaction{
		UserID:       userID,
		Type:         txType,
		Amount:       amount,
		TargetUserID: targetUserID,
		BalanceAfter: balanceAfter,
	}

	// Use the provided transaction context
	// Sağlanan işlem bağlamını kullan
	if err := s.transactionRepo.Create(tx, transaction); err != nil {
		s.log.Error("Failed to record transaction (tx)", map[string]interface{}{
			"userID": userID,
			"type":    txType,
		})
		return err
	}

	return nil
}

// GetHistory retrieves user's transaction history
// GetHistory kullanıcının işlem geçmişini döndürür
func (s *TransactionService) GetHistory(userID uint) ([]models.Transaction, error) {
	s.log.Info("Fetching transaction history", map[string]interface{}{
		"userID": userID,
	})
	return s.transactionRepo.FindByUser(userID)
}
