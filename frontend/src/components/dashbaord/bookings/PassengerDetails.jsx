import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useGetAllPassengersQuery } from "../../../redux/api/bookingApi";

const PassengerDetails = ({ passengerDetails, setPassengerDetails }) => {
  const [selectedPassenger, setSelectedPassenger] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, isError } = useGetAllPassengersQuery();
  const passengers = data?.passengers || [];

  const buildDisplayValue = (p) => {
    return `${p.name || "Unnamed"} (${p.email || "No Email"}) +${
      p.phone || "No Phone"
    }`;
  };
  const filteredPassengers = passengers.filter((p) =>
    buildDisplayValue(p).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value) => {
    setSelectedPassenger(value);

    const passenger = passengers.find((p) => buildDisplayValue(p) === value);

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
      <div>
        <div className="relative">
          <div
            className="custom_input cursor-pointer flex justify-between items-center"
            onClick={() =>
              !isLoading && !isError && setIsDropdownOpen(!isDropdownOpen)
            }
          >
            <span
              className={selectedPassenger ? "text-black" : "text-gray-400"}
            >
              {selectedPassenger || "None"}
            </span>
          </div>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Search passengers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {isLoading && (
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    Loading...
                  </div>
                )}
                {isError && (
                  <div className="px-3 py-2 text-red-500 text-sm">
                    Error loading passengers
                  </div>
                )}
                {filteredPassengers.length === 0 && !isLoading && !isError && (
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    No passengers found
                  </div>
                )}
                {filteredPassengers.map((p, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      handleSelect(buildDisplayValue(p));
                      setIsDropdownOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {`${p.name || "Unnamed"} (${p.email || "No Email"}) +${
                      p.phone || "No Phone"
                    }`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 lg:grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={passengerDetails.name}
              onChange={(e) =>
                setPassengerDetails({
                  ...passengerDetails,
                  name: e.target.value,
                })
              }
              placeholder="Enter full name"
              className="custom_input"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={passengerDetails.email}
              onChange={(e) =>
                setPassengerDetails({
                  ...passengerDetails,
                  email: e.target.value,
                })
              }
              placeholder="name@example.com"
              className="custom_input"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Number
          </label>
          <PhoneInput
            country={"gb"}
            value={passengerDetails.phone}
            onChange={(phone) =>
              setPassengerDetails({ ...passengerDetails, phone })
            }
            inputClass="custom_input !ps-14 !w-full"
            dropdownClass="!text-sm"
            containerClass="!w-full"
            buttonClass="!ps-2"
          />
        </div>
      </div>
    </>
  );
};

export default PassengerDetails;
