import BookingRestriction from "../../models/settings/BookingRestrictionDate.js";

/* ---------------------- Helpers ---------------------- */
const isBetween = (ts, a, b) => ts >= a.getTime() && ts <= b.getTime();

const isActiveOneOffNow = (fromISO, toISO, now = new Date()) => {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  return isBetween(now.getTime(), from, to);
};

const isActiveYearlyNow = (fromISO, toISO, now = new Date()) => {
  // Month/Day/Time only; reuse current year; handle Dec→Jan wrap
  const f = new Date(fromISO);
  const t = new Date(toISO);
  const y = now.getFullYear();

  const fThis = new Date(
    y, f.getUTCMonth(), f.getUTCDate(),
    f.getUTCHours(), f.getUTCMinutes(), 0, 0
  );
  const tThis = new Date(
    y, t.getUTCMonth(), t.getUTCDate(),
    t.getUTCHours(), t.getUTCMinutes(), 0, 0
  );

  if (tThis >= fThis) {
    return isBetween(now.getTime(), fThis, tThis);
  }
  // wraps across year-end
  const endOfYear = new Date(y, 11, 31, 23, 59, 59, 999);
  const startOfYear = new Date(y, 0, 1, 0, 0, 0, 0);
  return isBetween(now.getTime(), fThis, endOfYear) || isBetween(now.getTime(), startOfYear, tThis);
};

const computeDesiredStatus = (doc, now = new Date()) => {
  const rec = String(doc.recurring || "").toLowerCase();
  const active = rec === "yearly"
    ? isActiveYearlyNow(doc.from, doc.to, now)
    : isActiveOneOffNow(doc.from, doc.to, now);
  return active ? "Active" : "Inactive";
};

const normalizeStatusNow = async (doc) => {
  const desired = computeDesiredStatus(doc);
  if (doc.status !== desired) {
    doc.status = desired;
    doc.updatedAt = new Date();
    await doc.save();
  }
  return doc;
};
/* -------------------- End Helpers -------------------- */

export const createBookingRestriction = async (req, res) => {
  try {
    const { caption, recurring, from, to, status, companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "Invalid or missing companyId" });
    }
    if (!caption || !recurring || !from || !to || !status) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newRestriction = new BookingRestriction({
      caption,
      recurring,
      from,
      to,
      status,
      companyId,
    });

    let saved = await newRestriction.save();
    // flip status immediately according to 'now'
    saved = await normalizeStatusNow(saved);

    res.status(201).json({
      message: "Booking Restriction created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error creating booking restriction:", error);
    res.status(500).json({ message: "Server error creating booking restriction" });
  }
};

export const getAllBookingRestrictions = async (req, res) => {
  const { companyId } = req.query;
  try {
    if (!companyId) {
      return res.status(400).json({ message: "Valid companyId is required" });
    }

    const docs = await BookingRestriction.find({ companyId });

    // Auto-sync statuses in DB if needed (minimal writes)
    const now = new Date();
    const ops = [];
    const mapped = docs.map((d) => {
      const desired = computeDesiredStatus(d, now);
      if (d.status !== desired) {
        ops.push({
          updateOne: {
            filter: { _id: d._id },
            update: { $set: { status: desired, updatedAt: new Date() } },
          },
        });
        d.status = desired; // reflect in response without requery
      }
      return d;
    });
    if (ops.length) await BookingRestriction.bulkWrite(ops);

    res.status(200).json({
      message: "The data was fetched successfully",
      data: mapped,
    });
  } catch (error) {
    console.error("Failed to fetch booking restrictions", error);
    res.status(500).json({ message: "Failed to fetch booking restrictions", error });
  }
};

export const getBookingRestrictionById = async (req, res) => {
  try {
    const { id } = req.params;
    let doc = await BookingRestriction.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Booking restriction not found" });
    }
    doc = await normalizeStatusNow(doc);
    res.status(200).json({ message: "Fetched by id successful", data: doc });
  } catch (error) {
    console.error("Failed to fetch booking restriction", error);
    res.status(500).json({ message: "Failed to fetch booking restriction", error });
  }
};

export const updateBookingRestriction = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, recurring, from, to, status } = req.body;

    const updatedData = { caption, recurring, from, to, status };

    let doc = await BookingRestriction.findByIdAndUpdate(id, updatedData, { new: true });
    if (!doc) {
      return res.status(404).json({ message: "Booking restriction not found" });
    }

    // normalize right after update
    doc = await normalizeStatusNow(doc);

    res.status(200).json({
      message: "Booking restriction updated successfully",
      data: doc,
    });
  } catch (error) {
    console.error("Error updating booking restriction:", error);
    res.status(500).json({ message: "Server error updating booking restriction" });
  }
};

export const deleteBookingRestriction = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BookingRestriction.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Booking restriction not found" });
    }

    res.status(200).json({
      message: "Booking restriction deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting booking restriction:", error);
    res.status(500).json({ message: "Server error deleting booking restriction" });
  }
};
