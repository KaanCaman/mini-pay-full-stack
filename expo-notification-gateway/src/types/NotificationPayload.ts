// Shape of the notification payload coming from your Go backend
// Go backend'den gelecek bildirim verisinin tipi (şeması)
export interface NotificationPayload {
  to: string; // Expo push token (ExponentPushToken[...] formatı)
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default" | null;
  priority?: "default" | "normal" | "high";
  ttl?: number; // seconds to keep notification alive
  expiration?: number; // unix timestamp when notification expires
}
