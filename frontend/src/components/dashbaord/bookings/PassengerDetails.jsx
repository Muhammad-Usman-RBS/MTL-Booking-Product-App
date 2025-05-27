import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useGetAllPassengersQuery } from "../../../redux/api/bookingApi";

const PassengerDetails = ({ passengerDetails, setPassengerDetails }) => {
  const [selectedPassenger, setSelectedPassenger] = useState("");

  const { data, isLoading, isError } = useGetAllPassengersQuery();
  const passengers = data?.passengers || [];

  const buildDisplayValue = (p) => {
    return `${p.name || "Unnamed"} (${p.email || "No Email"})[br]${p.phone || "No Phone"}`;
  };

  const handleSelect = (value) => {
    setSelectedPassenger(value);

    const passenger = passengers.find(
      (p) => buildDisplayValue(p) === value
    );

    if (passenger) {
      setPassengerDetails({
        name: passenger.name || "",
        email: passenger.email || "",
        phone: passenger.phone || "",
      });
    } else {
      setPassengerDetails({ name: "", email: "", phone: "" });
    }
  };

  useEffect(() => {
    const match = passengers.find(
      (p) =>
        p.name === passengerDetails.name &&
        p.email === passengerDetails.email &&
        p.phone === passengerDetails.phone
    );

    if (!match) {
      setSelectedPassenger("");
    } else {
      setSelectedPassenger(buildDisplayValue(match));
    }
  }, [passengerDetails, passengers]);

  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-xl p-6 max-w-4xl mx-auto mt-6">
      <h3 className="text-xl font-semibold mb-4">Passenger Details:</h3>
      {/* Dropdown Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Select Passenger</label>
        <select
          value={selectedPassenger}
          onChange={(e) => handleSelect(e.target.value)}
          className="custom_input"
          disabled={isLoading || isError}
        >
          <option value="">None</option>
          {isLoading && <option disabled>Loading...</option>}
          {isError && <option disabled>Error loading passengers</option>}
          {passengers.map((p, idx) => (
            <option key={idx} value={buildDisplayValue(p)}>
              {`${p.name || "Unnamed"} (${p.email || "No Email"}) [br] ${p.phone || "No Phone"}`}
            </option>
          ))}
        </select>
      </div>

      {/* Manual Passenger Entry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={passengerDetails.name}
            onChange={(e) =>
              setPassengerDetails({ ...passengerDetails, name: e.target.value })
            }
            className="custom_input"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            value={passengerDetails.email}
            onChange={(e) =>
              setPassengerDetails({ ...passengerDetails, email: e.target.value })
            }
            className="custom_input"
          />
        </div>

        {/* Phone */}
        <div className="w-full sm:col-span-2 lg:col-span-2">
          <label className="block text-sm font-medium mb-1">Contact Number</label>
          <PhoneInput
            country={"gb"}
            value={passengerDetails.phone}
            onChange={(phone) =>
              setPassengerDetails({ ...passengerDetails, phone })
            }
            inputClass="!w-full !text-sm !py-2 !px-3 !pl-14 !border-gray-300 !rounded !focus:outline-none !focus:ring-2 !focus:ring-blue-500"
            dropdownClass="!text-sm"
            containerClass="!w-full"
            buttonClass="!ps-2"
          />
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;
