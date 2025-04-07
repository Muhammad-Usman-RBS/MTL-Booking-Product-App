import React, { useState, useEffect } from "react";
import SelectedSearch from "../../../constants/SelectedSearch";
import SelectDateRange from "../../../constants/SelectDateRange";

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
      <div className="ps-2 pe-2 md:ps-6 md:pe-6">
        <h2 className="text-2xl font-bold mb-4">Create New Invoice</h2>
        <hr className="mb-6" />
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-4 items-center justify-start">
          <div className="min-w-[220px]">
            <SelectDateRange
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </div>
          <div className="min-w-[200px]">
            <SelectedSearch
              selected={selectedCustomers}
              setSelected={setSelectedCustomers}
              statusList={customerList}
              placeholder="Select Customer"
              showCount={false}
            />
          </div>
          <div className="min-w-[200px]">
            <SelectedSearch
              selected={selectedAccounts}
              setSelected={setSelectedAccounts}
              statusList={accountList}
              placeholder="Select Accounts"
              showCount={false}
            />
          </div>
          <div className="flex gap-2 mt-1">
            <button className="btn btn-reset">Search</button>
            <button
              onClick={resetHandler}
              className="btn btn-outline"
              title="Reset Filters"
            >
              ↻
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;
