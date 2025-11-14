package config

import (
	"os"

	"github.com/joho/godotenv"
)

// AppConfig holds all configuration settings loaded from environment variables
// AppConfig tüm environment değişkenlerini tutan yapı
type AppConfig struct {
	AppEnv    string
	AppPort   string
	DBDriver  string
	DBName    string
	JWTSecret []byte
	LogLevel  string
}

// LoadConfig loads environment variables and constructs AppConfig
// LoadConfig environment değişkenlerini yükler ve AppConfig oluşturur
func LoadConfig() *AppConfig {

	// Load .env file (only in development)
	// Geliştirme ortamında .env dosyasını yükle
	_ = godotenv.Load()

	cfg := &AppConfig{
		AppEnv:    getEnv("APP_ENV", "development"),
		AppPort:   getEnv("APP_PORT", "3000"),
		DBDriver:  getEnv("DB_DRIVER", "sqlite"),
		DBName:    getEnv("DB_NAME", "mini_pay.db"),
		JWTSecret: []byte(getEnv("JWT_SECRET", "CHANGE_THIS_SECRET_LATER")),
		LogLevel:  getEnv("LOG_LEVEL", "development"),
	}

	return cfg
}

// Helper: get env or fallback
// Yardımcı: env değişkeni yoksa varsayılan değeri kullan
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
