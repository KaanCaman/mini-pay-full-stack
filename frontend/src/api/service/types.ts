// defines the global MiniPay backend response format
// MiniPay backend'in standart yanıt formatını tanımlar
export interface ApiResponse<T> {
  // operation result
  // işlemin başarılı olup olmadığı
  success: boolean;

  // makine tarafından okunabilir kod (örn: LOGIN_SUCCESS)
  // machine-readable code (e.g. LOGIN_SUCCESS)
  code: string;

  // backend tarafından gönderilen okunabilir mesaj
  // human-readable description from backend
  message: string;

  // generic data payload
  // genel veri
  data?: T;
}

// response of login endpoint
// login endpoint'inin yanıt tipi
export interface LoginData {
  token: string;
  userID: number;
}

// response of register endpoint
// register endpoint'inin yanıt tipi
export interface RegisterData {
  token: string;
  userID: number;
}

// response of /me endpoint
// /me endpoint'inin yanıt tipi
export interface MeData {
  userID: number;
}
