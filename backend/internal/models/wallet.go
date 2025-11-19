package models

// Wallet represents a user's wallet record stored in database
// Wallet, kullanıcının veritabanındaki cüzdan kaydını temsil eder
type Wallet struct {
	MyModel

	// UserID links wallet to a specific user. One user = one wallet.
	// UserID, cüzdanı bir kullanıcıya bağlar. Bir kullanıcı = bir cüzdan.
	UserID uint `gorm:"uniqueIndex;column:userID" json:"userID"`

	// Balance stores money in integer cents, not floating point.
	// Balance, para değerini float değil kuruş bazlı integer olarak saklar.
	Balance int64 `json:"balance"`
}
