package models

import (
	"gorm.io/gorm"
)

// Represents an application user as a database entity (ORM model).
// Uygulama kullanıcısını bir veritabanı varlığı (ORM modeli) olarak temsil eder.
type User struct {
	// Embeds common fields: ID, CreatedAt, UpdatedAt, DeletedAt (soft delete).
	// Sık kullanılan alanları gömer: ID, CreatedAt, UpdatedAt, DeletedAt (soft delete).
	gorm.Model

	// Unique, non-null email stored in the DB; exposed as "email" in JSON responses.
	// Veritabanında benzersiz ve boş geçilemez e-posta; JSON cevaplarında "email" olarak görünür.
	Email string `gorm:"uniqueIndex;not null" json:"email"`

	// Password hash stored in DB; never exposed in JSON (json:"-").
	// Şifre hash’i DB’de saklanır; JSON’da asla gösterilmez (json:"-").
	PasswordHash string `gorm:"not null" json:"-"`
}
