package utils

// API response codes live here
// Tüm API response kodları burada tutulur
const (
	// Generic
	// Genel
	CodeOK            = "OK"
	CodeValidationErr = "VALIDATION_ERROR"
	CodeInternalErr   = "INTERNAL_ERROR"
	CodeGeneralErr    = "GENERAL_ERROR"

	// Auth related
	// Auth ile ilgili
	CodeAuthUserExists   = "AUTH_USER_ALREADY_EXISTS"
	CodeAuthInvalidCreds = "AUTH_INVALID_CREDENTIALS"
	CodeAuthTokenMissing = "AUTH_TOKEN_MISSING"
	CodeAuthTokenInvalid = "AUTH_TOKEN_INVALID"
	CodeAuthUnauthorized = "AUTH_UNAUTHORIZED"

	// Wallet related
	// Cüzdan ile ilgili
	CodeWalletNotFound          = "WALLET_NOT_FOUND"
	CodeWalletInsufficient      = "WALLET_INSUFFICIENT_FUNDS"
	CodeWalletInvalidAmount     = "WALLET_INVALID_AMOUNT"
	CodeWalletBalanceFetched    = "WALLET_BALANCE_FETCHED"
	CodeWalletDepositSuccess    = "WALLET_DEPOSIT_SUCCESS"
	CodeWalletWithdrawSuccess   = "WALLET_WITHDRAW_SUCCESS"
	CodeWalletInsufficientFunds = "WALLET_INSUFFICIENT_FUNDS"
	CodeWalletTransferSuccess   = "WALLET_TRANSFER_SUCCESS"

	// Request related
	// İstek ile ilgili
	CodeRequestBodyInvalid = "REQUEST_BODY_INVALID"

	// Transaction related
	// İşlem geçmişi ile ilgili
	CodeTxHistoryFailed  = "TX_HISTORY_FAILED"
	CodeTxHistoryFetched = "TX_HISTORY_FETCHED"

	// Rate limiting
	CodeRateLimitExceeded = "RATE_LIMIT_EXCEEDED"

	// Content type
	CodeUnsupportedContentType = "UNSUPPORTED_CONTENT_TYPE"

	// Validation related
	/// Validasyon ile ilgili
	CodeValidationRequiredField = "VALIDATION_REQUIRED_FIELD"
	CodeValidationInvalidEmail  = "VALIDATION_INVALID_EMAIL"
	CodeValidationMinLength     = "VALIDATION_MIN_LENGTH"
	CodeValidationPositiveAmount = "VALIDATION_POSITIVE_AMOUNT"
)
