import { AxiosInstance } from "axios";
import { IApiService, LoginResponse } from "./IApiService";

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

  // performs login request by sending email + password and returns typed response
  // email + şifre göndererek login isteği yapar ve tip güvenli yanıt döner
  async login(email: string, password: string): Promise<LoginResponse> {
    // sends POST request to /auth/login with credentials
    // kimlik bilgileriyle /auth/login endpoint'ine POST isteği atar
    const response = await this.client.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    // returns only the data portion of the axios response
    // axios yanıtının sadece data kısmını döner
    return response.data;
  }

  // future API endpoints such as: getBalance(), transfer(), deposit()
  // ileride kullanılacak diğer API uç noktaları: getBalance(), transfer(), deposit() vb.
}
