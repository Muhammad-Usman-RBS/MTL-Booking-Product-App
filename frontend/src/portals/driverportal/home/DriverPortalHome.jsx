import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";

import AvailableJobs from "./AvailableJobs";
import DriverScheduledJobs from "./DriverScheduledJobs";

const DriverPortalHome = () => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const {
    data: bookingsData = {},
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useGetAllBookingsQuery(companyId, { skip: !companyId });

  const {
    data: driversData,
    isLoading: driversLoading,
    isError: driversError,
  } = useGetAllDriversQuery(companyId, {
    skip: !companyId,
  });

  const bookings = bookingsData?.bookings || [];

  // Normalize and categorize jobs
  const driverJobs = useMemo(() => {
    if (
      !Array.isArray(bookings) ||
      !Array.isArray(driversData?.drivers) ||
      !user?.employeeNumber
    ) {
      return [];
    }

    return bookings
      .filter((booking) => {
        if (
          booking.companyId !== companyId ||
          !Array.isArray(booking.drivers)
        ) {
          return false;
        }

        return booking.drivers.some((driverId) => {
          const id = typeof driverId === "object" ? driverId._id : driverId;
          const driver = driversData.drivers.find((d) => d._id === id);
          return driver?.DriverData?.employeeNumber === user.employeeNumber;
        });
      })
      .map((job) => ({
        _id: job._id,
        customerName: job.passenger?.name || "Unnamed Passenger",
        pickupLocation: job.primaryJourney?.pickup || "Unknown",
        dropLocation: job.primaryJourney?.dropoff || "Unknown",
        extraGuidance: job.primaryJourney?.notes || "",
        estimatedTime: job.primaryJourney?.durationText || "Unknown",
        distance: job.primaryJourney?.distanceText || "Unknown",
        driverFare: job.driverFare || 0,
        status: job.status === "Scheduled" ? "scheduled" : "available",
      }));
  }, [bookings, driversData?.drivers, user?.employeeNumber, companyId]);

  const [jobs, setJobs] = useState([]);

  // Sync jobs once loaded
  React.useEffect(() => {
    if (
      !bookingsLoading &&
      !driversLoading &&
      !bookingsError &&
      !driversError
    ) {
      setJobs(driverJobs);
    }
  }, [driverJobs, bookingsLoading, driversLoading]);

  const availableJobs = jobs.filter((job) => job.status === "available");
  const scheduledJobs = jobs.filter((job) => job.status === "scheduled");

  const handleAccept = (jobId) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job._id === jobId ? { ...job, status: "scheduled" } : job
      )
    );
  };

  const handleReject = (jobId) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
  };

  const [activeSection, setActiveSection] = useState("Available");

  if (bookingsLoading || driversLoading) return <div>Loading bookings...</div>;
  if (bookingsError || driversError) return <div>Error loading bookings.</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mb-8">
        <button
          onClick={() => setActiveSection("Available")}
          className={`${
            activeSection === "Available" ? "btn btn-reset" : "btn btn-primary"
          }`}
        >
          <span>Available Jobs</span>
          {availableJobs.length > 0 && (
            <span className="bg-white ml-2 text-black bg-opacity-20 text-xs px-2 py-1 rounded-full font-medium">
              {availableJobs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection("Scheduled")}
          className={`${
            activeSection === "Scheduled" ? "btn btn-reset" : "btn btn-primary"
          }`}
        >
          <span>Scheduled</span>
          {scheduledJobs.length > 0 && (
            <span className="ml-2 bg-white text-black bg-opacity-20 text-xs px-2 py-1 rounded-full font-medium">
              {scheduledJobs.length}
            </span>
          )}
        </button>
      </div>

      <div className="h-[600px] md:h-auto overflow-y-auto">
        <div
          className={`${activeSection === "Available" ? "block" : "hidden"}`}
        >
          <AvailableJobs
            jobs={availableJobs}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </div>

        <div
          className={`${activeSection === "Scheduled" ? "block" : "hidden"}`}
        >
          <DriverScheduledJobs jobs={scheduledJobs} />
        </div>
      </div>
    </div>
  );
};

export default DriverPortalHome;
