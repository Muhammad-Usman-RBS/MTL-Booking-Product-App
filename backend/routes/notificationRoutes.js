import express from "express"
const router = express.Router();
import {
  getUserNotifications,
  markNotificationRead,
  markAllRead,
  createNotification,
  deleteNotification,
} from "../controllers/notificationController.js";

router.get("/get-notification-byId/:employeeNumber", getUserNotifications);
router.post("/createNotification", createNotification);
router.patch("/read-single-notification/:id", markNotificationRead);
router.patch("/read-all-notification/:employeeNumber", markAllRead);
router.delete("/delete-notification/:id", deleteNotification);

export default router;