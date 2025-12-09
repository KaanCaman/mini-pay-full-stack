import { AxiosRequestConfig } from "axios";

// The standard response wrapper for all successful and error API calls.
// Tüm başarılı ve hatalı API çağrıları için standart yanıt sarmalayıcı.
export type GlobalApiResponse<T> = {
  success: boolean; // Indicates if the call was successful. / Çağrının başarılı olup olmadığını belirtir.
  code: string; // Machine readable code (e.g., OK, WALLET_INSUFFICIENT_FUNDS). / Makine tarafından okunabilir kod.
  message: string; // Human readable message. / İnsan tarafından okunabilir mesaj.
  data: T | null; // The actual payload data. Null if 'success' is false. / Asıl veri yükü. 'success' false ise null.
};

// A generic type for successful responses that carry data.
// Veri taşıyan başarılı yanıtlar için genel tip.
export type SuccessResponse<T> = GlobalApiResponse<T> & {
  success: true;
  data: T;
};

// A generic type for error responses.
// Hata yanıtları için genel tip.
export type ErrorResponse = GlobalApiResponse<null> & {
  success: false;
};

// Definition for the core API client interface.
// Temel API istemci arayüzünün tanımı.
export interface IApiClient {
  get<T>(path: string, config?: object): Promise<SuccessResponse<T>>;
  post<T, D = any>(
    path: string,
    data: D,
    config?: AxiosRequestConfig
  ): Promise<SuccessResponse<T>>;
  setAuthToken(token: string | null): void;
  setOnUnauthorized(callback: () => void): void;
}

// Data structure for Login response payload
// Giriş yanıtı veri yükü için veri yapısı
export interface LoginResponseData {
  token: string;
  userID: number;
}
