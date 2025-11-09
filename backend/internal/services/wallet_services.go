package services

import (
	"errors"
	"mini-pay-backend/internal/logger"
	"mini-pay-backend/internal/repositories"
)

// WalletService contains wallet-related business logic
// WalletService cüzdan ile ilgili iş mantığını içerir
type WalletService struct {
	walletRepo *repositories.WalletRepository
	log        logger.Logger
}

// Constructor for WalletService
// WalletService için constructor
func NewWalletService(walletRepo *repositories.WalletRepository, log logger.Logger) *WalletService {
	return &WalletService{walletRepo: walletRepo, log: log}
}

// GetBalance returns user's balance
// GetBalance kullanıcının mevcut bakiyesini döndürür
func (s *WalletService) GetBalance(userID uint) (int64, error) {

	// Log: balance check request
	// Log: bakiye kontrol isteği
	s.log.Info("WalletService.GetBalance called", map[string]interface{}{
		"user_id": userID,
	})

	wallet, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		// Log error when wallet is not found
		// Cüzdan bulunamadığında hata logla
		s.log.Error("Wallet not found for user", map[string]interface{}{
			"user_id": userID,
		})
		return 0, err
	}

	// Log successful balance retrieval
	// Başarılı bakiye alma işlemini logla
	s.log.Info("Wallet balance retrieved", map[string]interface{}{
		"user_id": userID,
		"balance": wallet.Balance,
	})

	return wallet.Balance, nil
}

// AdjustBalance increases or decreases balance
// AdjustBalance bakiyeyi artırır veya azaltır
func (s *WalletService) AdjustBalance(userID uint, amount int64) error {

	// Log incoming adjustment request
	// Bakiye güncelleme isteğini logla
	s.log.Info("WalletService.AdjustBalance called", map[string]interface{}{
		"user_id": userID,
		"amount":  amount,
	})

	wallet, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		// Log: wallet does not exist
		// Log: cüzdan bulunamadı
		s.log.Error("Wallet not found for user", map[string]interface{}{
			"user_id": userID,
		})
		return err
	}

	// Prevent negative balance
	// Negatif bakiyeyi engelle
	if wallet.Balance+amount < 0 {
		s.log.Error("Insufficient balance", map[string]interface{}{
			"user_id": userID,
			"balance": wallet.Balance,
			"attempt": wallet.Balance + amount,
		})
		return errors.New("insufficient balance")
	}

	// Apply balance adjustment
	// Bakiye güncellemesini uygula
	wallet.Balance += amount

	if err := s.walletRepo.Update(wallet); err != nil {
		// Log DB-level update failure
		// Veritabanı güncelleme hatasını logla
		s.log.Error("Failed to update wallet balance", map[string]interface{}{
			"user_id": userID,
		})
		return err
	}

	// Log final updated balance
	// Güncellenmiş son bakiyeyi logla
	s.log.Info("Wallet balance updated successfully", map[string]interface{}{
		"user_id":     userID,
		"new_balance": wallet.Balance,
	})

	return nil
}
