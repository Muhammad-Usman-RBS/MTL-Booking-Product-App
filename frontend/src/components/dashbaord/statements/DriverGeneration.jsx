import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import StatementPreview from "./StatementPreview";
import { statementsData } from "../../../constants/statementstab/statementsData";

const DriverGeneration = ({ setShowGeneration }) => {
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const driverOptions = [
    "0101 SC",
    "0233 Hassan Butt",
    "1 Usman",
    "10 Aftab Khan",
    "92 Shahibur",
    "Test Test Negup",
  ];

  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("-");
    return new Date(`${year}-${month}-${day}`);
  };

  const handlePreview = () => {
    const from = new Date(fromDate);
    const to = new Date(toDate);

    const grouped = selectedDrivers.map((driver) => {
      const filteredStatements = statementsData.filter((item) => {
        if (item.driver !== driver) return false;

        const [start, end] = item.period.split(" to ");
        const startDate = parseDate(start);
        const endDate = parseDate(end);

        return startDate <= to && endDate >= from;
      });

      return filteredStatements.length
        ? filteredStatements.map((statement) => ({
            driver: statement.driver,
            period: statement.period,
            bookings: [
              {
                orderNo: "250A508065",
                dateTime: "07-04-2025 15:45",
                payment: "Account",
                cash: "0 GBP",
                fare: statement.fare,
              },
            ],
            cashCollected: statement.cashCollected,
            fare: statement.fare,
            previousDue: statement.previousDue || "0 GBP",
            payment: statement.paid,
            due: statement.due,
          }))
        : [
            {
              driver,
              period: `${fromDate} to ${toDate}`,
              bookings: 0,
              cashCollected: "0.00 GBP",
              fare: "0.00 GBP",
              previousDue: "0.00 GBP",
              payment: "0.00 GBP",
              due: "0.00 GBP",
            },
          ];
    });

    const flattened = grouped.flat();
    setPreviewData(flattened);
    setShowPreview(true);
  };

  return (
    <>
      <div className="p-6">
        <div className="md:flex justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Driver Statement Generation
            </h2>
          </div>
          <div className="mb-3 md:mb-0">
            <button
              onClick={() => setShowGeneration(false)}
              className="btn btn-primary"
            >
              ← Back to Driver List
            </button>
          </div>
        </div>
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

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>

        <div className="text-center mt-4">
          <button onClick={handlePreview} className="btn btn-reset">
            Preview
          </button>
        </div>
      </div>

      {showPreview ? (
        <StatementPreview
          data={previewData}
          onBack={() => setShowPreview(false)}
        />
      ) : (
        <>
          <div className="flex justify-center">
            <p className="text-center py-2 border border-gray-300 w-64">
              No Statements
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default DriverGeneration;
