import React, { useState } from "react";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import RoleCards from "./DashboardCard";

const Dashboard = () => {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const sections = [
    {
      title: "Bookings Scheduled",
      values: [0, 11, 11, "0.00", "1,565.95", "1,565.95", "0.00", "1,565.95"],
      borderColor: "border-gray-300",
      bg: "bg-[#2A7B9B]",
    },
    {
      title: "Bookings Received",
      values: [0, 1, 1, "0.00", "78.76", "78.76", "0.00", "78.76"],
      borderColor: "border-gray-300",
      bg: "bg-[#57C785]",
    },
    {
      title: "Overview",
      values: [
        115,
        7492,
        7607,
        "14,867.58",
        "1,099,057.75",
        "1,113,925.33",
        "758,958.68",
        "354,966.65",
      ],
      borderColor: "border-gray-300",
      bg: "bg-[#C75957]",
    },
    {
      title: "Overview - Completed",
      values: [
        115,
        7274,
        7389,
        "14,867.58",
        "1,069,865.07",
        "1,084,732.65",
        "745,700.15",
        "339,032.50",
      ],
      borderColor: "border-gray-300",
      bg: "bg-[#576FC7]",
    },
    {
      title: "Overview - Future",
      values: [
        0,
        218,
        218,
        "0.00",
        "29,192.68",
        "29,192.68",
        "13,258.53",
        "15,934.15",
      ],
      borderColor: "border-gray-300",
      bg: "bg-[#57B4C7]",
    },
  ];

  const labels = [
    "Cash Bookings",
    "Card Bookings",
    "Total Bookings",
    "Cash Fare (GBP)",
    "Card Fare (GBP)",
    "Total Fare (GBP)",
    "Driver Fare (GBP)",
    "Earnings (GBP)",
  ];

  return (
    <>
      <OutletHeading name="Stats" />
      <div className="space-y-6 max-w-full">
        {/* Filter Box */}
        <div className="bg-gray-100 rounded p-4">
          <div className="w-full md:w-80">
            <SelectDateRange
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </div>
        </div>

        {/* <button className="btn btn-primary">Primary</button>

        <button className="btn btn-success">Success</button>

        <button className="btn btn-cancel">Cancel</button>

        <button className="btn btn-edit">Edit</button>

        <button className="btn btn-reset">Reset</button>

        <button className="btn btn-outline">Outline</button> */}

        <RoleCards />
        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, i) => (
            <div
              key={i}
              className={`border ${section.borderColor} rounded overflow-x-auto`}
            >
              <h3
                className={`font-bold text-md md:text-lg text-white ${section.bg} p-2`}
              >
                {section.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 p-4 text-sm">
                {labels.map((label, idx) => (
                  <div key={idx} className="min-w-0 break-words">
                    <p className="text-gray-600 whitespace-nowrap">{label}</p>
                    <p className="font-bold whitespace-nowrap">
                      {section.values[idx]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
