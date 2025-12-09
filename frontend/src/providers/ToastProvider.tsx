import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import Toast, { ToastConfig, ToastType } from "../components/utils/Toast";

interface ToastContextType {
  showToast: (
    type: ToastType,
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: {
        label: string;
        onPress: () => void;
      };
    }
  ) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  hideToast: (id: string) => void;
  hideAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const showToast = useCallback(
    (
      type: ToastType,
      title: string,
      message?: string,
      options?: {
        duration?: number;
        action?: {
          label: string;
          onPress: () => void;
        };
      }
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastConfig = {
        id,
        type,
        title,
        message,
        duration: options?.duration || 4000,
        action: options?.action,
      };

      setToasts((prev) => {
        // Limit to 3 toasts at a time
        const updated = [...prev, newToast];
        return updated.slice(-3);
      });
    },
    []
  );

  // Register with Singleton Service for global access (AuthStore, etc.)
  // Global erişim için Singleton Servise kaydet (AuthStore vb.)
  useEffect(() => {
    // Dynamically import to avoid circular dependencies if any, though here it's fine
    // Olası dairesel bağımlılıkları (circular dependency) önlemek için dinamik import kullanılıyor

    const { default: ToastService } = require("../services/ToastService");
    // require ile ToastService'i dinamik olarak import ediyoruz
    // default export’u ToastService adıyla çekiyoruz

    ToastService.register(showToast);
    // ToastService'in register metoduna "showToast" fonksiyonunu veriyoruz
    // Böylece uygulamanın herhangi bir yerinde ToastService üzerinden showToast çağrılabilir
    // Yani merkezi bir Toast yönetimi sağlanıyor
  }, [showToast]);
  // useEffect yalnızca showToast değiştiğinde tekrar çalışır

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const hideAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast("success", title, message, { duration });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast("error", title, message, { duration });
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast("warning", title, message, { duration });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast("info", title, message, { duration });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        error,
        warning,
        info,
        hideToast,
        hideAll,
      }}
    >
      {children}
      <Toast toasts={toasts} onDismiss={hideToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
