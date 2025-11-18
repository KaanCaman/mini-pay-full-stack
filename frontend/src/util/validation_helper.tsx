export default class ValidationHelper {
  // simple email format validation using regex
  // regex kullanarak basit email format doğrulaması
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // additional validation methods can be added here
  // buraya ek doğrulama metotları eklenebilir
}
