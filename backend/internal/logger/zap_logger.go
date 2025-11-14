package logger

import (
	"go.uber.org/zap"
)

// ZapLogger struct holds the zap logger instance
// ZapLogger struct'u zap logger örneğini tutar
type ZapLogger struct {
	logger *zap.SugaredLogger
}

// NewZapLogger initializes production zap logger
// NewZapLogger production zap logger'ı başlatır
func NewZapLogger(level string) (*ZapLogger, error) {
	var l *zap.Logger
	var err error

	if level == "production" {
		l, err = zap.NewProduction()
	} else {
		l, err = zap.NewDevelopment()
	}

	if err != nil {
		return nil, err
	}

	return &ZapLogger{logger: l.Sugar()}, nil
}

// convert map[string]interface{} to key-value slice
// map[string]interface{} -> key-value slice dönüştürücü
func convertFields(fields map[string]interface{}) []interface{} {
	kv := make([]interface{}, 0, len(fields)*2)
	for k, v := range fields {
		kv = append(kv, k, v)
	}
	return kv
}

// Info logs an informational message
// Info bilgilendirme mesajı loglar
func (z *ZapLogger) Info(msg string, fields ...map[string]interface{}) {
	if len(fields) > 0 {
		z.logger.Infow(msg, convertFields(fields[0])...)
		return
	}
	z.logger.Infow(msg)
}

// Error logs an error message
// Error hata mesajı loglar
func (z *ZapLogger) Error(msg string, fields ...map[string]interface{}) {
	if len(fields) > 0 {
		z.logger.Errorw(msg, convertFields(fields[0])...)
		return
	}
	z.logger.Errorw(msg)
}
