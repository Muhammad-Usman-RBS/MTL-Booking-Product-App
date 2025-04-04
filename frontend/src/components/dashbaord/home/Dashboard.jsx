import React, { useState } from "react";
import SelectDateRange from "../../../constants/SelectDateRange";

const Dashboard = () => {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  return (
    <>
      <div className="ps-2 pe-2 md:ps-6 md:pe-6">
        <h2 className="text-2xl font-bold mb-4">Stats</h2>
        <hr className="mb-6" />
      </div>
      <div className="ps-4 pe-4 space-y-6 max-w-full overflow-x-auto">
        {/* Filter Box */}
        <div className="bg-cyan-400 rounded p-4">
          <SelectDateRange
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {[
            {
              title: "Bookings Scheduled",
              values: [
                0,
                11,
                11,
                "0.00",
                "1,565.95",
                "1,565.95",
                "0.00",
                "1,565.95",
              ],
              borderColor: "border-cyan-400",
              bg: "bg-gray-100",
            },
            {
              title: "Bookings Received",
              values: [0, 1, 1, "0.00", "78.76", "78.76", "0.00", "78.76"],
              borderColor: "border-pink-400",
              bg: "bg-gray-100",
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
              borderColor: "border-blue-400",
              bg: "bg-gray-100",
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
              borderColor: "border-green-400",
              bg: "bg-white",
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
              borderColor: "border-orange-400",
              bg: "bg-white",
            },
          ].map((section, i) => (
            <div key={i} className={`border-4 ${section.borderColor} rounded`}>
              <h3 className={`font-bold text-lg ${section.bg} p-2`}>
                {section.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 p-4 text-sm">
                {[
                  "Cash Bookings",
                  "Card Bookings",
                  "Total Bookings",
                  "Cash Fare (GBP)",
                  "Card Fare (GBP)",
                  "Total Fare (GBP)",
                  "Driver Fare (GBP)",
                  "Earnings (GBP)",
                ].map((label, idx) => (
                  <div
                    key={idx}
                    className="break-words min-w-0 border-0 md:border-r"
                  >
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
