import express from "express"
import { createBooking, deleteBooking, getAllBookings, updateBooking, submitWidgetForm } from "../controllers/bookingController.js"

const router = express.Router()

router.post("/create-booking", createBooking)
router.get("/get-booking", getAllBookings)
router.put("/update-booking/:id", updateBooking)
router.delete("/delete-booking/:id", deleteBooking)
router.post('/submit', submitWidgetForm);

export default router