import { ApiResponse, LoginData, RegisterData } from "./types";

// API servis arayüzü
export interface IApiService {
  //
  // AUTHENTICATION ENDPOINTS
  //

  // user login response type
  // kullanıcı girişi yanıt tipi
  login(email: string, password: string): Promise<ApiResponse<LoginData>>;

  // user registration response type
  // kullanıcı kayıt yanıt tipi

  register(email: string, password: string): Promise<ApiResponse<RegisterData>>;

  // checks if the provided token is valid
  // verilen token'ın geçerli olup olmadığını kontrol eder
  isAuthenticated(token: string): Promise<boolean>;
  //
  //
}
