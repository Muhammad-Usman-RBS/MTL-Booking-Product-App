import mongoose from "mongoose";
import CronJob from "../../models/settings/CronJob.js";
import Booking from "../../models/Booking.js";
import Driver from "../../models/Driver.js";
import User from "../../models/User.js";
import Job from "../../models/Job.js";

export const autoAllocateDrivers = async (companyId, assignedBy) => {
  const cronJob = await CronJob.findOne({ companyId });
  if (!cronJob?.autoAllocation?.enabled) return;
  const firstWord = (s = "") => s.trim().split(/\s+/)[0] || "";
  const allocationHours = parseInt(cronJob.autoAllocation.timing.hours) || 0;
  const drivers = await Driver.find({ companyId });
  const users = await User.find({});
  const usersByEmpNumber = new Map(
    users.map((user) => [user.employeeNumber, user])
  );
  const bookings = await Booking.find({
    companyId,
    "drivers.0": { $exists: false },
  });

  for (const booking of bookings) {
    const journey = booking.returnJourneyToggle
      ? booking.returnJourney
      : booking.primaryJourney;
    const bookingTime = new Date(journey.date);
    bookingTime.setHours(journey.hour, journey.minute, 0, 0);

    const allocationTriggerTime = new Date(
      bookingTime.getTime() - allocationHours * 60 * 60 * 1000
    );
    const now = new Date();

    if (now < allocationTriggerTime || now >= bookingTime) continue;

    const bookingVehicleType = booking?.vehicle?.vehicleName
      ?.toLowerCase()
      ?.trim();
    let matchedDrivers = [];

    for (const driver of drivers) {
      const empNumber = driver?.DriverData?.employeeNumber;
      const vehicleTypes = (driver?.VehicleData?.vehicleTypes || []).map((t) =>
        t.toLowerCase().trim()
      );

      if (!usersByEmpNumber.has(empNumber)) continue;
      if (vehicleTypes.includes(bookingVehicleType)) {
        matchedDrivers.push(driver);
      }
    }

    if (matchedDrivers.length === 0) continue;

    const driverAssignments = [];
    const jobPromises = [];

    for (const driver of matchedDrivers) {
      const driverUser = usersByEmpNumber.get(driver.DriverData.employeeNumber);

      if (!driverUser) continue;

      driverAssignments.push({
        _id: String(driverUser._id),
        userId: String(driverUser._id),
        driverId: String(driver._id),
        name: firstWord(driverUser.fullName || ""),
        email: driverUser.email || "",
        employeeNumber: String(driver.DriverData.employeeNumber),
        contact: String(driver.DriverData.contact),
      });

      const existingJob = await Job.findOne({
        bookingId: booking._id,
        driverId: driverUser._id,
      });

      if (!existingJob) {
        jobPromises.push(
          Job.create({
            bookingId: booking._id,
            driverId: driverUser._id,
            assignedBy: assignedBy,
            companyId: booking.companyId,
            jobStatus: "New",
            driverRejectionNote: null,
            history: [
              {
                status: "New",
                date: new Date(),
                updatedBy: null,
                reason: "Auto allocated by system",
              },
            ],
          })
        );
      }
    }

    await Booking.findOneAndUpdate(
      { _id: booking._id },
      { $set: { drivers: driverAssignments } },
      { new: true }
    );

    await Promise.all(jobPromises);
  }
};
