import { AuthStore } from "./AuthStore";

import { setOnUnauthorized, apiService } from "../api/";

// defines the RootStore which holds and initializes all other MobX stores
// diğer tüm MobX store'larını tutan ve başlatan RootStore'u tanımlar
export class RootStore {
  // declares a property to hold the authentication store instance
  // authentication store instance'ını tutacak bir özellik tanımlar
  authStore: AuthStore;

  // constructor initializes all store instances and wires up global behaviors
  // constructor tüm store instance'larını başlatır ve global davranışları bağlar
  constructor() {
    // creates the authentication store and injects the API service dependency
    // authentication store'u oluşturur ve API servisini dependency olarak enjekte eder
    this.authStore = new AuthStore(apiService);

    // attaches a global handler that runs when httpClient receives a 401 response
    // httpClient 401 yanıt aldığında çalışacak global handler'ı bağlar
    setOnUnauthorized(() => {
      this.authStore.handleUnauthorized();
    });
  }

  // hydrates all root-level stores during app startup
  // uygulama açılışında root seviyesindeki tüm store'ları hydrate eder
  hydrate = async () => {
    await this.authStore.hydrate();
  };
}

// creates a single shared instance of the RootStore (singleton)
// RootStore'un tek bir paylaşılan instance'ını (singleton) oluşturur
export const rootStore = new RootStore();
