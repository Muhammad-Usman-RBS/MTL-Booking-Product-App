import React from "react";

const DateRange = ({ startDate, endDate, setStartDate, setEndDate }) => {
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split("T")[0];
    }
    return dateValue;
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
    {/* From Date */}
    <div className="flex items-center space-x-2 w-full">
      <label className="text-xs text-gray-600 whitespace-nowrap">From:</label>
      <input
        type="date"
        value={formatDateForInput(startDate) || ""}
        onChange={handleStartDateChange}
        placeholder="From"
        className="w-full border border-[var(--light-gray)] px-3 py-1.5 rounded text-sm focus:outline-none text-gray-500"
      />
    </div>

    {/* To Date */}
    <div className="flex items-center space-x-2 w-full">
      <label className="text-xs text-gray-600 whitespace-nowrap">To:</label>
      <input
        type="date"
        value={formatDateForInput(endDate) || ""}
        onChange={handleEndDateChange}
        placeholder="To"
        className="w-full border border-[var(--light-gray)] px-3 py-1.5 rounded text-sm focus:outline-none text-gray-500"
      />
    </div>
  </div>
  );
};

export default DateRange;
