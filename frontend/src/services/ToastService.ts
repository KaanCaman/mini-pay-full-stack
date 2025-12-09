import { ToastType } from "../components/utils/Toast";

// Function type for toast provider
// Toast sağlayıcısı için fonksiyon tipi
type ShowToastFn = (
  type: ToastType,
  title: string,
  message?: string,
  options?: { duration?: number }
) => void;

// Toast service class
// Toast servis sınıfı
class ToastService {
  // Toast provider function
  // Toast sağlayıcı fonksiyonu
  private static showFn: ShowToastFn | null = null;

  // Register toast provider
  // Toast sağlayıcısını kaydet
  static register(fn: ShowToastFn) {
    this.showFn = fn;
  }

  // Show toast
  // Toast göster
  static show(
    type: ToastType,
    title: string,
    message?: string,
    options?: { duration?: number }
  ) {
    // Show toast if provider is registered
    // Sağlayıcı kayıtlıysa toast göster
    if (this.showFn) {
      this.showFn(type, title, message, options);
    }
    // Show toast if provider is not registered
    // Sağlayıcı kayıtlı değilse toast göster
    else {
      console.warn("ToastService: No toast provider registered.");
    }
  }

  // Show success toast
  // Başarı mesajı göster
  static success(title: string, message?: string) {
    this.show("success", title, message);
  }

  // Show error toast
  // Hata mesajı göster
  static error(title: string, message?: string) {
    this.show("error", title, message);
  }

  // Show warning toast
  // Uyarı mesajı göster
  static warning(title: string, message?: string) {
    this.show("warning", title, message);
  }

  // Show info toast
  // Bilgi mesajı göster
  static info(title: string, message?: string) {
    this.show("info", title, message);
  }
}

export default ToastService;
