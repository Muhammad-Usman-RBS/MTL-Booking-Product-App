// ✅ TopBar + BottomBar + Filters + Pagination + Responsive Table
import React, { useState, useEffect } from "react";
import Icons from "../../../assets/icons";
import Images from "../../../assets/images";
import SelectedSearch from "../../../constants/SelectedSearch";
import SelectOption from "../../../constants/SelectOption";

const statusList = [
  { label: "Scheduled", count: 41 },
  { label: "Pending", count: 0 },
  { label: "Payment Pending", count: 20 },
  { label: "No Show", count: 177 },
  { label: "Completed", count: 7389 },
  { label: "Cancelled", count: 193 },
  { label: "Rejected", count: 0 },
  { label: "Deleted", count: 0 },
  { label: "All", count: 7820 },
];

const itemsPerPageOptions = [10, 20, 30, 40, 50, 100, "All"];

const sampleData = [
  {
    orderNo: "2406075242",
    passenger: "Jeremy Haywood",
    date: "08-06-2024 09:10",
    pickUp: "2 Inverness Terrace, London W2",
    dropOff: "London Gatwick Airport (LGW)",
    vehicle: "Luxury MPV",
    payment: "Card",
    fare: "£195",
    drFare: "£0",
    driver: "",
  },
  {
    orderNo: "2406075242",
    passenger: "Jeremy Haywood",
    date: "08-06-2024 09:10",
    pickUp: "2 Inverness Terrace, London W2",
    dropOff: "London Gatwick Airport (LGW)",
    vehicle: "Luxury MPV",
    payment: "Card",
    fare: "£195",
    drFare: "£0",
    driver: "",
  },
  {
    orderNo: "2406075242",
    passenger: "Jeremy Haywood",
    date: "08-06-2024 09:10",
    pickUp: "2 Inverness Terrace, London W2",
    dropOff: "London Gatwick Airport (LGW)",
    vehicle: "Luxury MPV",
    payment: "Card",
    fare: "£195",
    drFare: "£0",
    driver: "",
  },
  {
    orderNo: "2406075242",
    passenger: "Jeremy Haywood",
    date: "08-06-2024 09:10",
    pickUp: "2 Inverness Terrace, London W2",
    dropOff: "London Gatwick Airport (LGW)",
    vehicle: "Luxury MPV",
    payment: "Card",
    fare: "£195",
    drFare: "£0",
    driver: "",
  },
];

const options = [
  "Accepted",
  "On Route",
  "At Location",
  "Ride Started",
  "No Show",
  "Completed",
];

const TableComponent = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(["Payment Pending"]);

  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(20);

  return (
    <div className="p-4 space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button className="btn btn-reset">
            <Icons.Plus size={16} />
          </button>

          {/* Status Filter Dropdown */}
          <SelectedSearch
            selected={selectedStatus}
            setSelected={setSelectedStatus}
            statusList={statusList}
          />

          {/* Search Field */}
          <input
            type="text"
            placeholder="Search"
            className="border rounded border-gray-300 px-2 py-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Filter Button */}
          <button
            className="btn btn-outline"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Icons.Filter size={16} />
          </button>
        </div>

        {/* Pagination & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="btn btn-outline">
              <Icons.Users size={16} />
            </button>
            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 transition">
              Drivers
            </span>
          </div>

          <div className="relative group">
            <button className="btn btn-outline">
              <Icons.Users size={16} />
            </button>
            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 transition">
              Maps
            </span>
          </div>

          <button className="border py-2 px-2 rounded border-gray-300">
            <Icons.RefreshCcw size={16} />
          </button>

          {/* Per Page Dropdown */}
          <select
            className="border py-1 px-2 rounded border-gray-300"
            value={perPage}
            onChange={(e) => setPerPage(e.target.value)}
          >
            {itemsPerPageOptions.map((item, i) => (
              <option key={i} value={item}>
                {item}
              </option>
            ))}
          </select>

          {/* Pagination */}
          <button className="btn btn-reset">
            <Icons.SkipBack size={16} />
          </button>
          <input
            type="number"
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
            className="border w-12 text-center py-0.5 px-2 rounded border-gray-300"
          />
          <span>of 2</span>
          <button className="btn btn-reset">
            <Icons.SkipForward size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="table-auto w-full border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-100 text-xs sm:text-sm text-gray-700">
              {[
                "Order No.",
                "Passenger",
                "Date & Time",
                "Pick Up",
                "Drop Off",
                "Vehicle",
                "Payment",
                "Fare",
                "DR Fare",
                "Driver",
                "Status",
              ].map((heading, i) => (
                <th
                  key={i}
                  className="border px-2 sm:px-4 py-2 text-left whitespace-nowrap"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sampleData.map((item, index) => (
              <tr key={index} className="border hover:bg-gray-50 transition">
                <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  {item.orderNo}
                </td>
                <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  {item.passenger}
                </td>
                <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  {item.date}
                </td>
                <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  {item.pickUp}
                </td>
                <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  {item.dropOff}
                </td>
                <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  {item.vehicle}
                </td>
                <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  {item.payment}
                </td>
                <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  {item.fare}
                </td>
                <td className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  {item.drFare}
                </td>
                <td className="border w-full px-2 sm:px-4 py-2 whitespace-nowrap text-center">
                  <img
                    src={Images.profileimg}
                    alt="Profile"
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border border-gray-300 mx-auto"
                  />
                </td>
                <td className="border px-2 w-full sm:px-4 py-2 whitespace-nowrap">
                  <SelectOption options={options} className="w-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <div className="btn btn-outline">Total Records: {totalRecords}</div>
        <div className="flex gap-2">
          <button className="border p-2 rounded border-gray-300">
            <Icons.LayoutList size={16} />
          </button>
          <button className="border p-2 rounded border-gray-300">
            <Icons.LayoutGrid size={16} />
          </button>
          <button className="bg-gray-600 text-white p-2 rounded">
            <Icons.Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
