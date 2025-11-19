package database

import (
	"errors"
	"mini-pay-backend/internal/config"
	"mini-pay-backend/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// GormDB Struct
// This struct holds the actual database connection.
// Bu struct gerçek veritabanı bağlantısını tutar.
type GormDB struct {
	db *gorm.DB
}

// NewGormDB
// Creates and initializes a new SQLite database using GORM,
// returns a GormDB instance implementing the DB interface.
//
// GORM kullanarak yeni bir SQLite veritabanı oluşturur,
// DB arayüzünü uygulayan bir GormDB örneği döndürür.
func NewGormDB(cfg *config.AppConfig) (*GormDB, error) {
	var dialector gorm.Dialector

	if cfg.DBDriver == "sqlite" {
		dialector = sqlite.Open(cfg.DBName)
	} else {
		return nil, errors.New("unsupported DB driver")
	}

	// Opens a SQLite database file named "mini_pay.db".
	// "mini_pay.db" isminde bir SQLite veritabanı dosyasını açar.
	database, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		// If an error occurs, return it to the caller.
		// Bir hata olursa, çağırana hatayı döndürür.
		return nil, err

	}
	// Set SQLite pragmas for better performance
	// Daha iyi performans için SQLite pragmaları ayarlar
	database.Exec("PRAGMA journal_mode = WAL;")
	database.Exec("PRAGMA synchronous = NORMAL;")

	// Run database migrations
	// Veritabanı migrasyonlarını çalıştırır
	database.AutoMigrate(&models.User{})
	database.AutoMigrate(&models.Wallet{})
	database.AutoMigrate(&models.Transaction{})

	// Return a new GormDB containing the opened database connection.
	// Açılan veritabanı bağlantısını içeren yeni bir GormDB döndürür.
	return &GormDB{db: database}, nil
}

// GetDB
// Provides access to the actual GORM database instance.
// Gerçek GORM veritabanı bağlantısına erişim sağlar.
func (g *GormDB) GetDB() *gorm.DB {
	return g.db
}
