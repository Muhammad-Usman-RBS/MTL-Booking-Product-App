import React, { useState, useEffect } from "react";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import { useSelector } from "react-redux";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { useCreateInvoiceMutation } from "../../../redux/api/invoiceApi";
import { toast } from "react-toastify";
import { useGetGeneralPricingPublicQuery } from "../../../redux/api/generalPricingApi";

const getFirstAndLastDay = (offset = 0) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return [firstDay, lastDay];
};

const NewInvoice = () => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
  const { data: generalPricingData } = useGetGeneralPricingPublicQuery(
    companyId,
    {
      skip: !companyId,
    }
  );
  const [selectedRows, setSelectedRows] = useState([]);
  const [globalTaxSelection, setGlobalTaxSelection] = useState("No Tax");
  const [bookingTaxes, setBookingTaxes] = useState({});

  const [startDate, setStartDate] = useState(new Date());

  const [endDate, setEndDate] = useState(new Date());
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isDateRangeChanged, setIsDateRangeChanged] = useState(false);

  const taxPercent = parseFloat(generalPricingData?.invoiceTaxPercent || 0);
  const taxMultiplier = 1 + taxPercent / 100;

  const { data: bookingData } = useGetAllBookingsQuery(user?.companyId);
  const allBookings = bookingData?.bookings || [];
  const filteredBookings = allBookings.filter((b) => {
    const createdAt = new Date(b.createdAt);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return createdAt >= start && createdAt <= end;
  });

  useEffect(() => {
    const [initialFirst, initialLast] = getFirstAndLastDay(0);

    // Ensure startDate and endDate are Date objects
    const startDateObj =
      startDate instanceof Date ? startDate : new Date(startDate);
    const endDateObj = endDate instanceof Date ? endDate : new Date(endDate);

    const isDateChanged =
      startDateObj.getTime() !== initialFirst.getTime() ||
      endDateObj.getTime() !== initialLast.getTime();
    setIsDateRangeChanged(isDateChanged);
  }, [startDate, endDate]);
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
    // If date range is changed and no customers selected, show all date-filtered data
    if (selectedCustomers.length === 0 && isDateRangeChanged) {
      return true;
    }
    // If no customers selected and date range is default, don't show any data
    if (selectedCustomers.length === 0) {
      return false;
    }
    // If "All" is selected, show all data (already date filtered)
    if (selectedCustomers.includes("All")) {
      return true;
    }
    // Otherwise, filter by selected customers
    return selectedCustomers.includes(b.passenger?.name);
  });

  const tableHeaders = [
    {
      label: (
        <input
          type="checkbox"
          checked={
            selectedRows.length === customerFilteredBookings.length &&
            customerFilteredBookings.length > 0
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(customerFilteredBookings.map((item) => item._id));
            } else {
              setSelectedRows([]);
            }
          }}
        />
      ),
      key: "checkbox",
    },
    { label: "Booking Id", key: "bookingId" },
    { label: "Pick Up", key: "pickUp" },
    { label: "Drop Off", key: "dropOff" },
    { label: "Passenger", key: "passenger" },
    { label: "Date & Time", key: "date" },
    { label: "Fare", key: "fare" },
    { label: "Tax", key: "tax" },
    { label: "Total Amount", key: "totalAmount" },
  ];
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
    const selectedBookings = customerFilteredBookings.filter((booking) =>
      selectedRows.includes(booking._id)
    );

    if (selectedBookings.length === 0) {
      toast.error("Please select at least one booking");
      return;
    }

    // Group bookings by customer
    const grouped = {};

    selectedBookings.forEach((booking) => {
      const passenger = booking.passenger || {};
      const uniqueKey =
        passenger._id ||
        `${passenger.name}-${passenger.phone}` ||
        Math.random();

      if (!grouped[uniqueKey]) {
        grouped[uniqueKey] = {
          customer: {
            name: passenger.name || "Unknown",
            email: passenger.email || "no@email.com",
            phone: passenger.phone || "",
          },
          bookings: [],
        };
      }

      grouped[uniqueKey].bookings.push(booking);
    });

    try {
      for (const entry of Object.values(grouped)) {
        const { customer, bookings } = entry;

        const items = bookings.map((booking) => {
          const fare =
            booking.returnJourney?.fare || booking.primaryJourney?.fare;
          const taxType = bookingTaxes[booking._id] || "No Tax";
          const totalAmount = taxType === "Tax" ? fare * taxMultiplier : fare;
          const journeyNotes =
            booking.returnJourney?.notes || booking.primaryJourney?.notes || "";
          const internalNotes =
            booking.returnJourney?.internalNotes ||
            booking.primaryJourney?.internalNotes;
          const source = booking?.source;
          return {
            bookingId: booking.bookingId,
            pickup: booking.primaryJourney?.pickup || "-",
            dropoff: booking.primaryJourney?.dropoff || "-",
            date: booking.createdAt,
            fare,
            tax: taxType,
            totalAmount,
            status: "unpaid",
            notes: journeyNotes,
            source: source,
            internalNotes: internalNotes,
          };
        });

        const payload = {
          invoiceNumber: "",
          companyId: user.companyId,
          customer,
          items,
        };

        await createInvoice(payload).unwrap();
      }

      toast.success("Invoices Created Successfully");
    } catch (err) {
      console.error("Invoice creation failed", err);
      toast.error("Failed to create invoices");
    }
  };

  useEffect(() => {
    const [first, last] = getFirstAndLastDay(0);
    setStartDate(first);
    setEndDate(last);
  }, []);

  let tableData = [];

  if (customerFilteredBookings.length === 0) {
    tableData = [
      {
        customRow: true,
        content: (
          <td
            colSpan={tableHeaders.length}
            className="text-center py-2.5 text-[var(--dark-gray)] font-semibold text-md"
          >
            Apply filtration to see bookings
          </td>
        ),
      },
    ];
  } else {
    tableData = customerFilteredBookings.map((item) => ({
      checkbox: (
        <input
          type="checkbox"
          checked={selectedRows.includes(item._id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows([...selectedRows, item._id]);
            } else {
              setSelectedRows(selectedRows.filter((id) => id !== item._id));
            }
          }}
        />
      ),

      bookingId: item.bookingId || "-",
      totalAmount: (() => {
        const fare = item.returnJourney?.fare || item.primaryJourney?.fare || 0;
        const taxType = bookingTaxes[item._id] || "No Tax";
        return taxType === "Tax"
          ? (fare * taxMultiplier).toFixed(2)
          : fare.toFixed(2);
      })(),
      pickUp: item.primaryJourney?.pickup || "-",
      dropOff: item.primaryJourney?.dropoff || "-",
      tax: (
        <SelectOption
          width="w-full md:w-24"
          options={["No Tax", "Tax"]}
          value={bookingTaxes[item._id] || "No Tax"}
          onChange={(e) => {
            const value = e.target.value;
            setBookingTaxes((prev) => ({
              ...prev,
              [item._id]: value,
            }));
          }}
        />
      ),
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
  }
  useEffect(() => {
    if (
      !generalPricingData?.invoiceTaxPercent ||
      Object.keys(bookingTaxes).length > 0
    )
      return;

    const taxPercent = parseFloat(generalPricingData.invoiceTaxPercent);
    if (taxPercent > 0 && customerFilteredBookings.length > 0) {
      const updated = {};
      customerFilteredBookings.forEach((b) => {
        updated[b._id] = "No Tax"; 
      });
      setBookingTaxes(updated);
    }
  }, [generalPricingData, customerFilteredBookings, bookingTaxes]);

  return (
    <div>
      <OutletHeading name="Create New Invoice" />

      <div className="flex    gap-4">
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
          <div className="flex  mb-1   ">
            <div className="w-full sm:w-64">
              <SelectOption
                options={["No Tax", "Tax"]}
                value={globalTaxSelection}
                onChange={(e) => {
                  const value = e.target.value;
                  setGlobalTaxSelection(value);
                  const updatedTaxes = {};
                  selectedRows.forEach((id) => {
                    updatedTaxes[id] = value;
                  });
                  setBookingTaxes((prev) => ({ ...prev, ...updatedTaxes }));
                  if (selectedRows.length > 0) {
                    toast.success(`Applied "${value}" to selected bookings`);
                  }
                }}
              />
            </div>
          </div>
        </div>
        {selectedRows.length > 0 && (
          <div className=" flex whitespace-nowrap justify-end">
            <button
              onClick={handleCreateInvoice}
              disabled={isCreating}
              className="btn btn-primary"
            >
              {isCreating ? "Creating..." : `Create Invoice `}
            </button>
          </div>
        )}
      </div>
      <div>
        <CustomTable
          showSearch={false}
          showRefresh={false}
          tableHeaders={tableHeaders}
          tableData={tableData}
        />
      </div>
    </div>
  );
};

export default NewInvoice;
