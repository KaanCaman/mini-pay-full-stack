import { makeAutoObservable, runInAction } from "mobx";
import * as SecureStore from "expo-secure-store";
import { IApiService } from "../api/service/IApiService";
import { ApiResponse, LoginData, RegisterData } from "../api/service/types";
import { httpClient } from "../api/";

// secure storage keys for token persistence
// token kalıcılığı için güvenli depolama anahtarları
const TOKEN_KEY = "mp_access_token";
const USER_ID_KEY = "mp_user_id";

export class AuthStore {
  // injected API service for backend communication
  // backend iletişimi için enjekte edilen API servisi
  api: IApiService;

  // JWT access token stored in memory
  // hafızada saklanan JWT erişim token'ı
  token: string | null = null;

  // authenticated user ID
  // kimliği doğrulanmış kullanıcı ID'si
  userId: number | null = null;

  // loading state for UI feedback
  // UI geri bildirimi için yükleme durumu
  loading = false;

  // hydration completed flag
  // hidrasyon tamamlanma bayrağı
  hydrated = false;

  // last error message from API
  // API'den gelen son hata mesajı
  error: string | null = null;

  // last error code from API
  // API'den gelen son hata kodu
  errorCode: string | null = null;

  constructor(api: IApiService) {
    this.api = api;
    makeAutoObservable(this);

    // register 401 unauthorized handler
    // 401 yetkisiz durumu işleyicisini kaydet
    httpClient.setOnUnauthorized(() => this.handleUnauthorized());
  }

  // computed: check if user is authenticated
  // hesaplanmış: kullanıcının kimliği doğrulanmış mı kontrol et
  get isAuthenticated() {
    return !!this.token;
  }

  // restore session from secure storage on app start
  // uygulama başlangıcında oturumu güvenli depodan geri yükle
  hydrate = async () => {
    try {
      // load token and userId in parallel for performance
      // performans için token ve userId'yi paralel yükle
      const [storedToken, storedUserId] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_ID_KEY),
      ]);

      // if no credentials found, skip validation
      // kimlik bilgisi bulunamazsa doğrulamayı atla
      if (!storedToken || !storedUserId) {
        throw new Error("No stored credentials");
      }

      // verify token is still valid with backend
      // token'ın backend ile hala geçerli olduğunu doğrula
      const isValid = await this.api.isAuthenticated(storedToken);

      runInAction(() => {
        this.token = isValid ? storedToken : null;
        this.userId = isValid ? Number(storedUserId) : null;
        this.hydrated = true;
      });

      // inject valid token into HTTP client
      // geçerli token'ı HTTP istemcisine enjekte et
      if (isValid) {
        httpClient.setAccessToken(storedToken);
      }
    } catch {
      // mark hydration as complete even on error
      // hata durumunda bile hidrasyonu tamamlanmış olarak işaretle
      runInAction(() => {
        this.hydrated = true;
      });
    }
  };

  // authenticate user with email and password
  // kullanıcıyı email ve şifre ile kimlik doğrula
  login = async (email: string, password: string) => {
    // set loading state and clear previous errors
    // yükleme durumunu ayarla ve önceki hataları temizle
    runInAction(() => {
      this.loading = true;
      this.error = null;
      this.errorCode = null;
    });

    try {
      // call login API endpoint
      // giriş API endpoint'ini çağır
      const res: ApiResponse<LoginData> = await this.api.login(email, password);

      // handle unsuccessful response
      // başarısız yanıtı işle
      if (!res.success) {
        runInAction(() => {
          this.error = res.message;
          this.errorCode = res.code || null;
        });
        throw new Error(res.message);
      }

      // store token and userId in memory
      // token ve userId'yi hafızada sakla
      runInAction(() => {
        this.token = res.data?.token ?? null;
        this.userId = res.data?.userID ?? null;
      });

      // validate that we received valid credentials
      // geçerli kimlik bilgileri aldığımızı doğrula
      if (!this.token || !this.userId) {
        throw new Error("Invalid credentials received from server");
      }

      // inject token into HTTP client for subsequent requests
      // sonraki istekler için token'ı HTTP istemcisine enjekte et
      httpClient.setAccessToken(this.token);

      // persist credentials to secure storage
      // kimlik bilgilerini güvenli depoya kaydet
      await SecureStore.setItemAsync(TOKEN_KEY, this.token);
      await SecureStore.setItemAsync(USER_ID_KEY, String(this.userId));
    } catch (err: any) {
      // extract error details from response
      // yanıttan hata detaylarını çıkar
      const errorData = err?.response?.data;
      const message = errorData?.message || "Login failed.";
      const code = errorData?.code || null;

      console.log("❌ Login error:", {
        message,
        code,
        status: err?.response?.status,
      });

      // update error state
      // hata durumunu güncelle
      runInAction(() => {
        this.error = message;
        this.errorCode = code;
      });

      // re-throw for UI error handling
      // UI hata işleme için tekrar fırlat
      throw err;
    } finally {
      // always clear loading state
      // her zaman yükleme durumunu temizle
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  // create new user account
  // yeni kullanıcı hesabı oluştur
  register = async (email: string, password: string) => {
    // set loading state and clear previous errors
    // yükleme durumunu ayarla ve önceki hataları temizle
    runInAction(() => {
      this.loading = true;
      this.error = null;
      this.errorCode = null;
    });

    try {
      // call register API endpoint
      // kayıt API endpoint'ini çağır
      const res: ApiResponse<RegisterData> = await this.api.register(
        email,
        password
      );

      // handle unsuccessful response
      // başarısız yanıtı işle
      if (!res.success) {
        runInAction(() => {
          this.error = res.message;
          this.errorCode = res.code || null;
        });
        throw new Error(res.message);
      }

      // registration successful - no auto-login, just return success
      // kayıt başarılı - otomatik giriş yok, sadece başarı dön
      console.log("✅ Registration successful - user should login manually");
    } catch (err: any) {
      // extract error details from response
      // yanıttan hata detaylarını çıkar
      const errorData = err?.response?.data;
      const message = errorData?.message || "Registration failed.";
      const code = errorData?.code || null;

      console.log("❌ Register error:", {
        message,
        code,
        status: err?.response?.status,
      });

      // update error state
      // hata durumunu güncelle
      runInAction(() => {
        this.error = message;
        this.errorCode = code;
      });

      // re-throw for UI error handling
      // UI hata işleme için tekrar fırlat
      throw err;
    } finally {
      // always clear loading state
      // her zaman yükleme durumunu temizle
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  // clear session and remove credentials
  // oturumu temizle ve kimlik bilgilerini kaldır
  logout = async () => {
    // clear in-memory state
    // hafızadaki durumu temizle
    runInAction(() => {
      this.token = null;
      this.userId = null;
    });

    // remove token from HTTP client
    // HTTP istemcisinden token'ı kaldır
    httpClient.setAccessToken(null);

    // remove credentials from secure storage
    // güvenli depodan kimlik bilgilerini kaldır
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_ID_KEY),
    ]);
  };

  // clear current error state
  // mevcut hata durumunu temizle
  clearError() {
    runInAction(() => {
      this.error = null;
      this.errorCode = null;
    });
  }

  // handle 401 unauthorized response from API
  // API'den gelen 401 yetkisiz yanıtını işle
  handleUnauthorized = () => {
    this.logout();
  };
}
