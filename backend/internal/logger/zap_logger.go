package logger

import (
	"go.uber.org/zap"
)

// ZapLogger struct holds the zap logger instance
// ZapLogger struct'u zap logger örneğini tutar
type ZapLogger struct {
	logger *zap.Logger
}

// NewZapLogger initializes production zap logger
// NewZapLogger production zap logger'ı başlatır
func NewZapLogger() (*ZapLogger, error) {
	l, err := zap.NewProduction()
	if err != nil {
		return nil, err
	}

	return &ZapLogger{logger: l}, nil
}

// Info logs an informational message
// Info bilgilendirme mesajı loglar
func (z *ZapLogger) Info(msg string, fields ...map[string]interface{}) {
	if len(fields) > 0 {
		z.logger.Sugar().Infow(msg, fields[0])
		return
	}
	z.logger.Sugar().Infow(msg)
}

// Error logs an error message
// Error hata mesajı loglar
func (z *ZapLogger) Error(msg string, fields ...map[string]interface{}) {
	if len(fields) > 0 {
		z.logger.Sugar().Errorw(msg, fields[0])
		return
	}
	z.logger.Sugar().Errorw(msg)
}
