import express from "express";
import { createBooking,  getAllBookings, updateBooking, updateBookingStatus, getAllPassengers, sendBookingEmail, restoreOrDeleteBooking, getAllBookingsForSuperadmin } from "../controllers/bookingController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-booking", protect, authorize('clientadmin', 'associateadmin', 'staffmember', "customer"), createBooking);
router.get("/get-booking", getAllBookings);
router.put("/update-booking/:id", protect, updateBooking);
router.patch("/:id", protect, updateBookingStatus);
router.get("/get-all-passengers", protect, authorize('clientadmin', 'associateadmin', 'staffmember'), getAllPassengers);
router.post("/send-booking-email", sendBookingEmail);
router.put("/restore-or-delete/:id", protect, authorize('clientadmin', 'associateadmin'), restoreOrDeleteBooking);
router.get("/superadmin/all", protect, authorize("superadmin"), getAllBookingsForSuperadmin);

export default router;
