import { AxiosApiClient } from "./client/AxiosApiClient";
import { MiniPayApiService } from "./service/MiniPayApiService";

// 1. Create Instances (Singleton)
const apiClient = new AxiosApiClient();
const apiService = new MiniPayApiService(apiClient);

// 2. Export Instances
// Uygulamanın geri kalanı bu instance'ları kullanacak
export { apiService, apiClient };

// 3. Export Types & Interfaces
// Sadece gerekli olanları dışarı aktarıyoruz. 'export *' kullanmıyoruz.

// Client Types
export { IApiClient } from "./client/IApiClient";
export { AxiosApiClient } from "./client/AxiosApiClient";
export * from "./client/types";

// Service Types
export { IApiService } from "./service/IApiService";
export { MiniPayApiService } from "./service/MiniPayApiService";
export * from "./service/types";
