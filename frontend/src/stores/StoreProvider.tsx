import React, { createContext, useContext, useEffect } from "react";
import { rootStore, RootStore } from "./RootStore";

// creates a React context to expose the RootStore to the component tree
// component ağacına RootStore'u sağlayacak React context'i oluşturur
const StoreContext = createContext<RootStore>(rootStore);

// provides the rootStore to the entire app using React context
// rootStore'u tüm uygulamaya React context üzerinden sağlar
export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  // runs only once when the provider is first mounted
  // provider ilk yüklendiğinde sadece bir kez çalışır
  useEffect(() => {
    // triggers hydration process (loading token, userId, etc.)
    // token ve userId gibi değerlerin yüklenmesi için hydrate() çağrılır
    rootStore.hydrate();
  }, []);

  // wraps children inside context provider so all screens can access stores
  // tüm ekranların store'lara erişebilmesi için children context provider içine sarılır
  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
};

// exposes a custom hook for consuming stores inside components
// component'lar içinde store'lara erişmek için özel bir hook sağlar
export const useStores = () => useContext(StoreContext);
