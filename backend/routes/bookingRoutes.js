import express from "express";
import { createBooking, deleteBooking, getAllBookings, updateBooking, submitWidgetForm, updateBookingStatus, getAllPassengers, sendBookingEmail } from "../controllers/bookingController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new booking (public access)
router.post("/create-booking",  createBooking);

// Get all bookings (admin access)
router.get("/get-booking", getAllBookings);

// Update a booking by ID
router.put("/update-booking/:id", updateBooking);

// Delete a booking by ID
router.delete("/delete-booking/:id", deleteBooking);

// Submit booking via widget (iframe or embedded form)
router.post('/submit', submitWidgetForm);

// Update booking status (e.g., confirmed, cancelled)
router.patch("/:id",protect, updateBookingStatus);

// Get all passengers (protected & role-based access)
router.get("/get-all-passengers", protect, authorize('clientadmin', 'associateadmin', 'staffmember'), getAllPassengers);

// Send Booking Data
router.post("/send-booking-email", sendBookingEmail);
export default router;
