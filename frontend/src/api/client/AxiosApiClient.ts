import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { IApiClient, GlobalApiResponse, SuccessResponse } from "./types";
import { Platform } from "react-native";

// Base URL configuration (Should be in env variables in production)
// Temel URL yapılandırması (Prodüksiyonda env değişkenlerinde olmalı)
const BASE_URL = Platform.select<string>({
  ios: "http://localhost:3000",
  android: "http://10.0.2.2:3000",
});

export class AxiosApiClient implements IApiClient {
  private api: AxiosInstance;
  private onUnauthorizedCallback: (() => void) | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 seconds timeout / 10 saniye zaman aşımı
    });

    // Request Interceptor: Add token if exists
    // İstek Kesici: Varsa token ekle
    this.api.interceptors.request.use(
      (config) => {
        // TODO: Get token from SecureStore and add to Authorization header
        // TODO: Token'ı SecureStore'dan al ve Authorization başlığına ekle
        console.log(
          `[API Request] ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor: Handle global errors and wrap responses
    // Yanıt Kesici: Global hataları ele al ve yanıtları sarmala
    this.api.interceptors.response.use(
      (response: AxiosResponse<GlobalApiResponse<any>>) => {
        // If the HTTP status is 200 but the backend logical success is false
        // HTTP durumu 200 olsa bile backend mantıksal success false ise
        if (!response.data.success) {
          console.warn(
            `[API Logic Error] ${response.data.code}: ${response.data.message}`
          );

          // Throw the backend error
          // Backend hatasını fırlat
          return Promise.reject(response.data);
        }
        return response;
      },
      (error) => {
        // Handle network errors or 4xx/5xx status codes
        // Ağ hatalarını veya 4xx/5xx durum kodlarını ele al
        console.error("[API Network Error]", error.message);

        if (error.response && error.response.status === 401) {
          console.warn(
            "🔒 401 Unauthorized detected. Triggering logout callback."
          );
          if (this.onUnauthorizedCallback) {
            this.onUnauthorizedCallback();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic GET method implementation
  // Genel GET metodu uygulaması
  async get<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<SuccessResponse<T>> {
    const response = await this.api.get<SuccessResponse<T>>(path, config);
    return response.data;
  }

  // Generic POST method implementation
  // Genel POST metodu uygulaması
  async post<T, D = any>(
    path: string,
    data: D,
    config?: AxiosRequestConfig
  ): Promise<SuccessResponse<T>> {
    const response = await this.api.post<SuccessResponse<T>>(
      path,
      data,
      config
    );
    return response.data;
  }

  // Method to set the authorization token dynamically
  // Yetkilendirme token'ını dinamik olarak ayarlama metodu
  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common["Authorization"];
    }
  }

  setOnUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }
}
