import React, { useState, useEffect } from "react";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const getFirstAndLastDay = (offset = 0) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return [firstDay, lastDay];
};

const NewInvoice = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const customerList = [
    { label: "Customer A", count: 0 },
    { label: "Customer B", count: 0 },
  ];
  const accountList = [
    { label: "Account 1", count: 0 },
    { label: "Account 2", count: 0 },
  ];

  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);

  useEffect(() => {
    const [first, last] = getFirstAndLastDay(0);
    setStartDate(first);
    setEndDate(last);
  }, []);

  const handleDateRange = (type) => {
    const [first, last] = getFirstAndLastDay(type === "lastMonth" ? -1 : 0);
    setStartDate(first);
    setEndDate(last);
  };

  const resetHandler = () => {
    handleDateRange("thisMonth");
    setSelectedCustomers([]);
    setSelectedAccounts([]);
  };

  return (
    <div>
      <OutletHeading name="Create New Invoice" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
          <div className="w-full sm:w-64">
            <SelectDateRange
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </div>

          <div className="w-full sm:w-64">
            <SelectedSearch
              selected={selectedCustomers}
              setSelected={setSelectedCustomers}
              statusList={customerList}
              placeholder="Select Customer"
              showCount={false}
            />
          </div>

          <div className="w-full sm:w-64">
            <SelectedSearch
              selected={selectedAccounts}
              setSelected={setSelectedAccounts}
              statusList={accountList}
              placeholder="Select Accounts"
              showCount={false}
            />
          </div>
        </div>

        {/* Button Section */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button className="btn btn-reset w-full sm:w-auto">Search</button>
          <button
            onClick={resetHandler}
            className="btn btn-outline w-full sm:w-auto"
            title="Reset Filters"
          >
            ↻
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;
