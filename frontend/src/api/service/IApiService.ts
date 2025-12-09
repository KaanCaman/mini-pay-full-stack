import {
  AuthCredentials,
  BalanceData,
  TransactionHistoryData,
  TransferDetails,
  UserTokenInfo,
  WalletAmount,
} from "./types";

// API servis arayüzü
export interface IApiService {
  // Auth Operations
  // Yetkilendirme İşlemleri
  register(credentials: AuthCredentials): Promise<void>;
  login(credentials: AuthCredentials): Promise<UserTokenInfo>;
  checkToken(): Promise<{ userID: number }>;
  setAuthToken(token: string | null): void;
  setOnUnauthorized(callback: () => void): void;

  // ---

  // Wallet Operations
  // Cüzdan İşlemleri
  getBalance(): Promise<BalanceData>;
  deposit(details: WalletAmount): Promise<void>;
  withdraw(details: WalletAmount): Promise<void>;
  transfer(details: TransferDetails): Promise<void>;
  getTransactionHistory(): Promise<TransactionHistoryData>;
}
