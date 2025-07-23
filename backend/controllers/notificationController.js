import Notification from "../models/Notification.js";

import Booking from "../models/Booking.js";
import User from "../models/User.js";

export const createNotification = async (req, res) => {
  try {
    const { employeeNumber, bookingId, createdBy, companyId } = req.body;

    const user = await User.findOne({ employeeNumber, companyId });
    if (!user) {
      return res
        .status(404)
        .json({ error: "No user found with this employee number in company" });
    }

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const isReturn = booking.returnJourneyToggle;
    const journey = isReturn ? booking.returnJourney : booking.primaryJourney;

    const pickup = journey?.pickup || "N/A";
    const dropoff = journey?.dropoff || "N/A";

    const notification = new Notification({
      employeeNumber,
      bookingId,
      status: booking.status,
      primaryJourney: {
        pickup,
        dropoff,
      },
      bookingSentAt: new Date(),
      createdBy,
      companyId,
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ error: "Error creating notification" });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const { employeeNumber } = req.params;

    const notifications = await Notification.find({
      employeeNumber: String(employeeNumber),
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const employeeNumber = req.params.employeeNumber;

    const result = await Notification.updateMany(
      { employeeNumber: String(employeeNumber) },
      { isRead: true }
    );

    res.json({ success: true, updated: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: "Error marking all as read" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error deleting notification" });
  }
};
