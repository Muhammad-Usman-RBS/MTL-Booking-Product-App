import express from "express"
import { createBooking, deleteBooking, getAllBookings, updateBooking, submitWidgetForm, updateBookingStatus, getAllPassengers } from "../controllers/bookingController.js"
import { authorize, protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/create-booking", createBooking)
router.get("/get-booking", getAllBookings)
router.put("/update-booking/:id", updateBooking)
router.delete("/delete-booking/:id", deleteBooking)
router.post('/submit', submitWidgetForm);
router.patch("/:id", updateBookingStatus);
router.get("/get-all-passengers", protect, authorize('clientadmin', 'associateadmin', 'staffmember'), getAllPassengers);

export default router