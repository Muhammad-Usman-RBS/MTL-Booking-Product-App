import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetAllBookingsQuery,
  useUpdateBookingStatusMutation,
} from "../../../redux/api/bookingApi";
import { statusColors } from "../../../constants/dashboardTabsData/data";
import { useGetAllJobsQuery } from "../../../redux/api/jobsApi";
import { useGetBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";
const CustomerCard = () => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const [bookings, setBookings] = useState([]);

  const { data, error , refetch } = useGetAllBookingsQuery(companyId);
  const { data: jobData = {} } = useGetAllJobsQuery(companyId);
  const { data: bookingSettingsData } = useGetBookingSettingQuery();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  useEffect(() => {
    if (data?.bookings) {
      const userBookings = data.bookings.filter(
        (b) => b?.passenger?.email === user.email
      );
      setBookings(userBookings);
    }
  }, [data, user.email]);
useEffect(()=> {
  const onFocus = async () => {

    if(!error) {
      await refetch()
    }
  }
  window.addEventListener("focus" , onFocus)
  return ()=> window.removeEventListener("focus" , onFocus)
} , [refetch  , error])
  useEffect(() => {
    if (error) toast.error("Failed to load bookings");
  }, [error]);
  const handleCancelBooking = async (booking) => {
    try {
      const cancelSettings = bookingSettingsData?.setting
        ?.cancelBookingWindow || {
        value: 24,
        unit: "Hours",
      };

      // Create the actual journey date/time from the booking's primaryJourney
      const journey = booking.returnJourneyToggle
        ? booking.returnJourney
        : booking.primaryJourney;
      if (!journey) return; // Exit if no journey data

      const journeyDate = new Date(journey.date);
      journeyDate.setHours(journey.hour);
      journeyDate.setMinutes(journey.minute);

      const currentDate = new Date();
      const timeDiff = journeyDate - currentDate; // Time until the journey

      // Convert cancel window to milliseconds
      let cancelWindowInMs;
      switch (cancelSettings.unit) {
        case "Minutes":
          cancelWindowInMs = cancelSettings.value * 60 * 1000;
          break;
        case "Hours":
          cancelWindowInMs = cancelSettings.value * 60 * 60 * 1000;
          break;
        case "Days":
          cancelWindowInMs = cancelSettings.value * 24 * 60 * 60 * 1000;
          break;
        case "Weeks":
          cancelWindowInMs = cancelSettings.value * 7 * 24 * 60 * 60 * 1000;
          break;
        case "Months":
          cancelWindowInMs = cancelSettings.value * 30 * 24 * 60 * 60 * 1000; // Approximate
          break;
        case "Years":
          cancelWindowInMs = cancelSettings.value * 365 * 24 * 60 * 60 * 1000; // Approximate
          break;
        default:
          cancelWindowInMs = cancelSettings.value * 60 * 60 * 1000; // Default to hours
      }

      // Check if the time remaining until journey is less than the cancel window
      if (timeDiff < cancelWindowInMs) {
        toast.error(
          `Cannot cancel booking. Must cancel at least ${
            cancelSettings.value
          } ${cancelSettings.unit.toLowerCase()} before journey time.`
        );
        return;
      }

      await updateBookingStatus({
        id: booking._id,
        status: "Cancelled",
        updatedBy: user._id,
      }).unwrap();

      toast.success("Booking cancelled successfully");

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b._id === booking._id ? { ...b, status: "Cancelled" } : b
        )
      );
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const getFilteredDrivers = (booking) => {
    const drivers = booking.drivers || [];
    const jobsArray = jobData?.jobs || [];

    if (drivers.length === 0) {
      return [];
    }

    return drivers.filter((driver) => {
      const driverId = typeof driver === "object" ? driver._id : driver;

      const matchingJob = jobsArray.find(
        (job) =>
          job.driverId?.toString() === driverId?.toString() ||
          job.driverId?._id?.toString() === driverId?.toString()
      );

      return !matchingJob || matchingJob.jobStatus !== "Already Assigned";
    });
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 p-6">
      {bookings.length === 0 ? (
        <div className="col-span-full text-center text-lg font-medium text-gray-500">
          No bookings found for this customer.
        </div>
      ) : (
        bookings.map((booking) => (
          <>
            <div
              key={booking._id}
              className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-2xl transition-transform duration-300 transform hover:scale-[1.02] flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-bold text-[var(--dark-gray)]">
                    Booking ID: {booking.bookingId}
                  </h2>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                    style={{
                      background: statusColors[booking.status]?.bg,
                      color: statusColors[booking.status]?.text,
                    }}
                  >
                    {booking.status}
                  </span>
                </div>

                <hr className="mb-5 border-gray-200" />

                {/* Info Section */}
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex justify-between flex-wrap">
                    <span>
                      <strong>Passenger:</strong>{" "}
                      {booking?.passenger?.name || "N/A"}
                    </span>
                    <span>
                      <strong>Type:</strong>{" "}
                      {booking?.returnJourney ? "Return" : "Primary"}
                    </span>
                  </div>

                  {booking.primaryJourney ? (
                    <div className="flex justify-between flex-wrap">
                      <span>
                        <strong>Journey Fare:</strong>{" "}
                        {booking.journeyFare
                          ? `${booking.journeyFare} GBP`
                          : "N/A"}
                      </span>
                      <span>
                        <strong>Payment:</strong>{" "}
                        {booking?.paymentMethod || "N/A"}
                      </span>
                    </div>
                  ) : booking.returnJourney ? (
                    <div className="flex justify-between flex-wrap">
                      <span>
                        <strong>Return Fare:</strong>{" "}
                        {booking.returnJourneyFare
                          ? `${booking.returnJourneyFare} GBP`
                          : "N/A"}
                      </span>
                      <span>
                        <strong>Return Driver Fare:</strong>{" "}
                        {booking.returnDriverFare
                          ? `${booking.returnDriverFare} GBP`
                          : "N/A"}
                      </span>
                    </div>
                  ) : (
                    <div className="text-gray-700 font-semibold">
                      No Fare Available
                    </div>
                  )}

                  <div className="flex justify-between flex-wrap">
                    <span>
                      <strong>Vehicle:</strong>{" "}
                      {booking?.vehicle?.vehicleName || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between flex-wrap">
                    <span>
                      <strong>Pick-Up:</strong>{" "}
                      {booking?.returnJourney?.pickup ||
                        booking?.primaryJourney?.pickup ||
                        "N/A"}
                    </span>
                    <span className="mt-3">
                      <strong>Drop-Off:</strong>{" "}
                      {booking?.returnJourney?.dropoff ||
                        booking?.primaryJourney?.dropoff ||
                        "N/A"}
                    </span>
                  </div>

                  {/* Driver Info Section */}
                  <div className="mt-4">
                    <strong className="block mb-1 text-lg mt-4 font-bold text-[var(--dark-gray)]">
                      Drivers:
                    </strong>

                    {(() => {
                      const filteredDrivers = getFilteredDrivers(booking);
                      return filteredDrivers.length > 0 ? (
                        <div className="space-y-3">
                          {filteredDrivers.map(
                            (driver, index) => (
                              console.log(bookings, "Driver Info:", driver),
                              (
                                <div
                                  key={index}
                                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm"
                                >
                                  <div>
                                    <strong>Name:</strong> {driver?.name}
                                  </div>
                                  <div>
                                    <strong>Contact:</strong>{" "}
                                    {driver?.contact || "N/A"}
                                  </div>
                                  <div>
                                    <strong>Car Reg#:</strong>{" "}
                                    {booking?.vehicle?.vehicleName || "N/A"}
                                  </div>
                                </div>
                              )
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          No driver assigned
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  {booking.status === "Deleted" ? (
                    <div className="text-red-500 font-semibold text-sm">
                      This booking has been deleted.
                    </div>
                  ) : booking.status === "Cancelled" ? (
                    <div className="text-orange-500 font-semibold text-sm">
                      {(() => {
                        const lastStatus =
                          booking.statusAudit?.[booking.statusAudit.length - 1];
                        const wasCancelledByClientAdmin =
                          lastStatus?.status === "Cancelled" &&
                          lastStatus?.updatedBy?.includes("clientadmin");

                        return wasCancelledByClientAdmin
                          ? "Booking cancelled by clientadmin."
                          : "This booking has been cancelled.";
                      })()}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCancelBooking(booking)}
                      className="btn btn-cancel"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-500 text-right">
                  <strong>Booking Date:</strong>{" "}
                  {(() => {
                    const journey = booking.returnJourneyToggle
                      ? booking.returnJourney
                      : booking.primaryJourney;

                    if (!journey) return "N/A";

                    const journeyDate = new Date(journey.date);
                    journeyDate.setHours(journey.hour);
                    journeyDate.setMinutes(journey.minute);

                    return journeyDate.toLocaleString();
                  })()}
                </div>
              </div>
            </div>
          </>
        ))
      )}
    </div>
  );
};

export default CustomerCard;
