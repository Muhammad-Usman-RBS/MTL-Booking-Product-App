import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const passengers = [
  {
    name: "Abbas",
    email: "botax59684@luxeic.com",
    phone: "+447930844247",
  },
  {
    name: "Abdulla Alissa",
    email: "91alissa@gmail.com",
    phone: "+966590006801",
  },
  {
    name: "Abdullah Alkhaldi",
    email: "alkhaldi@example.com",
    phone: "+441234567890",
  },
];

const PassengerDetails = () => {
  const [type, setType] = useState("Customer");
  const [selectedPassenger, setSelectedPassenger] = useState("");
  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSelect = (value) => {
    setSelectedPassenger(value);
    const passenger = passengers.find(
      (p) => `${p.name} (${p.email})[br]${p.phone}` === value
    );
    if (passenger) {
      setDetails({
        name: passenger.name,
        email: passenger.email,
        phone: passenger.phone,
      });
    } else {
      setDetails({ name: "", email: "", phone: "" });
    }
  };

  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-xl p-6 max-w-4xl mx-auto mt-6">
      <h3 className="text-xl font-semibold mb-4">Passenger Details:-</h3>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 flex-wrap mb-4">
        {/* Customer / Account Radio */}
        <div className="flex gap-4 items-center">
          <label className="flex items-center text-sm font-medium">
            <input
              type="radio"
              checked={type === "Customer"}
              onChange={() => setType("Customer")}
              className="accent-blue-600 mr-2"
            />
            Customer
          </label>
          <label className="flex items-center text-sm font-medium">
            <input
              type="radio"
              checked={type === "Account"}
              onChange={() => setType("Account")}
              className="accent-blue-600 mr-2"
            />
            Account
          </label>
        </div>

        {/* Passenger Dropdown */}
        <div className="min-w-[200px]">
          <select
            value={selectedPassenger}
            onChange={(e) => handleSelect(e.target.value)}
            className="custom_input"
          >
            <option value="">None</option>
            {passengers.map((p, idx) => (
              <option key={idx} value={`${p.name} (${p.email})[br]${p.phone}`}>
                {`${p.name} (${p.email}) [br] ${p.phone}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Passenger Details Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={details.name}
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            className="custom_input"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={details.email}
            onChange={(e) => setDetails({ ...details, email: e.target.value })}
            className="custom_input"
          />
        </div>

        {/* Phone with Flag */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Contact Number
          </label>
          <PhoneInput
            country={"gb"}
            value={details.phone}
            onChange={(phone) => setDetails({ ...details, phone })}
            inputClass="!w-full !text-sm !py-2 !px-3 !ps-[12%] !border-gray-300 !rounded !focus:outline-none !focus:ring-2 !focus:ring-blue-500"
            dropdownClass="!text-sm"
            containerClass="!w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;
