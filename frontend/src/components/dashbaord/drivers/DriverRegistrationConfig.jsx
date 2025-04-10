import React from "react";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const DriverRegistrationConfig = () => {
  const options = ["Optional", "Required", "Hide"];

  const fields = [
    // Existing fields...
    "Profile Picture",
    "Address",
    "D.O.B.",
    "Nationality",
    "Driving License",
    "Driving License Expiry",
    "Driving License Attachments",
    "Driver Taxi License",
    "Driver Taxi License Expiry",
    "Driver Taxi License Attachments",

    // 🆕 New Driver Fields
    "Driver PCO Card",
    "Driver PCO Card Expiry",
    "NI Number",

    // Car Fields
    "Vehicle Make",
    "Vehicle Model",
    "Vehicle Color",
    "Vehicle Reg. No.",
    "Vehicle Insurance",
    "Vehicle Insurance Expiry",
    "Vehicle Insurance Attachments",
    "Vehicle Taxi License",
    "Vehicle Taxi License Expiry",
    "Vehicle Taxi License Attachments",
    "Vehicle Condition",
    "Vehicle Condition Expiry",
    "Vehicle Condition Attachments",

    // 🆕 New Car Fields
    "Car V5",
    "Car Picture (Front)",
  ];

  return (
    <div>
      <OutletHeading name="    Driver Registration Configuration" />

      <div className="space-y-4">
        {fields.map((label, index) => (
          <div key={index} className="flex justify-between items-center">
            <p className="w-1/2">{label}</p>
            <SelectOption width="32" options={options} className="w-1/2" />
          </div>
        ))}

        <div className="flex justify-between items-center">
          <p className="w-1/2">Profile picture file types</p>
          <input
            type="text"
            defaultValue="jpeg,jpg,png,pdf"
            className="border border-gray-300 rounded px-2 py-1 w-1/2"
          />
        </div>

        <div className="flex justify-between items-center">
          <p className="w-1/2">Attachment file types</p>
          <input
            type="text"
            defaultValue="jpeg,jpg,png,pdf"
            className="border border-gray-300 rounded px-2 py-1 w-1/2"
          />
        </div>

        <div className="flex justify-between items-center">
          <p className="w-1/2">Max. attachment file size</p>
          <div className="flex items-center w-1/2">
            <input
              type="number"
              defaultValue={15}
              className="border border-gray-300 rounded px-2 py-1 w-20"
            />
            <span className="ml-2">MB</span>
          </div>
        </div>

        <div className="text-center mt-6">
          <button className="btn btn-reset">UPDATE</button>
        </div>
      </div>
    </div>
  );
};

export default DriverRegistrationConfig;
