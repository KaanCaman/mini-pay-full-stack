// declares the shape of a successful login response returned by the backend
// backend tarafından dönen başarılı login cevabının yapısını tanımlar
export interface LoginResponse {
  token: string;
  user_id: number;
}

// defines a contract that every API service implementation must follow
// tüm API servis implementasyonlarının uyması gereken sözleşmeyi tanımlar
export interface IApiService {
  // sends login request with email & password and returns typed LoginResponse
  // email ve şifre ile login isteği gönderir ve tip güvenli LoginResponse döner
  login(email: string, password: string): Promise<LoginResponse>;

  // future API methods (getBalance, transfer, deposit etc.) will be added here
  // gelecekteki API metotları (bakiye alma, transfer, yatırma vb.) buraya eklenecek
}
