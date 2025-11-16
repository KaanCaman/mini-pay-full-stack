import { makeAutoObservable, runInAction } from "mobx";
import * as SecureStore from "expo-secure-store";
import { IApiService, LoginResponse } from "../api/IApiService";
import { setAccessToken } from "../api/httpClient";

// defines storage keys for persistence to keep naming consistent and avoid typos
// veri saklama anahtarlarını tanımlar; hem düzen hem de yazım hatalarını engellemek için kullanılır
const TOKEN_KEY = "mp_access_token";
const USER_ID_KEY = "mp_user_id";

// defines the authentication store that handles login state, token, userId, and session management
// login durumu, token, userId ve oturum yönetimini ele alan authentication store'unu tanımlar
export class AuthStore {
  // holds injected API service instance used for backend communication
  // backend ile iletişim için kullanılan API servis instance'ını saklar
  api: IApiService;

  // stores the JWT token in memory
  // JWT token'ı hafızada saklar
  token: string | null = null;

  // stores numeric user ID returned by backend
  // backend tarafından dönen kullanıcı ID'sini saklar
  userId: number | null = null;

  // indicates whether we restored data from storage
  // storage'dan verilerin yüklenip yüklenmediğini gösterir
  hydrated = false;

  // indicates loading state during login calls
  // login çağrıları sırasında yükleme durumunu belirtir
  loading = false;

  // constructor connects API service and makes entire class observable
  // constructor, API servisi bağlar ve tüm sınıfı observable hale getirir
  constructor(api: IApiService) {
    this.api = api;

    // makes all fields observable and all methods auto-bound
    // tüm alanları observable ve tüm metotları otomatik bağlanmış hale getirir
    makeAutoObservable(this);
  }

  // computed property returning true if user is logged in (has token)
  // kullanıcı giriş yapmış mı (token var mı) kontrol eden computed property
  get isAuthenticated() {
    return !!this.token;
  }

  // restores token + userId from SecureStore when app boots
  // uygulama açıldığında SecureStore'dan token + userId değerlerini geri yükler
  hydrate = async () => {
    try {
      // loads token and userId in parallel for better performance
      // daha iyi performans için token ve userId'yi paralel olarak yükler
      const [storedToken, storedUserId] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_ID_KEY),
      ]);

      // safely updates observable fields inside MobX action
      // observable alanları güvenli şekilde güncellemek için MobX action kullanılır
      runInAction(() => {
        this.token = storedToken;
        this.userId = storedUserId ? Number(storedUserId) : null;
        this.hydrated = true;
      });

      // injects token into global http client so API calls authenticate correctly
      // token'ı global http client'a enjekte eder, böylece API çağrıları doğru şekilde yetkilendirilir
      setAccessToken(storedToken);
    } catch (e) {
      // ensures hydration completes even if something goes wrong
      // bir hata olsa bile hydration sürecinin tamamlanmasını garanti eder
      runInAction(() => {
        this.hydrated = true;
      });
    }
  };

  // performs login by calling API service and persists token + userId
  // API servisini çağırarak login işlemi yapar ve token + userId'yi saklar
  login = async (email: string, password: string) => {
    // starts loading state so UI can show spinner
    // UI gösterimi için loading durumunu başlatır
    this.loading = true;

    try {
      // calls API and receives typed login response
      // API'yi çağırır ve tip güvenli login yanıtını alır
      const result: LoginResponse = await this.api.login(email, password);

      // updates observable fields with login data
      // login'den dönen verilerle observable alanları günceller
      runInAction(() => {
        this.token = result.token;
        this.userId = result.user_id;
      });

      // injects token into axios client
      // token'ı axios client'a enjekte eder
      setAccessToken(result.token);

      // persists token & userId into secure device storage
      // token ve userId'yi cihazın güvenli depolamasına yazar
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, result.token),
        SecureStore.setItemAsync(USER_ID_KEY, String(result.user_id)),
      ]);
    } finally {
      // stops loading state
      // loading durumunu sonlandırır
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  // logs out user by clearing memory & secure storage
  // kullanıcıyı çıkış yaptırır: memory ve secure storage temizlenir
  logout = async () => {
    // wipes in-memory session state
    // hafızadaki oturum bilgilerini siler
    runInAction(() => {
      this.token = null;
      this.userId = null;
    });

    // removes token from axios client so no Auth header is sent
    // axios client'tan token'ı siler, artık Auth header gönderilmez
    setAccessToken(null);

    // clears persisted values
    // saklanan token ve userId değerlerini temizler
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_ID_KEY),
    ]);
  };

  // handles unauthorized responses (401) triggered from httpClient
  // httpClient'tan tetiklenen 401 yetkisiz erişim durumlarını ele alır
  handleUnauthorized = () => {
    this.logout();
  };
}
