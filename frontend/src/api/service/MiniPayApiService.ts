import { IApiClient } from "../client/IApiClient";
import { IApiService } from "./IApiService";
import { ApiResponse, LoginData, RegisterData, MeData } from "./types";

//
// MiniPayApiService
// Concrete implementation of IApiService using IApiClient as the HTTP layer.
//
// MiniPayApiService
// HTTP katmanı olarak IApiClient kullanan IApiService'in somut implementasyonu.
export class MiniPayApiService implements IApiService {
  // The injected API client (AxiosApiClient or mock implementation)
  // Enjekte edilen API istemcisi (AxiosApiClient veya test için mock)
  private client: IApiClient;

  // Constructor receives a generic HTTP client (IApiClient)
  // Constructor, genel HTTP istemcisini alır (IApiClient)

  constructor(client: IApiClient) {
    this.client = client;
  }

  //
  // Performs login with email + password.
  //
  // Uses IApiClient.post() → returns IApiResponse<ApiResponse<LoginData>>
  // We unwrap `.data` and return ApiResponse<LoginData> to the caller.
  //
  // Email + şifre ile login işlemini yapar.
  // IApiClient.post() → IApiResponse<ApiResponse<LoginData>> döner.
  // `.data` içinden ApiResponse<LoginData> alınarak UI katmanına döndürülür.
  ///
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<LoginData>> {
    const response = await this.client.post<ApiResponse<LoginData>>("/login", {
      email,
      password,
    });

    return response.data; // unwrap IApiResponse<T>
  }

  // Registers a new user with email + password.
  // Yeni kullanıcı kaydı oluşturur (email + password).

  async register(
    email: string,
    password: string
  ): Promise<ApiResponse<RegisterData>> {
    const response = await this.client.post<ApiResponse<RegisterData>>(
      "/register",
      { email, password }
    );

    return response.data;
  }
  //Checks if token is authenticated via /me
  // /me endpoint'i üzerinden token doğrulaması yapar.

  async isAuthenticated(token: string): Promise<boolean> {
    try {
      const response = await this.client.get<ApiResponse<MeData>>("/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.success === true;
    } catch {
      return false;
    }
  }

  //
  //
}
