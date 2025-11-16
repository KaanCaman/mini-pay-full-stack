import axios, { AxiosInstance } from "axios";

// holds the access token that will be attached to every request
// her isteğe eklenmesi gereken access token değeri burada tutulur
let accessToken: string | null = null;

// stores the function that should run when server returns unauthorized (401)
// sunucu 401 döndüğünde çalışması gereken fonksiyon burada tutulur
let onUnauthorized: (() => void) | null = null;

// updates the global access token used by the axios instance
// axios instance tarafından kullanılacak access token değerini günceller
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// registers a callback to execute on 401 unauthorized responses
// 401 hatası geldiğinde çalışacak callback fonksiyonunu kaydeder
export const setOnUnauthorized = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

// creates and configures a new axios client instance with interceptors
// interceptor'larla yapılandırılmış yeni bir axios client instance oluşturur
const createHttpClient = (): AxiosInstance => {
  // creates axios instance with base configuration (baseURL, timeout)
  // axios instance oluşturur ve temel ayarları yapar (baseURL, timeout)
  const instance = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 10000,
  });

  // request interceptor that runs before every outgoing HTTP request
  // her HTTP isteği gönderilmeden önce çalışan request interceptor
  instance.interceptors.request.use((config) => {
    // adds Authorization header only if token exists
    // token varsa Authorization header'a ekler
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }

    // returns the modified request config to continue the request
    // düzenlenmiş request config'i geri döndürür
    return config;
  });

  // response interceptor that runs after receiving a response or error
  // response veya error geldikten sonra çalışan response interceptor
  instance.interceptors.response.use(
    // simply returns successful response as is
    // başarılı response geldiğinde olduğu gibi geri döndürür
    (response) => response,

    // handles error responses
    // hata response'larını işler
    (error) => {
      // safely extracts status code if it exists
      // status kodunu güvenli şekilde alır
      const status = error?.response?.status;

      // triggers unauthorized callback when HTTP 401 occurs
      // sunucu 401 dönerse unauthorized callback'i çalıştırır
      if (status === 401 && onUnauthorized) {
        onUnauthorized();
      }

      // rethrows the error to the caller so UI can handle it too
      // hatayı dışarı tekrar fırlatır ki UI tarafı da işleyebilsin
      return Promise.reject(error);
    }
  );

  // returns the configured axios instance
  // yapılandırılmış axios instance'ını geri döndürür
  return instance;
};

// exports a ready-to-use global http client instance
// kullanıma hazır global http client instance export edilir
export const httpClient = createHttpClient();
