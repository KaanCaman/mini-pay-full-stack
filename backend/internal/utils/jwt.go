package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Secret key used to sign the JWT tokens
// JWT tokenlarını imzalamak için kullanılan gizli anahtar
var JwtSecret = []byte("CHANGE_THIS_SECRET_LATER")

// GenerateToken creates a signed JWT token containing the user ID
// Bir kullanıcı ID’si içeren imzalı bir JWT token üretir
func GenerateToken(userID uint) (string, error) {

	// Claims represent the data stored inside the token (payload)
	// Claims, token içinde saklanan verilerdir (payload)
	claims := jwt.MapClaims{
		// Store user ID inside the token
		// Kullanıcı ID’sini token içine koy
		"user_id": userID,

		// Set expiration time (14 minute from now)
		// Token’ın geçerlilik süresi (şu andan itibaren 14 dakika)
		"exp": time.Now().Add(time.Minute * 14).Unix(),
	}

	// Create a new token with the given claims and signing method
	// Claims ve imzalama metodu ile yeni bir token oluştur
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token using the secret key and return as a string
	// Token’ı gizli anahtarla imzala ve string olarak geri döndür
	return token.SignedString(JwtSecret)
}
