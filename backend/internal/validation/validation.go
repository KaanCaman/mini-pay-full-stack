package validation

import (
	"fmt"
	"regexp"
	"strings"
)

// FieldError represents a validation problem for a single field.
// FieldError tek bir alan için oluşan validasyon hatasını temsil eder.
type FieldError struct {

	// Name of the field that failed validation
	// Validasyondan geçemeyen alanın adı
	Field string

	//Human-readable error message for this field
	// Bu alan için kullanıcıya gösterilecek hata mesajı
	Message string
}

// Error implements the error interface for FieldError.
// Error, FieldError için error arayüzünü uygular.
func (e FieldError) Error() string {
	return fmt.Sprintf("%s: %s ", e.Field, e.Message)
}

// JoinErrors combines multiple FieldError into a single string.
// JoinErrors birden fazla FieldError'u tek bir string mesajda birleştirir.
func JoinErrors(errs []FieldError) string {
	if len(errs) == 0 {
		return ""
	}

	// ["email: invalid format", "password: must be at least 6 characters"]
	// ["email: geçersiz format", "password: en az 6 karakter olmalı"]
	parts := make([]string, 0, len(errs))
	for _, e := range errs {
		parts = append(parts, e.Error())
	}
	// "email: invalid format; password: must be at least 6 characters"
	// "email: geçersiz format; password: en az 6 karakter olmalı"
	return strings.Join(parts, "; ")
}

// ─────────────────────────────
// Primitive validation helpers
// ─────────────────────────────

// ValidateRequired checks if a string is not empty.
// ValidateRequired bir string'in boş olmadığını kontrol eder.
func ValidateRequired(field, value string) *FieldError {
	if strings.TrimSpace(value) == "" {
		return &FieldError{
			Field:   field,
			Message: "is required",
		}
	}
	return nil
}

var emailRegex = regexp.MustCompile(`/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g`)

// ValidateEmail checks basic email format.
// ValidateEmail temel email formatını kontrol eder.
func ValidateEmail(field, value string) *FieldError {
	if strings.TrimSpace(value) == "" {
		return &FieldError{
			Field:   field,
			Message: "is required",
		}
	}
	if !emailRegex.MatchString(value) {
		return &FieldError{
			Field:   field,
			Message: "has invalid format",
		}
	}
	return nil
}

// ValidateMinLen checks minimum length of a string.
// ValidateMinLen bir string için minimum uzunluğu kontrol eder.
func ValidateMinLen(field, value string, min int) *FieldError {
	if len(value) < min {
		return &FieldError{
			Field:   field,
			Message: fmt.Sprintf("must be at least %d characters", min),
		}
	}
	return nil
}

// ValidatePositiveAmount ensures amount > 0.
// ValidatePositiveAmount amount değerinin 0'dan büyük olduğunu kontrol eder.
func ValidatePositiveAmount(field string, amount int64) *FieldError {
	if amount <= 0 {
		return &FieldError{
			Field:   field,
			Message: "must be greater than 0",
		}
	}
	return nil
}

// ValidatePositiveUint ensures ID > 0.
// ValidatePositiveUint uint ID'lerin 0'dan büyük olmasını sağlar.
func ValidatePositiveUint(field string, value uint) *FieldError {
	if value == 0 {
		return &FieldError{
			Field:   field,
			Message: "must be greater than 0",
		}
	}
	return nil
}
