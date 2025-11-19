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
		"userID": userID,
	})

	wallet, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		s.log.Error("Wallet not found for user", map[string]interface{}{
			"userID": userID,
		})
		return 0, err
	}

	s.log.Info("Wallet balance retrieved", map[string]interface{}{
		"userID": userID,
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
		s.log.Error("Wallet not found", map[string]interface{}{"userID": userID})
		return err
	}

	wallet.Balance += amount

	if err := s.walletRepo.Update(wallet); err != nil {
		s.log.Error("Deposit failed", map[string]interface{}{"userID": userID})
		return err
	}

	// RECORD TRANSACTION
	s.transactionService.Record(userID, "deposit", amount, wallet.Balance, nil)

	s.log.Info("Deposit successful", map[string]interface{}{
		"userID": userID,
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
		s.log.Error("Wallet not found", map[string]interface{}{"userID": userID})
		return err
	}

	// Business rule check - user cannot withdraw more money than their current balance.
	// İş kuralı kontrolü - kullanıcı mevcut bakiyesinden daha fazla para çekemez.
	if wallet.Balance < amount {

		// Log a warning (not an error), because this is an expected scenario,
		//     not a system failure. It helps monitoring user behavior without polluting error logs.
		// Bu beklenen bir durum olduğu için hata değil, uyarı seviyesi olarak loglanır.
		//     Sistem hatası değildir, sadece kullanıcı davranışını izlemek için kaydedilir.
		s.log.Warn("Insufficient funds", map[string]interface{}{
			"userID": userID, // ID of the user attempting the withdrawal
			// Para çekme girişiminde bulunan kullanıcının ID'si
			"balance": wallet.Balance, // Current balance of the user
			// Kullanıcının mevcut bakiyesi
			"attempt": amount, // Amount the user tried to withdraw
			// Kullanıcının çekmeye çalıştığı miktar
		})

		// Stop the operation and return a business error. Handler will convert this into an API response.
		// İşlemi durdurur ve bir iş kuralı hatası döner. Handler bunu API cevabına dönüştürür.
		return errors.New("insufficient funds")
	}

	wallet.Balance -= amount

	if err := s.walletRepo.Update(wallet); err != nil {
		s.log.Error("Withdraw failed", map[string]interface{}{"userID": userID})
		return err
	}

	// RECORD TRANSACTION
	s.transactionService.Record(userID, "withdraw", amount, wallet.Balance, nil)

	s.log.Info("Withdraw successful", map[string]interface{}{
		"userID": userID,
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

		// Business rule check - user cannot withdraw more money than their current balance.
		// İş kuralı kontrolü - kullanıcı mevcut bakiyesinden daha fazla para çekemez.
		if fromWallet.Balance < amount {

			// Log a warning (not an error), because this is an expected scenario,
			//     not a system failure. It helps monitoring user behavior without polluting error logs.
			// Bu beklenen bir durum olduğu için hata değil, uyarı seviyesi olarak loglanır.
			//     Sistem hatası değildir, sadece kullanıcı davranışını izlemek için kaydedilir.
			s.log.Warn("Insufficient funds", map[string]interface{}{
				"fromUserId": fromUserID, // ID of the user attempting the withdrawal
				// Para çekme girişiminde bulunan kullanıcının ID'si
				"balance": fromWallet.Balance, // Current balance of the user
				// Kullanıcının mevcut bakiyesi
				"attempt": amount, // Amount the user tried to withdraw
				// Kullanıcının çekmeye çalıştığı miktar
			})

			// Stop the operation and return a business error. Handler will convert this into an API response.
			// İşlemi durdurur ve bir iş kuralı hatası döner. Handler bunu API cevabına dönüştürür.
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
		// İŞLEM KAYITLARI OLUŞTUR (HER İKİ KULLANICI İÇİN)

		// For sender
		// Gönderen için
		if err := s.transactionService.RecordWithTx(
			tx,
			fromUserID,
			"transfer_sent",
			amount,
			fromWallet.Balance,
			&toUserID,
		); err != nil {
			return err
		}

		// For receiver
		// Alıcı için
		if err := s.transactionService.RecordWithTx(
			tx,
			toUserID,
			"transfer_received",
			amount,
			toWallet.Balance,
			&fromUserID,
		); err != nil {
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
