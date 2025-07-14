import React, { useState, useEffect } from "react";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import { useSelector } from "react-redux";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { useCreateInvoiceMutation } from "../../../redux/api/invoiceApi";

const getFirstAndLastDay = (offset = 0) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return [firstDay, lastDay];
};

const NewInvoice = () => {
  const user = useSelector((state) => state.auth.user);
  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();

  const [startDate, setStartDate] = useState(new Date());
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(["All"]);
  const [endDate, setEndDate] = useState(new Date());
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const { data: bookingData } = useGetAllBookingsQuery(user?.companyId);
  const allBookings = bookingData?.bookings || [];
  const filteredBookings = searchTriggered
    ? allBookings.filter((b) => {
        const createdAt = new Date(b.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return createdAt >= start && createdAt <= end;
      })
    : [];

  const tableHeaders = [
    { label: "Booking Id", key: "bookingId" },
    { label: "Pick Up", key: "pickUp" },
    { label: "Drop Off", key: "dropOff" },
    { label: "Passenger", key: "passenger" },
    { label: "Date & Time", key: "date" },
    { label: "Tax", key: "tax" },
    { label: "Fare", key: "fare" },
    { label: "Action", key: "actions" },
  ];
  const passengerNames = Array.from(
    new Set(allBookings.map((b) => b.passenger?.name).filter(Boolean))
  ).sort();

  const customerList = [
    { label: "All", count: 0 },
    ...passengerNames.map((name) => ({
      label: name,
      count: 0,
    })),
  ];
  const customerFilteredBookings = filteredBookings.filter((b) => {
    if (selectedCustomers.length === 0 || selectedCustomers.includes("All")) {
      return true;
    }
    return selectedCustomers.includes(b.passenger?.name);
  });
  const handleCustomerSelection = (newSelection) => {
    const wasAllSelected = selectedCustomers.includes("All");
    const isAllInNewSelection = newSelection.includes("All");

    if (isAllInNewSelection && !wasAllSelected) {
      const allPassengerNames = passengerNames;
      setSelectedCustomers(["All", ...allPassengerNames]);
    } else if (wasAllSelected && !isAllInNewSelection) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(newSelection.filter((item) => item !== "All"));
    }
  };
  const handleCreateInvoice = async () => {
    const grouped = {};
  
    // Step 1: Group bookings by passenger email
    customerFilteredBookings.forEach((booking) => {
      const passenger = booking.passenger || {};
      const email = passenger.email || "no@email.com";
  
      if (!grouped[email]) {
        grouped[email] = {
          customer: {
            name: passenger.name || "Unknown",
            email: email,
            phone: passenger.phone || "",
          },
          bookings: [],
        };
      }
  
      grouped[email].bookings.push(booking);
    });
  
    // Step 2: Extract unique customers array
    const customers = Object.values(grouped).map((entry) => entry.customer);
  
    // Step 3: Flatten all bookings to create items array
    const items = Object.values(grouped).flatMap((entry) =>
      entry.bookings.map((booking) => {
        const fare = booking.returnJourney?.fare || booking.primaryJourney?.fare || 0;
        const totalAmount = booking.tax === "Tax" ? fare * 1.2 : fare;
  
        return {
          bookingId: booking._id,
          pickup: booking.primaryJourney?.pickup || "-",
          dropoff: booking.primaryJourney?.dropoff || "-",
          date: booking.createdAt,
          fare,
          tax: "No Tax",
          totalAmount,
          status: "unpaid",
        };
      })
    );
  
    const payload = {
      invoiceNumber: "",
      companyId: user.companyId,
      customers, // This will now contain all unique customers
      items,
    };
  
    try {
      const res = await createInvoice(payload).unwrap();
      console.log("Invoice Created:", res);
      console.log("Customers sent:", customers); // Add this to debug
      alert("Invoice Created Successfully");
    } catch (err) {
      console.error("Invoice creation failed", err);
      alert("Failed to create invoice");
    }
  };

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
    setSearchTriggered(false);
  };
 const tableData = customerFilteredBookings.map((item) => ({
    bookingId: item.bookingId || "-",
    pickUp: item.primaryJourney?.pickup || "-",
    dropOff: item.primaryJourney?.dropoff || "-",
    tax: <SelectOption width="w-full md:w-32" options={["No Tax", "Tax"]} />,
    actions: <button     className="btn btn-primary">Apply</button>,
    passenger: item.passenger?.name || "-",
    date: item.createdAt ? new Date(item.createdAt).toLocaleString() : "-",
    fare: (
      <input
        type="text"
        className="custom_input"
        defaultValue={
          item.returnJourney
            ? item.returnJourney.fare
            : item.primaryJourney?.fare
        }
      />
    ),
  }));

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
              setSelected={handleCustomerSelection}
              statusList={customerList}
              placeholder="Select Customer"
              showCount={false}
            />
          </div>

          <div className="flex items-center justify-between  space-x-2">
            <div className="w-full sm:w-24">
              <SelectOption options={["No Tax", "Tax"]} />
            </div>
            <button className="btn btn-edit">Apply to All</button>
          </div>
        </div>

        {/* Button Section */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            className="btn btn-reset w-full sm:w-auto"
            onClick={() => setSearchTriggered(true)}
          >
            Search
          </button>
          <button
            onClick={resetHandler}
            className="btn btn-outline w-full sm:w-auto"
            title="Reset Filters"
          >
            ↻
          </button>
        </div>
      </div>
      <div className=" mt-4">
        <CustomTable tableHeaders={tableHeaders} tableData={tableData} />
      </div>
      {customerFilteredBookings.length > 0 && (
  <div className="mt-4 flex justify-end">
    <button
      onClick={handleCreateInvoice}
      disabled={isCreating}
      className="btn btn-primary"
    >
      {isCreating ? "Creating..." : "Create Invoice"}
    </button>
  </div>
)}

    </div>
  );
};

export default NewInvoice;
