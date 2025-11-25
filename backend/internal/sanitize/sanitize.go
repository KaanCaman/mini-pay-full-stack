package sanitize

import (
	"regexp"
	"strings"
	"unicode"
)

// sanitizeHTML removes script tags and common XSS payloads.
// sanitizeHTML script tag ve bilinen XSS payload'larını temizler.
var scriptRegex = regexp.MustCompile(`(?i)<script.*?>.*?</script>`)

// CleanString removes:
// - HTML tags
// - script injections
// - SQL special chars (limited hardening, not a parser)
// - leading/trailing spaces
// - control characters (unicode)
//
// CleanString şu öğeleri temizler:
// - HTML tagleri
// - script injection'ları
// - SQL özel karakterleri (sınırlı seviyede hardening)
// - baştaki ve sondaki boşluklar
// - unicode kontrol karakterleri
func CleanString(input string) string {
	if input == "" {
		return ""
	}

	// Remove <script> tags
	clean := scriptRegex.ReplaceAllString(input, "")

	// Remove HTML tags like <div>, <img>, <b>, <iframe>...
	// HTML tagleri temizle (<div>, <img>, <b>, <iframe> vb.)
	clean = regexp.MustCompile(`<[^>]*>`).ReplaceAllString(clean, "")

	// Remove sql special chars that are dangerous in queries
	// SQL injection riskli karakterlerin çoğunu engelle
	clean = strings.ReplaceAll(clean, "'", "")
	clean = strings.ReplaceAll(clean, `"`, "")
	clean = strings.ReplaceAll(clean, ";", "")
	clean = strings.ReplaceAll(clean, "--", "")
	clean = strings.ReplaceAll(clean, "/*", "")
	clean = strings.ReplaceAll(clean, "*/", "")

	// Remove unicode control characters
	// Unicode kontrol karakterlerini kaldır
	clean = strings.Map(func(r rune) rune {
		if unicode.IsControl(r) {
			return -1
		}
		return r
	}, clean)

	// Trim spaces
	return strings.TrimSpace(clean)
}

// CleanEmail sanitizes email string but keeps @ and dots.
// CleanEmail email string'i temizler ama @ ve . karakterlerini korur.
func CleanEmail(email string) string {
	if email == "" {
		return ""
	}

	// Basic cleanup using CleanString (except we restore @ and .)
	c := CleanString(email)

	// Remove anything except allowed email chars
	allowed := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@._-+"
	result := make([]rune, 0, len(c))

	for _, r := range c {
		if strings.ContainsRune(allowed, r) {
			result = append(result, r)
		}
	}

	return string(result)
}

// CleanPassword sanitizes password but does not remove normal chars.
// CleanPassword password'i sanitize eder ancak normal karakterleri bozmamaya çalışır.
func CleanPassword(p string) string {
	if p == "" {
		return ""
	}

	// Remove control chars
	return strings.Map(func(r rune) rune {
		if unicode.IsControl(r) {
			return -1
		}
		return r
	}, p)
}
