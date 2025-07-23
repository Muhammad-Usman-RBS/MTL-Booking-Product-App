import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";

import AvailableJobs from "./AvailableJobs";

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
        pickupLocation: job.primaryJourney?.pickup || job.returnJourney?.pickup ,
        dropLocation: job.primaryJourney?.dropoff || job.returnJourney?.dropoff,
        extraGuidance: job.primaryJourney?.notes || job.returnJourney?.notes,
        estimatedTime: job.primaryJourney?.durationText || job.returnJourney?.durationText,
        distance: job.primaryJourney?.distanceText || job.returnJourney?.distanceText,
        driverFare: job.driverFare || job.returnDriverFare,
        status: job.status === "Scheduled" ? "scheduled" : "available",
      }));
  }, [bookings, driversData?.drivers, user?.employeeNumber, companyId]);

  const [jobs, setJobs] = useState([]);

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

  const handleAccept = (jobId) => {
    console.log("accepted");
  };

  const handleReject = (jobId) => {
    console.log("accepted");
  };

  if (bookingsLoading || driversLoading) return <div>Loading bookings...</div>;
  if (bookingsError || driversError) return <div>Error loading bookings.</div>;

  return (
    <div>
      <div className="">
        <div>
          <AvailableJobs
            jobs={availableJobs}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </div>
      </div>
    </div>
  );
};

export default DriverPortalHome;
