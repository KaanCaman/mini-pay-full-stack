package database

import "gorm.io/gorm"

// DB Interface
// This interface defines behavior for database implementations.
// Bu arayüz, veritabanı implementasyonlarının sahip olması gereken davranışı tanımlar.
//
// Why do we use this?
// It allows us to abstract the database layer.
// Different database drivers or mocks can be swapped easily.
//
// Veritabanı katmanını soyutlar.
// Farklı veritabanları veya mock'lar kolayca değiştirilebilir.
//
// Key Benefit:
// High testability and loose coupling.
// Kolay test edilebilirlik ve gevşek bağımlılık.
type DB interface {
	// GetDB
	// Returns the underlying *gorm.DB instance.
	// İçteki *gorm.DB bağlantısını döndürür.
	GetDB() *gorm.DB
}
