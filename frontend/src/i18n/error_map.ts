export const ERROR_CODE_MAP: Record<string, string> = {
  // Generic
  OK: "common.ok",
  VALIDATION_ERROR: "errors.validation",
  INTERNAL_ERROR: "errors.internal",
  GENERAL_ERROR: "errors.general",

  // Auth
  AUTH_USER_ALREADY_EXISTS: "errors.user_exists",
  AUTH_INVALID_CREDENTIALS: "errors.invalid_credentials",
  AUTH_TOKEN_MISSING: "errors.token_missing",
  AUTH_TOKEN_INVALID: "errors.token_invalid",
  AUTH_UNAUTHORIZED: "errors.unauthorized",

  // Wallet
  WALLET_NOT_FOUND: "errors.wallet_not_found",
  WALLET_INSUFFICIENT_FUNDS: "errors.insufficient_funds",
  WALLET_INVALID_AMOUNT: "errors.invalid_amount",

  // Request
  REQUEST_BODY_INVALID: "errors.request_body_invalid",

  // Transaction
  TX_HISTORY_FAILED: "errors.tx_history_failed",
};
