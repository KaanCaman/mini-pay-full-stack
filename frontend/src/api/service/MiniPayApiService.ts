import { IApiClient } from "../client/types";
import { IApiService } from "./IApiService";
import {
  AuthCredentials,
  UserTokenInfo,
  BalanceData,
  WalletAmount,
  TransferDetails,
  TransactionHistoryData,
} from "./types";

export class MiniPayApiService implements IApiService {
  private apiClient: IApiClient;

  // Dependency Injection: Service relies on an abstract Client
  // Bağımlılık Enjeksiyonu: Servis soyut bir İstemciye dayanır
  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }

  // Auth Operations
  // Yetkilendirme İşlemleri

  async register(credentials: AuthCredentials): Promise<void> {
    // Calls POST /register. Expects no data in return, just success.
    // POST /register çağırır. Dönüşte veri beklemez, sadece başarı durumu.
    await this.apiClient.post<null>("/register", credentials);
  }

  async login(credentials: AuthCredentials): Promise<UserTokenInfo> {
    // Calls POST /login. Returns token and userID.
    // POST /login çağırır. Token ve userID döner.
    const response = await this.apiClient.post<UserTokenInfo>(
      "/login",
      credentials
    );

    // We strictly assume data is present if success is true due to our types
    // Türlerimiz sayesinde success true ise datanın var olduğunu kesin varsayıyoruz
    return response.data!;
  }

  async checkToken(): Promise<{ userID: number }> {
    // Verify if the current token is valid
    // Mevcut token'ın geçerli olup olmadığını doğrula
    const response = await this.apiClient.get<{ userID: number }>("/me");
    return response.data!;
  }

  setAuthToken(token: string | null): void {
    this.apiClient.setAuthToken(token);
  }

  setOnUnauthorized(callback: () => void): void {
    this.apiClient.setOnUnauthorized(callback);
  }

  setOnNetworkError(callback: () => void): void {
    this.apiClient.setOnNetworkError(callback);
  }

  // Wallet Operations
  // Cüzdan İşlemleri

  async getBalance(): Promise<BalanceData> {
    // Fetches the current wallet balance
    // Mevcut cüzdan bakiyesini getirir
    const response = await this.apiClient.get<BalanceData>("/wallet/balance");
    return response.data!;
  }

  async deposit(details: WalletAmount): Promise<void> {
    // Deposit money (amount in cents)
    // Para yatırma (miktar kuruş cinsinden)
    await this.apiClient.post<null>("/wallet/deposit", details);
  }

  async withdraw(details: WalletAmount): Promise<void> {
    // Withdraw money. Backend checks sufficiency.
    // Para çekme. Backend yeterliliği kontrol eder.
    await this.apiClient.post<null>("/wallet/withdraw", details);
  }

  async transfer(details: TransferDetails): Promise<void> {
    // Transfer money to another user.
    // Başka bir kullanıcıya para transferi.
    await this.apiClient.post<null>("/wallet/transfer", details);
  }

  async getTransactionHistory(): Promise<TransactionHistoryData> {
    // Get list of past transactions
    // Geçmiş işlemlerin listesini al
    const response = await this.apiClient.get<TransactionHistoryData>(
      "/wallet/history"
    );
    return response.data!;
  }
}
