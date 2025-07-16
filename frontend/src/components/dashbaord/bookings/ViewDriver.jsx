import React, {  useState } from "react";
import IMAGES from "../../../assets/images";
import { useGetAllDriversQuery } from "../../../redux/api/driverApi";
import { useSelector } from "react-redux";
import {
  useGetAllBookingsQuery,
  useSendBookingEmailMutation,
  useUpdateBookingMutation,
} from "../../../redux/api/bookingApi";
import { toast } from "react-toastify";
const ViewDriver = ({ selectedRow, setShowDriverModal, onDriversUpdate }) => {
  const [updateBooking] = useUpdateBookingMutation();

  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMatching, setShowMatching] = useState(false);
  const [sendEmailChecked, setSendEmailChecked] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const [sendBookingEmail] = useSendBookingEmailMutation();

  const { data: drivers = [], isLoading } = useGetAllDriversQuery(companyId, {
    skip: !companyId,
  });
  const { data: bookingData, refetch: refetchBookings } =
    useGetAllBookingsQuery(companyId);
  const allBookings = bookingData?.bookings || [];
  const selectedBooking = allBookings.find(
    (booking) => booking._id === selectedRow
  );
    const bookingVehicleType =
    selectedBooking?.vehicle?.vehicleName?.trim().toLowerCase() || "";
  const filteredDriver = (drivers?.drivers || []).filter((driver) => {
    const name = driver?.DriverData?.firstName?.toLowerCase() || "";
    const carMake = driver?.VehicleData?.carMake?.toLowerCase() || "";
    const carModel = driver?.VehicleData?.carModal?.toLowerCase() || "";
    const vehicleTypes = driver?.VehicleData?.vehicleTypes || [];
    const matchesSearch =
      name.includes(searchTerm) ||
      carMake.includes(searchTerm) ||
      carModel.includes(searchTerm);

    const matchesVehicle = showMatching
      ? vehicleTypes.some(
          (type) =>
            typeof type === "string" &&
            type.trim().toLowerCase() === bookingVehicleType
        )
      : true;

    return matchesSearch && matchesVehicle;
  });

  {
    isLoading && <p>Loading drivers...</p>;
  }
  const handleSendEmail = async () => {
    const booking = allBookings.find((b) => b._id === selectedRow);
  
    if (!booking?._id) {
      toast.error("Please select a booking first.");
      return;
    }
  
    if (selectedDrivers.length === 0) {
      toast.info("Please select at least one driver.");
      return;
    }
  
    try {
      const { _id, createdAt, updatedAt, __v, ...restBookingData } = booking;
  
      await updateBooking({
        id: booking._id,
        updatedData: {
          ...restBookingData,
          drivers: selectedDrivers.map((driver) => driver._id),
        },
      }).unwrap();
  
      if (typeof refetchBookings === "function") {
        refetchBookings();
      }
  
      toast.success("Booking updated with selected drivers.");
    } catch (err) {
      console.error("Booking update failed:", err);
      toast.error("Failed to update booking with drivers");
    }
  
    if (sendEmailChecked) {
      for (const driver of selectedDrivers) {
        const email = driver?.DriverData?.email;
        if (!email) {
          toast.warning(
            `${driver?.DriverData?.firstName || "Driver"} has no email. Skipped.`
          );
          continue;
        }
  
        const payload = {
          bookingId: booking._id,
          email,
        };
  
        try {
          await sendBookingEmail(payload).unwrap();
          toast.success(`Email sent to ${driver.DriverData?.firstName}`);
        } catch (err) {
          console.error("Email error:", err);
          toast.error(`Failed to send to ${driver.DriverData?.firstName}`);
        }
      }
    }
  
    setShowDriverModal(false);
  
    if (onDriversUpdate) {
      onDriversUpdate(selectedRow, selectedDrivers);
    }
  };
  

  const convertKmToMiles = (text) => {
    if (!text || typeof text !== "string") return "—";
    if (text.includes("km")) {
      const km = parseFloat(text.replace("km", "").trim());
      if (!isNaN(km)) {
        return `${(km * 0.621371).toFixed(2)} miles`;
      }
    }
    return text;
  };

 
  return (
    <>
      <div className="p-4 space-y-4 text-sm text-gray-800 w-full max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[var(--dark-gray)] mb-1">
              Distance:
            </label>
            <p className="bg-gray-100 px-3 py-1.5 rounded">
            {/* {convertKmToMiles(viewData?.primaryJourney?.distanceText)} */}
            {convertKmToMiles(selectedBooking?.primaryJourney?.distanceText) || "Select a booking"}

            </p>
          </div>
          <div>
            <label className="block font-semibold text-[var(--dark-gray)] mb-1">
              Fare:
            </label>
            <input type="number" className="custom_input" />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowMatching(false)}
            className="btn btn-primary"
          >
            All Drivers
          </button>
          <button
            onClick={() => setShowMatching(true)}
            className="btn btn-reset"
          >
            Matching Drivers
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <input
              type="text"
              placeholder="Search driver"
              className="custom_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            />
          </div>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-indigo-600"
              checked={selectAll}
              onChange={(e) => {
                const checked = e.target.checked;
                setSelectAll(checked);
                if (checked) {
                  setSelectedDrivers(filteredDriver);
                } else {
                  setSelectedDrivers([]);
                }
              }}
            />
            <span>Select All</span>
          </label>
        </div>

        <div className="max-h-48 overflow-y-auto pr-1 space-y-3 custom-scroll border border-gray-500 rounded-md">
          {Array.isArray(filteredDriver) &&
            filteredDriver.map((driver, i) => (
              <label
                key={i}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer"
              >
                <img
                  src={driver.UploadedData?.driverPicture || IMAGES.dummyImg}
                  alt={driver.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-300"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {driver.DriverData?.firstName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {driver.VehicleData?.carMake || "N/A"} |{" "}
                    {driver.VehicleData?.carModal || "N/A"}
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                  checked={selectedDrivers.some((d) => d._id === driver._id)}
                  onChange={() => {
                    if (selectedDrivers.some((d) => d._id === driver._id)) {
                      setSelectedDrivers((prev) =>
                        prev.filter((d) => d._id !== driver._id)
                      );
                    } else {
                      setSelectedDrivers((prev) => [...prev, driver]);
                    }
                  }}
                />
              </label>
            ))}
        </div>

        <div>
          <label className="block font-semibold text-[var(--dark-gray)] mb-1">
            Driver Notes:
            <span className="italic text-red-500 underline">Empty</span>
          </label>
        </div>
        <hr />
        <div>
          <label className="block font-semibold text-[var(--dark-gray)] mb-2">
            Alerts
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={sendEmailChecked}
                onChange={(e) => setSendEmailChecked(e.target.checked)}
              />
              <span>Email</span>
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button onClick={handleSendEmail} className="btn btn-edit">
            Update
          </button>
        </div>
      </div>
    </>
  );
};

export default ViewDriver;
