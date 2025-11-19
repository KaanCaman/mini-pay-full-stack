package models

import (
	"time"

	"gorm.io/gorm"
)

// Custom base model with JSON camelCase keys and GORM-friendly fields
// JSON camelCase ve GORM uyumlu özel temel model
type MyModel struct {
	ID        uint           `json:"id"        gorm:"primaryKey;autoIncrement;column:id"`
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime;column:createdAt"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime;column:updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index;column:deletedAt"`
}
