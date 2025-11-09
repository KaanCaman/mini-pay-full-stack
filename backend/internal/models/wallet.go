package models

import "gorm.io/gorm"

// Wallet represents a user's wallet record stored in database
// Wallet, kullanıcının veritabanındaki cüzdan kaydını temsil eder
type Wallet struct {
	// GORM base fields: ID, CreatedAt, UpdatedAt, DeletedAt
	// GORM temel alanları: ID, CreatedAt, UpdatedAt, DeletedAt
	gorm.Model

	// UserID links wallet to a specific user. One user = one wallet.
	// UserID, cüzdanı bir kullanıcıya bağlar. Bir kullanıcı = bir cüzdan.
	UserID uint `gorm:"uniqueIndex" json:"user_id"`

	// Balance stores money in integer cents, not floating point.
	// Balance, para değerini float değil kuruş bazlı integer olarak saklar.
	Balance int64 `json:"balance"`
}
