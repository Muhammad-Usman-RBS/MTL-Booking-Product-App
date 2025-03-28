import React, { useState, useEffect } from "react";
import Icons from "../../assets/icons";

// Utility function for formatting dates
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Predefined ranges using native JS
const getToday = () => {
  const today = new Date();
  const iso = today.toISOString().split("T")[0];
  return [iso, iso];
};

const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const iso = date.toISOString().split("T")[0];
  return [iso, iso];
};

const getLastNDays = (n) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (n - 1));
  return [start.toISOString().split("T")[0], end.toISOString().split("T")[0]];
};

const getThisMonth = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return [start.toISOString().split("T")[0], now.toISOString().split("T")[0]];
};

const getLastMonth = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return [start.toISOString().split("T")[0], end.toISOString().split("T")[0]];
};

const ranges = [
  { label: "Today", getRange: getToday },
  { label: "Yesterday", getRange: getYesterday },
  { label: "Last 7 Days", getRange: () => getLastNDays(7) },
  { label: "Last 30 Days", getRange: () => getLastNDays(30) },
  { label: "This Month", getRange: getThisMonth },
  { label: "Last Month", getRange: getLastMonth },
];

const Dashboard = () => {
  const [startDate, setStartDate] = useState(getToday()[0]);
  const [endDate, setEndDate] = useState(getToday()[1]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const handleRangeClick = (getRange) => {
    const [start, end] = getRange();
    setStartDate(start);
    setEndDate(end);
    setDropdownOpen(false);
  };

  const applyCustomRange = () => {
    if (customStart && customEnd) {
      setStartDate(customStart);
      setEndDate(customEnd);
      setDropdownOpen(false);
    }
  };

  return (
    <>
      <div className="ps-2 pe-2 md:ps-6 md:pe-6">
        <h2 className="text-2xl font-bold mb-4">Stats</h2>
        <hr className="mb-6" />
      </div>
      <div className="ps-4 pe-4 space-y-6 max-w-full overflow-x-auto">
        {/* Date Filter */}
        <div className="bg-cyan-400 rounded p-4">
          <div className="relative inline-block">
            <div
              className="flex items-center gap-2 border p-2 bg-white rounded cursor-pointer w-full md:w-[350px]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Icons.CalendarDays className="w-5 h-5 text-black" />
              <span className="flex-1">
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
              <Icons.ChevronDown
                className={`w-4 h-4 text-black transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {dropdownOpen && (
              <div className="absolute mt-1 w-full bg-white border rounded shadow-md z-10 p-2 space-y-1">
                {ranges.map((r) => (
                  <div
                    key={r.label}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer rounded"
                    onClick={() => handleRangeClick(r.getRange)}
                  >
                    {r.label}
                  </div>
                ))}
                <div className="pt-2 px-4 text-sm text-gray-700">
                  Custom Range:
                </div>
                <div className="flex flex-col gap-2 px-4 pb-2">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <button
                    onClick={applyCustomRange}
                    className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
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
