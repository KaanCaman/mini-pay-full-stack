import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { IApiClient } from "./IApiClient";
import { IApiResponse, IApiRequestConfig } from "./types";
import { Platform } from "react-native";

export class AxiosApiClient implements IApiClient {
  // The internal Axios instance used for making requests
  // İstekleri yapmak için kullanılan dahili Axios örneği
  private axiosInstance: AxiosInstance;

  // Stores the authentication token to be used in headers
  // Headerlarda kullanılacak kimlik doğrulama token'ını saklar
  private accessToken: string | null = null;

  // Callback function to execute when a 401 error occurs
  // 401 hatası oluştuğunda çalıştırılacak geri çağırma fonksiyonu
  private onUnauthorized: (() => void) | null = null;

  constructor() {
    // Initialize the Axios instance
    // Axios örneğini başlatır
    this.axiosInstance = this.createAxiosInstance();

    // Configure request and response interceptors
    // İstek ve yanıt interceptor'larını yapılandırır
    this.setupInterceptors();
  }

  // ---------------------------------------------------------------------------
  // Configuration Methods
  // ---------------------------------------------------------------------------

  private createAxiosInstance(): AxiosInstance {
    // Determine the base URL based on the operating system
    // İşletim sistemine göre temel URL'i belirler (Android emülatörü için özel IP)
    const baseURL =
      Platform.OS === "android"
        ? "http://10.0.2.2:3000"
        : "http://localhost:3000";

    // Create a new Axios instance with default configuration
    // Varsayılan yapılandırma ile yeni bir Axios örneği oluşturur
    return axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Updates the access token for future requests
  // Gelecekteki istekler için erişim token'ını günceller
  public setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  // Sets the handler for unauthorized (401) responses
  // Yetkisiz (401) yanıtlar için işleyiciyi ayarlar
  public setOnUnauthorized(handler: () => void): void {
    this.onUnauthorized = handler;
  }

  // Interceptor Setup
  // Interceptor Kurulumu
  private setupInterceptors(): void {
    // Request Interceptor configuration
    // İstek Interceptor yapılandırması
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Log request details only in development mode
        // Sadece geliştirme modunda istek detaylarını loglar
        if (__DEV__) {
          console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        // Inject the Authorization header if a token exists
        // Eğer token mevcutsa Authorization header'ını ekler
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Response Interceptor configuration
    // Yanıt Interceptor yapılandırması
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development mode
        // Başarılı yanıtları geliştirme modunda loglar
        if (__DEV__) {
          console.log(
            `✅ [${response.status}] ${response.config.url}`,
            response.data
          );
        }
        return response;
      },
      (error: AxiosError) => {
        // Log error details for debugging purposes
        // Hata ayıklama amacıyla hata detaylarını loglar
        if (__DEV__) {
          console.error(
            `❌ [${error.response?.status || "ERROR"}] ${error.config?.url}`,
            {
              message: error.message,
              data: error.response?.data,
            },
            error
          );
        }

        // Delegate error handling to a specific method
        // Hata yönetimini özel bir metoda devreder
        this.handleError(error);

        return Promise.reject(error);
      }
    );
  }

  // Centralized error handling logic
  // Merkezi hata yönetimi mantığı
  private handleError(error: AxiosError): void {
    // Get the status code from the error response
    // Hata yanıtından durum kodunu alır
    const status = error.response?.status;

    // Check for 401 status and trigger the callback if defined
    // 401 durumunu kontrol eder ve tanımlıysa geri çağırmayı tetikler
    if (status === 401 && this.onUnauthorized) {
      this.onUnauthorized();
    }
  }

  // Converts Axios response to our generic IApiResponse
  // Axios yanıtını genel IApiResponse tipimize dönüştürür
  private normalizeResponse<T>(response: AxiosResponse<T>): IApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      message: response.statusText,
    };
  }

  // ---------------------------------------------------------------------------
  // Public API Methods (Fully Abstracted)
  // ---------------------------------------------------------------------------

  // Generic GET request wrapper
  // Genel (generic) GET isteği sarmalayıcısı
  public async get<T>(
    url: string,
    config?: IApiRequestConfig
  ): Promise<IApiResponse<T>> {
    const response = await this.axiosInstance.get<T>(
      url,
      config as AxiosRequestConfig
    );
    return this.normalizeResponse<T>(response);
  }

  // Generic POST request wrapper
  // Genel (generic) POST isteği sarmalayıcısı
  public async post<T>(
    url: string,
    data?: any,
    config?: IApiRequestConfig
  ): Promise<IApiResponse<T>> {
    const response = await this.axiosInstance.post<T>(
      url,
      data,
      config as AxiosRequestConfig
    );

    return this.normalizeResponse<T>(response);
  }

  // Generic PUT request wrapper
  // Genel (generic) PUT isteği sarmalayıcısı
  public async put<T>(
    url: string,
    data?: any,
    config?: IApiRequestConfig
  ): Promise<IApiResponse<T>> {
    const response = await this.axiosInstance.put<T>(
      url,
      data,
      config as AxiosRequestConfig
    );
    return this.normalizeResponse<T>(response);
  }

  // Generic PATCH request wrapper
  // Genel (generic) PATCH isteği sarmalayıcısı
  public async patch<T>(
    url: string,
    data?: any,
    config?: IApiRequestConfig
  ): Promise<IApiResponse<T>> {
    const response = await this.axiosInstance.patch<T>(
      url,
      data,
      config as AxiosRequestConfig
    );
    return this.normalizeResponse<T>(response);
  }

  // Generic DELETE request wrapper
  // Genel (generic) DELETE isteği sarmalayıcısı
  public async delete<T>(
    url: string,
    config?: IApiRequestConfig
  ): Promise<IApiResponse<T>> {
    const response = await this.axiosInstance.delete<T>(
      url,
      config as AxiosRequestConfig
    );
    return this.normalizeResponse<T>(response);
  }
}
