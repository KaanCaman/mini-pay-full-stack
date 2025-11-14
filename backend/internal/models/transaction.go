package models

import (
	"gorm.io/gorm"
)

// Transaction represents a single wallet operation
// Transaction, tek bir cüzdan işlemini temsil eder
type Transaction struct {
	gorm.Model

	// UserID is the owner of the wallet performing the operation
	// UserID, işlemi yapan cüzdan sahibini belirtir
	UserID uint `json:"user_id"`

	// Type indicates transaction category: deposit, withdraw, transfer
	// Type işlemin türünü belirtir: deposit, withdraw, transfer
	Type string `gorm:"type:text;not null" json:"type"`

	// Amount is stored in cents for accuracy
	// Amount, hassasiyet için kuruş cinsinden saklanır
	Amount int64 `json:"amount"`

	// TargetUserID is used only for transfer operations
	// TargetUserID sadece transfer işlemlerinde kullanılır
	TargetUserID *uint `json:"target_user_id,omitempty"`

	// BalanceAfter represents user's balance after the transaction
	// BalanceAfter, işlem sonrası kullanıcının bakiyesini gösterir
	BalanceAfter int64 `json:"balance_after"`
}
