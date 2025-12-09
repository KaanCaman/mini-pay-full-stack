import { makeAutoObservable, runInAction } from "mobx";
import * as SecureStore from "expo-secure-store";
import { IApiService } from "../api/service/IApiService";
import { AuthCredentials } from "../api/service/types";
import i18n from "../i18n/index"; // Indirect import via index

// Secure storage keys
// Güvenli depolama anahtarları
const TOKEN_KEY = "mp_access_token";
const USER_ID_KEY = "mp_user_id";

export class AuthStore {
  // Service layer for business logic
  // İş mantığı için servis katmanı
  private api: IApiService;

  // State variables
  // Durum değişkenleri
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

  // last error code from API (CRITICAL FOR I18N MAPPING)
  // API'den gelen son hata kodu (I18N EŞLEŞTİRMESİ İÇİN KRİTİK)
  errorCode: string | null = null;

  constructor(api: IApiService) {
    this.api = api;
    makeAutoObservable(this);

    // Register 401 callback for automatic logout
    // Otomatik çıkış için 401 geri aramasını kaydet
    this.api.setOnUnauthorized(() => {
      // Dynamic import or use global if available. We'll use the one we define.
      const { default: ToastService } = require("../services/ToastService");

      ToastService.error(
        i18n.t("errors.session_expired.title"),
        i18n.t("errors.session_expired.message")
      );
      this.logout();
    });

    // Register Network Error callback
    // Ağ hatası geri aramasını kaydet
    this.api.setOnNetworkError(() => {
      const { default: ToastService } = require("../services/ToastService");

      ToastService.error(
        i18n.t("errors.network_error.title"),
        i18n.t("errors.network_error.message")
      );
      this.logout();
    });
  }

  // Computed: check if user is authenticated
  // Hesaplanmış: kullanıcının kimliği doğrulanmış mı kontrol et
  get isAuthenticated() {
    return !!this.token;
  }

  // Restore session from secure storage on app start
  // Uygulama başlangıcında oturumu güvenli depodan geri yükle
  hydrate = async () => {
    try {
      // Load token and userId
      // Token ve userId'yi yükle
      const [storedToken, storedUserId] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_ID_KEY),
      ]);

      if (!storedToken || !storedUserId) {
        runInAction(() => {
          this.hydrated = true;
        });
        return;
      }

      // 1. Set token to client FIRST so the checkToken request has headers
      // 1. checkToken isteğinin header'a sahip olması için ÖNCE token'ı istemciye ayarla
      this.api.setAuthToken(storedToken);

      // 2. Verify token with backend
      // 2. Token'ı backend ile doğrula
      const result = await this.api.checkToken();

      // 3. If no error thrown above, session is valid
      // 3. Yukarıda hata fırlatılmazsa, oturum geçerlidir
      runInAction(() => {
        this.token = storedToken;
        this.userId = Number(result.userID);
        this.hydrated = true;
      });
    } catch (error) {
      console.log("⚠️ Session invalid or expired:", error);
      // Token is invalid, clear everything
      // Token geçersiz, her şeyi temizle
      await this.logout();

      runInAction(() => {
        this.hydrated = true;
      });
    }
  };

  // Login action
  // Giriş işlemi
  login = async (credentials: AuthCredentials) => {
    runInAction(() => {
      this.loading = true;
      this.error = null;
      this.errorCode = null; // Reset error code / Hata kodunu sıfırla
    });

    try {
      // Call API Service
      // API Servisini çağır
      const data = await this.api.login(credentials);

      // Update State
      // Durumu güncelle
      runInAction(() => {
        this.token = data.token;
        this.userId = data.userID;
      });

      // Set token to Axios Client
      // Token'ı Axios İstemcisine ayarla
      this.api.setAuthToken(data.token);

      // Persist to SecureStore
      // SecureStore'a kalıcı olarak kaydet
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, data.token),
        SecureStore.setItemAsync(USER_ID_KEY, String(data.userID)),
      ]);
    } catch (err: any) {
      // Handle Error - Extract CODE specifically
      // Hatayı ele al - Özellikle KODU çıkar
      // Backend returns: { success: false, code: "AUTH_INVALID_CREDENTIALS", message: "..." }

      const message = err?.message || "Login failed";
      const code = err?.code || "GENERAL_ERROR"; // Fallback code

      runInAction(() => {
        this.error = message;
        this.errorCode = code; // <--- THIS WAS MISSING / BU EKSİKTİ
      });

      // Re-throw for UI to handle logic if needed
      throw err;
    } finally {
      // always clear loading state
      // her zaman yükleme durumunu temizle
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  // Register action
  // Kayıt işlemi
  register = async (credentials: AuthCredentials) => {
    runInAction(() => {
      this.loading = true;
      this.error = null;
      this.errorCode = null;
    });

    try {
      // Call API Service
      await this.api.register(credentials);
    } catch (err: any) {
      const message = err?.message || "Registration failed";
      const code = err?.code || "GENERAL_ERROR";

      runInAction(() => {
        this.error = message;
        this.errorCode = code; // Save the code for AuthScreen mapping / AuthScreen eşleştirmesi için kodu kaydet
      });

      // re-throw for UI error handling
      // UI hata işleme için tekrar fırlat
      throw err;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  // Logout action
  // Çıkış işlemi
  logout = async () => {
    // clear in-memory state
    // hafızadaki durumu temizle
    runInAction(() => {
      this.token = null;
      this.userId = null;
      this.error = null;
      this.errorCode = null;
    });

    this.api.setAuthToken(null);

    // remove credentials from secure storage
    // güvenli depodan kimlik bilgilerini kaldır
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_ID_KEY),
    ]);
  };

  // Clear error manually
  // Hatayı manuel olarak temizle
  clearError() {
    runInAction(() => {
      this.error = null;
      this.errorCode = null;
    });
  }
}
