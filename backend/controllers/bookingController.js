import BookingModel from "../models/Booking.js"
import Booking from "../models/Booking.js";

export const createBooking = async (req, res) => {
    try {
        const {
            mode,
            returnJourney,
            journey1,
            journey2
        } = req.body;

        if (!mode || returnJourney === undefined || !journey1) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        if (!journey1.date || journey1.hour === undefined || journey1.minute === undefined) {
            return res.status(400).json({ message: "Journey1 date/hour/minute missing" });
        }

        if (returnJourney) {
            if (!journey2 || !journey2.date || journey2.hour === undefined || journey2.minute === undefined) {
                return res.status(400).json({ message: "Journey2 date/hour/minute missing" });
            }
        }

        const bookingData = {
            mode,
            returnJourney,
            journey1: journey1,
            journey2: returnJourney ? journey2 : undefined
        };

        const booking = await Booking.create(bookingData);

        res.status(200).json({
            success: true,
            message: "Booking created successfully",
            booking
        });

    } catch (error) {
        console.error("Error in createBooking controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error in createBooking",
            error: error.message
        });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const booking = await BookingModel.find()
        res.status(200).json({ message: "all bookings fetched  successfully", booking })
    } catch (error) {
        console.log("error inn get booking controller", error)
        res.status(500).json({ success: false, message: " error in get booking controller ", error })

    }
}

export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params
        const updatedData = req.body;

        const booking = await BookingModel.findByIdAndUpdate(id, updatedData, {
            new: true,
        });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "booking updated Successfully", booking })
    } catch (error) {
        console.log("error in booking update controller", error)

        res.status(500).json({ message: "error in booking update controller", error })
    }
}

export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params
        const booking = await BookingModel.findByIdAndDelete(id)
        res.status(200).json({ message: "Booking deleted successfully", booking })
    } catch (error) {
        console.log("error in booking Delete controller", error)

        res.status(500).json({ message: "error in booking delete controller", error })
    }
}