package services

import (
	"errors"
	"mini-pay-backend/internal/logger"
	"mini-pay-backend/internal/repositories"

	"gorm.io/gorm"
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

// Deposit adds funds to the user's wallet
// Deposit kullanıcı cüzdanına para ekler
func (s *WalletService) Deposit(userID uint, amount int64) error {
	if amount <= 0 {
		return errors.New("invalid deposit amount")
	}

	wallet, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		s.log.Error("Wallet not found", map[string]interface{}{"user_id": userID})
		return err
	}

	wallet.Balance += amount
	if err := s.walletRepo.Update(wallet); err != nil {
		s.log.Error("Deposit failed", map[string]interface{}{"user_id": userID})
		return err
	}

	s.log.Info("Deposit successful", map[string]interface{}{
		"user_id": userID,
		"amount":  amount,
		"balance": wallet.Balance,
	})
	return nil
}

// Withdraw subtracts funds from wallet if balance is sufficient
// Withdraw, bakiyeden yeterli para varsa çeker
func (s *WalletService) Withdraw(userID uint, amount int64) error {
	if amount <= 0 {
		return errors.New("invalid withdraw amount")
	}

	wallet, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		s.log.Error("Wallet not found", map[string]interface{}{"user_id": userID})
		return err
	}

	if wallet.Balance < amount {
		s.log.Error("Insufficient funds", map[string]interface{}{
			"user_id": userID,
			"balance": wallet.Balance,
			"attempt": amount,
		})
		return errors.New("insufficient funds")
	}

	wallet.Balance -= amount
	if err := s.walletRepo.Update(wallet); err != nil {
		s.log.Error("Withdraw update failed", map[string]interface{}{"user_id": userID})
		return err
	}

	s.log.Info("Withdraw successful", map[string]interface{}{
		"user_id": userID,
		"amount":  amount,
		"balance": wallet.Balance,
	})
	return nil
}

// Transfer sends money between two users atomically
// Transfer iki kullanıcı arasında para transferini atomic şekilde yapar
func (s *WalletService) Transfer(db *gorm.DB, fromUserID, toUserID uint, amount int64) error {
	if amount <= 0 {
		return errors.New("invalid transfer amount")
	}
	if fromUserID == toUserID {
		return errors.New("cannot transfer to self")
	}

	return db.Transaction(func(tx *gorm.DB) error {
		fromWallet, err := s.walletRepo.FindByUserID(fromUserID)
		if err != nil {
			return err
		}
		toWallet, err := s.walletRepo.FindByUserID(toUserID)
		if err != nil {
			return err
		}

		if fromWallet.Balance < amount {
			s.log.Error("Insufficient funds for transfer", map[string]interface{}{
				"from_user": fromUserID,
				"balance":   fromWallet.Balance,
				"attempt":   amount,
			})
			return errors.New("insufficient funds")
		}

		fromWallet.Balance -= amount
		toWallet.Balance += amount

		if err := tx.Save(fromWallet).Error; err != nil {
			return err
		}
		if err := tx.Save(toWallet).Error; err != nil {
			return err
		}

		s.log.Info("Transfer completed", map[string]interface{}{
			"from_user": fromUserID,
			"to_user":   toUserID,
			"amount":    amount,
		})

		return nil
	})
}
