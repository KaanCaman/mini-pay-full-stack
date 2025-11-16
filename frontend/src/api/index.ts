import { httpClient } from "./httpClient";
import { MiniPayApiService } from "./MiniPayApiService";

// creates a single instance of the API service using the axios client
// axios client kullanılarak API servisinin tek bir instance'ı oluşturulur
export const apiService = new MiniPayApiService(httpClient);

// re-exports all useful API-related modules for cleaner imports
// daha temiz import yolları için API ile ilgili modüller tekrar dışa aktarılır
export * from "./IApiService";
export * from "./httpClient";
