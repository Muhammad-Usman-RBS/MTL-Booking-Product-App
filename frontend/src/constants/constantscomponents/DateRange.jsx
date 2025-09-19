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
    <div className="flex gap-x-2 items-center -mt-2">
       <div className="flex space-x-2 items-center justify-center">
       <label className="text-xs text-gray-600 mb-1">From:</label>
        <input
          type="date"
          value={formatDateForInput(startDate) || ""}
          onChange={handleStartDateChange}
          placeholder="From"
          className="border border-[var(--light-gray)] px-3 py-1.5 rounded text-sm focus:outline-none text-gray-500"
        />
      </div>

      <div className="flex space-x-2 items-center justify-center">
      <label className="text-xs text-gray-600 mb-1">To:</label>
        <input
          type="date"
          value={formatDateForInput(endDate) || ""}
          onChange={handleEndDateChange}
          placeholder="To"
          className="border border-[var(--light-gray)] px-3 py-1.5 rounded text-sm focus:outline-none text-gray-500"
        />
      </div>
    </div>
  );
};

export default DateRange;
