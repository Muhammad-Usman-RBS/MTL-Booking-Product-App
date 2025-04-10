import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const options = ["Debit", "Credit"];

const AddDriverPayment = ({ setShowGeneration }) => {
  const driverOptions = [
    "0101 SC",
    "0233 Hassan Butt",
    "1 Usman",
    "10 Aftab Khan",
    "92 Shahibur",
    "Test Test Negup",
  ];

  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDriver = (driver) => {
    setSelectedDrivers((prev) =>
      prev.includes(driver)
        ? prev.filter((d) => d !== driver)
        : [...prev, driver]
    );
  };

  const handleSelectAll = () => setSelectedDrivers(driverOptions);
  const handleSelectNone = () => setSelectedDrivers([]);

  const handleUpdate = () => {
    toast.success("Driver payment updated successfully!");
  };

  return (
    <>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add Driver Payment</h2>
        <hr className="mb-4" />
        <div className="mb-6 relative">
          <label className="block mb-2 font-medium">Select Drivers</label>
          <button
            className="w-full border px-3 py-2 rounded text-left flex justify-between items-center"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {selectedDrivers.length > 0
              ? `${selectedDrivers.length} selected`
              : "Select drivers..."}
            <ChevronDown
              className={`ml-2 transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
            />
          </button>
          {showDropdown && (
            <div className="absolute z-10 bg-white shadow-md border rounded w-full max-h-60 overflow-y-auto mt-2 p-2">
              {driverOptions.map((driver, index) => (
                <label
                  key={index}
                  className="block text-sm py-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDrivers.includes(driver)}
                    onChange={() => toggleDriver(driver)}
                    className="mr-2"
                  />
                  {driver}
                </label>
              ))}
              <div className="flex justify-between pt-2 text-blue-600 text-sm font-medium">
                <button type="button" onClick={handleSelectAll}>
                  Select All
                </button>
                <button type="button" onClick={handleSelectNone}>
                  Select None
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Title, Description, Payment Type, and Amount Fields */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="custom_input"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="custom_input"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Payment Type</label>
            <SelectOption options={options} className="w-full" />
          </div>

          <div>
            <label className="block mb-2 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="custom_input"
            />
          </div>
        </div>

        <div className="mt-4">
          <button onClick={handleUpdate} className="btn btn-primary">
            Update
          </button>
        </div>
      </div>
    </>
  );
};

export default AddDriverPayment;
