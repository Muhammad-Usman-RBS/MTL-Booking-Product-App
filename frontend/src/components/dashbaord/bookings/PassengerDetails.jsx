import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useGetAllPassengersQuery } from "../../../redux/api/bookingApi";
import { useGetCorporateCustomersQuery } from "../../../redux/api/corporateCustomerApi";

const PassengerDetails = ({ passengerDetails, setPassengerDetails }) => {
  const [selectedPassenger, setSelectedPassenger] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: passengerData, isLoading, isError } = useGetAllPassengersQuery();
  const passengers = passengerData?.passengers || [];

  const { data: customerData } = useGetCorporateCustomersQuery();
  const customers = Array.isArray(customerData)
    ? customerData
    : customerData?.customers || [];

  // Combine and deduplicate by email+phone
  const combinedList = [
    ...passengers,
    ...customers.filter(
      (c) =>
        !passengers.some(
          (p) =>
            (p.email === c.email || !c.email) &&
            (p.phone === c.phone || !c.phone)
        )
    ),
  ];

  const buildDisplayValue = (p) => {
    const name = p.name || p.fullName || "Unnamed";
    return `${name} (${p.email || "No Email"}) +${p.phone || "No Phone"}`;
  };

  const filteredPassengers = combinedList.filter((p) =>
    buildDisplayValue(p).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value) => {
    setSelectedPassenger(value);
    const selected = combinedList.find((p) => buildDisplayValue(p) === value);
    if (selected) {
      setPassengerDetails({
        name: selected.name || selected.fullName || "",
        email: selected.email || "",
        phone: selected.phone || "",
      });
    } else {
      setPassengerDetails({ name: "", email: "", phone: "" });
    }
  };

  useEffect(() => {
    const match = combinedList.find(
      (p) =>
        (p.name || p.fullName) === passengerDetails.name &&
        p.email === passengerDetails.email &&
        p.phone === passengerDetails.phone
    );
    if (!match) {
      setSelectedPassenger("");
    } else {
      setSelectedPassenger(buildDisplayValue(match));
    }
  }, [passengerDetails, combinedList]);

  return (
    <div className="h-full">
      <div className="relative">
        {!isLoading && !isError && filteredPassengers.length > 0 && (
          <div
            className="custom_input cursor-pointer flex justify-between items-center"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className={selectedPassenger ? "text-black" : "text-gray-400"}>
              {selectedPassenger || "Select Passenger"}
            </span>
          </div>
        )}

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
              {filteredPassengers.length === 0 &&
                !isLoading &&
                !isError && (
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
                  {buildDisplayValue(p)}
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
  );
};

export default PassengerDetails;
