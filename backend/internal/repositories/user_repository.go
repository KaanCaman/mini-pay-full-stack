package repositories


import (
	"mini-pay-backend/internal/database"
	"mini-pay-backend/internal/models"
)

// UserRepository handles database operations for User
// UserRepository, User modeli için veritabanı işlemlerini yönetir
type UserRepository struct {
	db database.DB
}

// Constructor function to create repository instance
// Repository örneği oluşturmak için constructor fonksiyon
func NewUserRepository(db database.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create a new user in DB
// Yeni kullanıcıyı veritabanına kaydet
func (r *UserRepository) Create(user *models.User) error {
	return r.db.GetDB().Create(user).Error
}

// Find user by email
// Kullanıcıyı email ile bul
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.GetDB().Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
