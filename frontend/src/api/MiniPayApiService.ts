import { AxiosInstance } from "axios";
import { IApiService, LoginResponse, RegisterResponse } from "./IApiService";

// defines a concrete API service that communicates with the Mini-Pay backend
// Mini-Pay backend'iyle iletişim kuran somut API servis sınıfını tanımlar
export class MiniPayApiService implements IApiService {
  // holds the axios instance injected from outside (dependency injection)
  // dışarıdan enjekte edilen axios instance'ını tutar (dependency injection)
  private client: AxiosInstance;

  // constructor receives the axios client to allow full testability and flexibility
  // constructor, test edilebilirlik ve esneklik için axios client'ı dışarıdan alır
  constructor(client: AxiosInstance) {
    this.client = client;
  }

  // checks isAuthenticated
  // isAuthenticated kontrolü yapar
  async isAuthenticated(token: string): Promise<boolean> {
    // fetches the current authenticated user's info from backend
    // backend'den mevcut kimlik doğrulanmış kullanıcının bilgilerini alır
    const response = await this.client.get("/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // if response is 200 OK, user is authenticated
    // eğer yanıt 200 OK ise, kullanıcı kimlik doğrulanmıştır
    return response.status === 200;
  }

  // handles register endpoint
  // register endpoint'ini çalıştırır
  async register(email: string, password: string): Promise<RegisterResponse> {
    // sends JSON body with email + password to backend
    // backend'e email + şifre JSON body olarak gönderilir

    const response = await this.client
      .post<RegisterResponse>("/register", {
        email,
        password,
      })
      .catch((error) => {
        console.log("apiService.Register error: ", error);

        throw error;
      });

    // returns typed response
    // tip güvenli yanıt döndürülür
    return response.data;
  }

  // performs login request by sending email + password and returns typed response
  // email + şifre göndererek login isteği yapar ve tip güvenli yanıt döner
  async login(email: string, password: string): Promise<LoginResponse> {
    // sends POST request to /auth/login with credentials
    // kimlik bilgileriyle /auth/login endpoint'ine POST isteği atar
    const response = await this.client
      .post<LoginResponse>("/login", {
        email,
        password,
      })
      .catch((error) => {
        console.log("apiService.login error:", error);

        throw error;
      });

    // returns only the data portion of the axios response
    // axios yanıtının sadece data kısmını döner
    return response.data;
  }

  // future API endpoints such as: getBalance(), transfer(), deposit()
  // ileride kullanılacak diğer API uç noktaları: getBalance(), transfer(), deposit() vb.
}
