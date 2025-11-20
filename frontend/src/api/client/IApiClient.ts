import { IApiResponse, IApiRequestConfig } from "./types";

// Generic API client interface defining standard HTTP methods
// Standart HTTP metodlarını tanımlayan genel API istemcisi arayüzü
export interface IApiClient {
  // methods to set access token and unauthorized handler
  // access token ve yetkisiz işlemci ayarlama metodları

  setAccessToken(token: string | null): void;

  // registers a callback to execute on 401 unauthorized responses
  // 401 hatası geldiğinde çalışacak callback fonksiyonunu kaydeder
  setOnUnauthorized(handler: () => void): void;

  // standard HTTP methods returning generic API response
  // genel API yanıtı döndüren standart HTTP metodları
  get<T>(url: string, config?: IApiRequestConfig): Promise<IApiResponse<T>>;

  // standard HTTP methods returning generic API response
  // genel API yanıtı döndüren standart HTTP metodları
  post<T>(
    url: string,
    data?: any,
    config?: IApiRequestConfig
  ): Promise<IApiResponse<T>>;

  // standard HTTP methods returning generic API response
  // genel API yanıtı döndüren standart HTTP metodları
  put<T>(
    url: string,
    data?: any,
    config?: IApiRequestConfig
  ): Promise<IApiResponse<T>>;

  // standard HTTP methods returning generic API response
  // genel API yanıtı döndüren standart HTTP metodları
  delete<T>(url: string, config?: IApiRequestConfig): Promise<IApiResponse<T>>;

  // standard HTTP methods returning generic API response
  // genel API yanıtı döndüren standart HTTP metodları
  patch<T>(
    url: string,
    data?: any,
    config?: IApiRequestConfig
  ): Promise<IApiResponse<T>>;
}
