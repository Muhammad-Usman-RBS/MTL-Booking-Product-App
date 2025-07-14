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
    <>
      <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden mt-8">
        <div className="bg-[#0f192d] px-6 py-3">
          <h2 className="text-xl font-bold text-gray-50">Passenger&nbsp;Details:-</h2>
        </div>
        <div className="p-6 space-y-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={passengerDetails.name}
                onChange={(e) =>
                  setPassengerDetails({ ...passengerDetails, name: e.target.value })
                }
                placeholder="Enter full name"
                className="custom_input"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={passengerDetails.email}
                onChange={(e) =>
                  setPassengerDetails({ ...passengerDetails, email: e.target.value })
                }
                placeholder="name@example.com"
                className="custom_input"
              />
            </div>
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <PhoneInput
                country={"gb"}
                value={passengerDetails.phone}
                onChange={(phone) =>
                  setPassengerDetails({ ...passengerDetails, phone })
                }
                inputClass="custom_input !ps-14"
                dropdownClass="!text-sm"
                containerClass="!w-full"
                buttonClass="!ps-2"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PassengerDetails;
