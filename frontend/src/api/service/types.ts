// Response type for successful login operation in the Service layer.
// Servis katmanındaki başarılı giriş işlemi için yanıt tipi.
export interface UserTokenInfo {
  token: string;
  userID: number;
}

// Request body for Register and Login operations.
// Kayıt ve Giriş işlemleri için istek gövdesi.
export interface AuthCredentials {
  email: string;
  password: string;
}

// Request body for Deposit and Withdraw operations.
// Para Yatırma ve Çekme işlemleri için istek gövdesi.
export interface WalletAmount {
  // Amount is in CENTS here.
  // Miktar burada kuruş cinsindendir.
  amount: number;
}

// Request body for Transfer operation.
// Transfer işlemi için istek gövdesi.
export interface TransferDetails extends WalletAmount {
  toUserID: number;
}

// Transaction item structure from the backend.
// Backend'den gelen işlem öğesi yapısı.
export type TransactionType =
  | "deposit"
  | "withdraw"
  | "transfer_sent"
  | "transfer_received";

export interface Transaction {
  id: number;
  createdAt: string; // ISO 8601 string
  updatedAt: string;
  userID: number;
  type: TransactionType;
  amount: number; // Amount in CENTS (kuruş)
  targetUserID: number | null;
  balanceAfter: number; // Balance in CENTS (kuruş)
}

// Balance data structure from the backend (Note: it's returned as float for display).
// Backend'den gelen Bakiye veri yapısı (Not: görüntüleme için float olarak dönüyor).
export interface BalanceData {
  userID: number;
  balance: number; // Balance in currency units (TL, USD, etc.) / Bakiye para birimi cinsindendir.
}

// Transaction History payload
// İşlem Geçmişi veri yükü
export interface TransactionHistoryData {
  userID: number;
  transactions: Transaction[];
}
