import Notification from "../models/Notification.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

import { io } from "../server.js";

const emitToEmployee = (employeeNumber, event, payload = {}) => {
  const emp = String(employeeNumber || "");
  console.log("[EMIT]", event, "-> room:", `emp:${emp}`, "payload:", payload?._id || "");
  io.to(`emp:${emp}`).emit(event, payload);
};

// ---------- helpers ----------
const toStr = (v) => (v == null ? "" : String(v));

const emitToCompany = (companyId, event, payload = {}) => {
  if (!companyId || !io) return;
  io.to(`co:${toStr(companyId)}`).emit(event, payload);
};

// ---------- CREATE ----------
export const createNotification = async (req, res) => {
  try {
    const { employeeNumber, bookingId, createdBy, companyId , jobId } = req.body || {};

    if (!employeeNumber || !bookingId || !companyId) {
      return res
        .status(400)
        .json({ error: "employeeNumber, bookingId, companyId are required" });
    }

    const user = await User.findOne({
      employeeNumber: toStr(employeeNumber),
      companyId: toStr(companyId),
    }).lean();

    if (!user) {
      return res
        .status(404)
        .json({ error: "No user found with this employee number in company" });
    }

    const booking = await Booking.findOne({ bookingId: toStr(bookingId) }).lean();
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const isReturn = !!booking.returnJourneyToggle;
    const journey = isReturn ? booking.returnJourney : booking.primaryJourney;

    const pickup = journey?.pickup || "N/A";  
    const dropoff = journey?.dropoff || "N/A";

    const doc = new Notification({
      employeeNumber: toStr(employeeNumber),
      jobId: booking._id,
      bookingId: toStr(bookingId),
      status: booking.status,
      primaryJourney: { pickup, dropoff },
      bookingSentAt: new Date(),
      createdBy: createdBy ? toStr(createdBy) : undefined,
      companyId: toStr(companyId),
    });

    const notification = await doc.save();

    // 🔔 realtime emit (per-employee); optional broadcast per-company
    emitToEmployee(employeeNumber, "notification:new", notification);
    // emitToCompany(companyId, "notification:new", notification); // uncomment if you want org-wide feed

    return res.status(201).json(notification);
  } catch (err) {
    console.error("Notification error:", err);
    return res.status(500).json({ error: "Error creating notification" });
  }
};

// ---------- LIST (optional pagination: ?limit=30&before=<iso> ) ----------
export const getUserNotifications = async (req, res) => {
  try {
    const { employeeNumber } = req.params;
    if (!employeeNumber) {
      return res.status(400).json({ error: "employeeNumber is required" });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100); // cap
    const beforeISO = req.query.before; // fetch older than a timestamp (optional)
    const match = { employeeNumber: toStr(employeeNumber) };

    if (beforeISO && !Number.isNaN(Date.parse(beforeISO))) {
      match.createdAt = { $lt: new Date(beforeISO) };
    }

    const notifications = await Notification.find(match)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json(notifications);
  } catch (err) {
    console.error("getUserNotifications error:", err);
    return res.status(500).json({ error: "Error fetching notifications" });
  }
};

// ---------- MARK SINGLE READ ----------
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "id is required" });

    const updated = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // 🔔 inform that a single item became read
    emitToEmployee(updated.employeeNumber, "notification:update", {
      type: "read-single",
      id: updated._id,
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error("markNotificationRead error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------- MARK ALL READ ----------
export const markAllRead = async (req, res) => {
  try {
    const employeeNumber = toStr(req.params.employeeNumber);
    if (!employeeNumber) {
      return res.status(400).json({ error: "employeeNumber is required" });
    }

    const result = await Notification.updateMany(
      { employeeNumber },
      { isRead: true }
    );

    // 🔔 broadcast an action so clients flip all to read
    emitToEmployee(employeeNumber, "notification:update", { type: "read-all" });

    return res.json({ success: true, updated: result.modifiedCount });
  } catch (err) {
    console.error("markAllRead error:", err);
    return res.status(500).json({ error: "Error marking all as read" });
  }
};

// ---------- DELETE ----------
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Notification.findById(id).lean();
    if (!doc) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await Notification.findByIdAndDelete(id);

    // 🔔 let clients remove from list
    emitToEmployee(doc.employeeNumber, "notification:update", {
      type: "deleted",
      id,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("deleteNotification error:", err);
    return res.status(500).json({ error: "Error deleting notification" });
  }
};
