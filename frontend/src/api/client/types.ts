// Generic response interface representing the structure of API responses
// API yanıtlarının yapısını temsil eden genel yanıt arayüzü
export interface IApiResponse<T> {
  // generic data payload
  // genel veri
  data: T;

  // HTTP status code
  // HTTP durum kodu
  status: number;

  // Optional error messages
  // Opsiyonel hata mesajları için
  message?: string;
}

// Generic request configuration to abstract library-specific configs
// Kütüphaneye özgü yapılandırmaları soyutlamak için genel istek yapılandırması
export interface IApiRequestConfig {
  // request headers
  // istek başlıkları

  headers?: Record<string, string>;

  // query parameters
  // sorgu parametreleri
  params?: any;

  // request timeout in milliseconds
  // istek zaman aşımı (milisaniye cinsinden)
  timeout?: number;
}
