import axios from "axios";
import type { NotificationPayload } from "../types/NotificationPayload";

// Default Expo Push API endpoint, can be overridden by environment variable
// Varsayılan Expo Push API adresi, environment ile override edilebilir
const EXPO_PUSH_ENDPOINT =
  process.env.EXPO_PUSH_ENDPOINT || "https://exp.host/--/api/v2/push/send";

//  Max number of messages per batch according to Expo docs
// Expo dokümantasyonuna göre bir batch içinde gönderilebilecek maksimum mesaj sayısı
const MAX_EXPO_BATCH_SIZE = 100;

//  Basic shape of Expo's push API response for a single message
// Tekli mesaj için Expo push API yanıtının temel şekli
interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: {
    error?: string;
    [key: string]: any;
  };
}

//  Generic wrapper for our service return type
// Servisimizin döndüreceği genel sonuç tipi
export interface PushResult {
  success: boolean;
  ticketId?: string;
  error?: string;
  details?: any;
}

//  Result for each message in batch sending
// Batch gönderimde her mesaj için sonuç tipi
export interface BatchPushResult {
  success: boolean;
  results: Array<
    PushResult & {
      index: number; // index of payload in the original array
    }
  >;
}

// =======================
// Helper functions
// =======================

//  Minimal implementation of Expo.isExpoPushToken()
// Expo.isExpoPushToken() fonksiyonunun minimal bir implementasyonu
export function isExpoPushToken(token: string): boolean {
  //  Valid Expo tokens look like: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
  // Geçerli Expo token'ları şu formdadır: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
  const expoTokenRegex = /^ExponentPushToken\[[a-zA-Z0-9\-\_]+\]$/;
  return expoTokenRegex.test(token);
}

//  Utility to chunk an array into smaller arrays of given size
// Bir diziyi verilen boyutta parçalara bölen yardımcı fonksiyon
function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

// =======================
// Single notification sender
// =======================

//  Sends a single push notification to Expo Push API
// Tek bir push bildirimi Expo Push API'ye gönderir
export async function sendPushNotification(
  payload: NotificationPayload
): Promise<PushResult> {
  //  Validate Expo token format before doing network call
  // Network isteği yapmadan önce Expo token formatını doğrula
  if (!isExpoPushToken(payload.to)) {
    return {
      success: false,
      error: "Invalid Expo push token format",
      details: { to: payload.to },
    };
  }

  try {
    //  Build request body compatible with Expo Push API
    // Expo Push API ile uyumlu istek gövdesini oluştur
    const body = {
      to: payload.to,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      sound: payload.sound ?? "default",
      priority: payload.priority ?? "high",
      ttl: payload.ttl,
      expiration: payload.expiration,
    };

    //  Send POST request with JSON content type
    // JSON içerik tipi ile POST isteği gönder
    const response = await axios.post<{ data: ExpoPushTicket }>(
      EXPO_PUSH_ENDPOINT,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10_000, //  10 seconds timeout / 10 saniye zaman aşımı
      }
    );

    const ticket = response.data.data;

    //  Handle Expo ticket response
    // Expo'nun döndürdüğü ticket yanıtını işle
    if (ticket.status === "ok") {
      console.log(
        "[push] ✅ Notification sent successfully",
        //  Only log minimal info in production
        // Production ortamında minimum bilgi loglamaya dikkat et
        { to: payload.to, ticketId: ticket.id }
      );

      return {
        success: true,
        ticketId: ticket.id,
      };
    } else {
      console.error("[push] ❌ Expo returned error ticket", {
        to: payload.to,
        message: ticket.message,
        details: ticket.details,
      });

      return {
        success: false,
        error: ticket.message || "Expo push error",
        details: ticket.details,
      };
    }
  } catch (error: unknown) {
    //  Network or unexpected errors are caught here
    // Network veya beklenmeyen hatalar burada yakalanır
    console.error("[push] 💥 Error while sending push notification", {
      error,
    });

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error while sending notification",
    };
  }
}

// =======================
// Batch notification sender (<= 100 messages)
// =======================

//  Sends up to 100 push notifications in a single HTTP call
// Tek bir HTTP isteğinde en fazla 100 bildirim gönderir
export async function sendPushNotificationBatch(
  payloads: NotificationPayload[]
): Promise<BatchPushResult> {
  //  Hard guard: Expo does not allow more than 100 messages per request
  // Sert kontrol: Expo tek request'te 100'den fazla mesaj kabul etmez
  if (payloads.length > MAX_EXPO_BATCH_SIZE) {
    throw new Error(
      `Batch size exceeds ${MAX_EXPO_BATCH_SIZE}. Split your payloads before calling this function.`
    );
  }

  //  Filter out invalid tokens before hitting the network
  // Network isteği yapmadan önce geçersiz token'ları filtrele
  const validPayloads: Array<{ payload: NotificationPayload; index: number }> =
    [];

  payloads.forEach((payload, index) => {
    if (isExpoPushToken(payload.to)) {
      validPayloads.push({ payload, index });
    } else {
      console.warn("[push-batch] ⚠️ Skipping invalid Expo token", {
        index,
        to: payload.to,
      });
    }
  });

  if (validPayloads.length === 0) {
    return {
      success: false,
      results: [],
    };
  }

  //  Expo also supports array of messages in a single POST
  // Expo tek POST isteğinde mesaj dizisi almayı da destekler
  const messages = validPayloads.map((item) => ({
    to: item.payload.to,
    title: item.payload.title,
    body: item.payload.body,
    data: item.payload.data ?? {},
    sound: item.payload.sound ?? "default",
    priority: item.payload.priority ?? "high",
    ttl: item.payload.ttl,
    expiration: item.payload.expiration,
  }));

  try {
    const response = await axios.post<{ data: ExpoPushTicket[] }>(
      EXPO_PUSH_ENDPOINT,
      messages,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15_000,
      }
    );

    const tickets = response.data.data;

    const results: BatchPushResult["results"] = tickets.map((ticket, i) => {
      const originalIndex = validPayloads[i].index;

      if (ticket.status === "ok") {
        return {
          index: originalIndex,
          success: true,
          ticketId: ticket.id,
        };
      }

      return {
        index: originalIndex,
        success: false,
        error: ticket.message || "Expo push error",
        details: ticket.details,
      };
    });

    console.log("[push-batch] 📤 Batch sent", {
      total: payloads.length,
      valid: validPayloads.length,
      successful: results.filter((r) => r.success).length,
    });

    return {
      success: results.every((r) => r.success),
      results,
    };
  } catch (error: unknown) {
    console.error("[push-batch] 💥 Error while sending batch notifications", {
      error,
    });

    return {
      success: false,
      results: [],
    };
  }
}

// =======================
// Public API of this module
// =======================

//  This module exports:
//  - isExpoPushToken: token format validator
//  - sendPushNotification: single send
//  - sendPushNotificationBatch: up to 100 notifications
// Bu modül şu fonksiyonları dışa aktarır:
//  - isExpoPushToken: token formatını doğrular
//  - sendPushNotification: tekli gönderim
//  - sendPushNotificationBatch: 100'e kadar bildirim gönderimi
