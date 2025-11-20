import { AxiosApiClient } from "./client/AxiosApiClient";
import { MiniPayApiService } from "./service/MiniPayApiService";

// Export a singleton instance to be used throughout the app
// Uygulama genelinde kullanılacak tekil (singleton) bir örneği dışa aktarır
export const httpClient = new AxiosApiClient();
export const apiService = new MiniPayApiService(httpClient);

// re-exports all useful API-related modules for cleaner imports
// daha temiz import yolları için API ile ilgili modüller tekrar dışa aktarılır

export * from "./client/IApiClient";
export * from "./client/AxiosApiClient";
export * from "./client/types";
export * from "./service/IApiService";
export * from "./service/MiniPayApiService";
export * from "./service/types";
