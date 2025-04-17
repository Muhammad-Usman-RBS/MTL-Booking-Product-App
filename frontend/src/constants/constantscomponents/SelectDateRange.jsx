import React, { useState } from "react";
import Icons from "../../assets/icons";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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

const SelectDateRange = ({ startDate, endDate, setStartDate, setEndDate }) => {
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
    <div className="relative inline-block w-full">
      <div
        className="flex items-center gap-2 border border-gray-300 px-2 py-[6px] bg-white rounded cursor-pointer"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <Icons.CalendarDays className="w-4 h-4 text-black" />
        <span className="flex-1 text-xs md:text-sm">
          {formatDate(startDate)} - {formatDate(endDate)}
        </span>
        <Icons.ChevronDown
          className={`w-4 h-4 text-black transition-transform duration-200 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {dropdownOpen && (
        <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded shadow-md z-10 p-2 space-y-1">
          {ranges.map((r) => (
            <div
              key={r.label}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer rounded"
              onClick={() => handleRangeClick(r.getRange)}
            >
              {r.label}
            </div>
          ))}
          <div className="pt-2 px-4 text-sm text-gray-700">Custom Range:</div>
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
  );
};

export default SelectDateRange;
