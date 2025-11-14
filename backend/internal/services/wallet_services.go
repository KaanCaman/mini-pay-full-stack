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
	walletRepo         *repositories.WalletRepository
	transactionService *TransactionService
	log                logger.Logger
}

// Constructor for WalletService
// WalletService için constructor
func NewWalletService(
	walletRepo *repositories.WalletRepository,
	transactionService *TransactionService,
	log logger.Logger,
) *WalletService {
	return &WalletService{
		walletRepo:         walletRepo,
		transactionService: transactionService,
		log:                log,
	}
}

// GetBalance returns user's balance
// GetBalance kullanıcının mevcut bakiyesini döndürür
func (s *WalletService) GetBalance(userID uint) (int64, error) {

	s.log.Info("WalletService.GetBalance called", map[string]interface{}{
		"user_id": userID,
	})

	wallet, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		s.log.Error("Wallet not found for user", map[string]interface{}{
			"user_id": userID,
		})
		return 0, err
	}

	s.log.Info("Wallet balance retrieved", map[string]interface{}{
		"user_id": userID,
		"balance": wallet.Balance,
	})

	return wallet.Balance, nil
}

// Deposit adds money to wallet and records transaction
// Deposit para ekler ve transaction kaydı oluşturur
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

	// RECORD TRANSACTION
	s.transactionService.Record(userID, "deposit", amount, wallet.Balance, nil)

	s.log.Info("Deposit successful", map[string]interface{}{
		"user_id": userID,
		"amount":  amount,
		"balance": wallet.Balance,
	})

	return nil
}

// Withdraw subtracts money and records transaction
// Withdraw para çeker ve transaction kaydı oluşturur
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
		s.log.Error("Withdraw failed", map[string]interface{}{"user_id": userID})
		return err
	}

	// RECORD TRANSACTION
	s.transactionService.Record(userID, "withdraw", amount, wallet.Balance, nil)

	s.log.Info("Withdraw successful", map[string]interface{}{
		"user_id": userID,
		"amount":  amount,
		"balance": wallet.Balance,
	})

	return nil
}

// Transfer moves money between two wallets atomically
// Transfer iki kullanıcı arasında para aktarır ve her iki tarafa transaction kaydı ekler
func (s *WalletService) Transfer(db *gorm.DB, fromUserID, toUserID uint, amount int64) error {

	if fromUserID == toUserID {
		return errors.New("cannot transfer to self")
	}

	if amount <= 0 {
		return errors.New("invalid transfer amount")
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
			return errors.New("insufficient funds")
		}

		// Update balances
		fromWallet.Balance -= amount
		toWallet.Balance += amount

		// Save changes
		if err := tx.Save(fromWallet).Error; err != nil {
			return err
		}
		if err := tx.Save(toWallet).Error; err != nil {
			return err
		}

		// RECORD TRANSACTIONS (BOTH USERS)

		// Sender’s transaction
		s.transactionService.Record(
			fromUserID,
			"transfer_sent",
			amount,
			fromWallet.Balance,
			&toUserID,
		)

		// Receiver’s transaction
		s.transactionService.Record(
			toUserID,
			"transfer_received",
			amount,
			toWallet.Balance,
			&fromUserID,
		)

		s.log.Info("Transfer completed", map[string]interface{}{
			"from_user": fromUserID,
			"to_user":   toUserID,
			"amount":    amount,
		})

		return nil
	})
}
