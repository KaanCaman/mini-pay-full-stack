package services

import (
	"mini-pay-backend/internal/logger"
	"mini-pay-backend/internal/models"
	"mini-pay-backend/internal/repositories"
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
	if err := s.transactionRepo.Create(transaction); err != nil {
		s.log.Error("Failed to record transaction", map[string]interface{}{
			"user_id": userID,
			"type":    txType,
		})
	} else {
		s.log.Info("Transaction recorded", map[string]interface{}{
			"user_id": userID,
			"type":    txType,
			"amount":  amount,
		})
	}
}

// GetHistory retrieves user's transaction history
// GetHistory kullanıcının işlem geçmişini döndürür
func (s *TransactionService) GetHistory(userID uint) ([]models.Transaction, error) {
	s.log.Info("Fetching transaction history", map[string]interface{}{
		"user_id": userID,
	})
	return s.transactionRepo.FindByUser(userID)
}
