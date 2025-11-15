import { Router, Request, Response } from "express";
import {
  sendPushNotification,
  sendPushNotificationBatch,
  isExpoPushToken,
} from "../services/sendPush";
import type { NotificationPayload } from "../types/NotificationPayload";

const router = Router();

/* ------------------------------------------------------
   POST /send
   Tek bir push bildirimi gönderir
------------------------------------------------------ */
router.post("/send", async (req: Request, res: Response) => {
  // validate body
  // body'yi doğrula
  const body = req.body as NotificationPayload;

  if (!body.to || !body.title || !body.body) {
    return res.status(400).json({
      success: false,
      message: "to, title and body fields are required",
    });
  }

  // token validation
  // token doğrulama
  if (!isExpoPushToken(body.to)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Expo push token format",
    });
  }

  // call sender service
  // gönderim servisini çağır
  const result = await sendPushNotification(body);

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: result.error,
      details: result.details,
    });
  }

  return res.json({
    success: true,
    ticketId: result.ticketId,
  });
});

/* ------------------------------------------------------
   POST /send-batch
   100'e kadar push bildirimi gönderir
------------------------------------------------------ */
router.post("/send-batch", async (req: Request, res: Response) => {
  const { notifications } = req.body;

  // validation
  // doğrulama
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return res.status(400).json({
      success: false,
      message: "notifications array is required",
    });
  }

  if (notifications.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Maximum 100 notifications allowed per request",
    });
  }

  // convert payload type
  // payload tipine dönüştür
  const payloads = notifications as NotificationPayload[];

  // call batch sender
  // batch gönderim servisini çağır
  const result = await sendPushNotificationBatch(payloads);

  return res.json(result);
});

export default router;
