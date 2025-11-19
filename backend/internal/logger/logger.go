package logger

// Logger interface defines log behavior
// Logger arayüzü loglama davranışını tanımlar
type Logger interface {
	Info(msg string, fields ...map[string]interface{})
	Error(msg string, fields ...map[string]interface{})
	Warn(msg string, fields ...map[string]interface{})
}
