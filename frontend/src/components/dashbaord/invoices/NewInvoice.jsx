import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectDateRange from "../../../constants/constantscomponents/SelectDateRange";
import SelectedSearch from "../../../constants/constantscomponents/SelectedSearch";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import { useGetGeneralPricingPublicQuery } from "../../../redux/api/generalPricingApi";
import { useCreateInvoiceMutation } from "../../../redux/api/invoiceApi";

const getFirstAndLastDay = (offset = 0) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return [firstDay, lastDay];
};

const NewInvoice = ({ invoiceType = "customer" }) => {
  const navigate = useNavigate();
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
  const [selectedDrivers, setSelectedDrivers] = useState([]);

  const [endDate, setEndDate] = useState(new Date());
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isDateRangeChanged, setIsDateRangeChanged] = useState(false);

  const taxPercent = parseFloat(generalPricingData?.invoiceTaxPercent || 0);
  const taxMultiplier = 1 + taxPercent / 100;

  const { data: bookingData } = useGetAllBookingsQuery(user?.companyId);
  console.log("bookingData", bookingData);
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
  const uniqueCustomers = allBookings.reduce((acc, booking) => {
    const passenger = booking.passenger;
    if (passenger?.email) {
      const email = passenger.email;
      if (!acc[email]) {
        acc[email] = {
          name: passenger.name || "Unknown",
          email: email,
          displayLabel: `${passenger.name || "Unknown"} (${email})`
        };
      }
    }
    return acc;
  }, {});
  
  const customerList = [
    { label: "All", count: 0 },
    ...Object.values(uniqueCustomers)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((customer) => ({
        label: customer.displayLabel,
        value: customer.email, // Use email as the actual value
        count: 0,
      })),
  ];

  const uniqueDrivers = allBookings.reduce((acc, booking) => {
    const drivers = booking?.drivers || [];
    drivers.forEach(driver => {
      if (driver?.email) {
        const email = driver.email;
        if (!acc[email]) {
          acc[email] = {
            name: driver.name || "Unknown",
            email: email,
            displayLabel: `${driver.name || "Unknown"} (${email})`
          };
        }
      }
    });
    return acc;
  }, {});
  
  const driverList = [
    { label: "All", count: 0 },
    ...Object.values(uniqueDrivers)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((driver) => ({
        label: driver.displayLabel,
        value: driver.email, // Use email as the actual value
        count: 0,
      })),
  ];
  const customerFilteredBookings = filteredBookings.filter((b) => {
    const passengerName = b.passenger?.name;
    const bookingDriverEmails = b?.drivers?.map((d) => d?.email).filter(Boolean) || [];
    const isCompleted = b.status === "Completed";

    const customerMatch =
    selectedCustomers.includes("All") ||
    selectedCustomers.includes(b.passenger?.email);

    const driverMatch =
    selectedDrivers.includes("All") ||
    bookingDriverEmails.some((email) => selectedDrivers.includes(email));

    const customerSelected = selectedCustomers.length > 0;
    const driverSelected = selectedDrivers.length > 0;

    // Only include completed bookings
    if (!isCompleted) return false;

    // If both customer & driver filters are applied
    if (customerSelected && driverSelected) {
      return customerMatch && driverMatch;
    }

    // If only customer filter is applied
    if (customerSelected && !driverSelected) {
      return customerMatch;
    }

    // If only driver filter is applied
    if (!customerSelected && driverSelected) {
      return driverMatch;
    }

    // If no filters are applied, return false
    return false;
  });
  console.log(customerFilteredBookings);
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
    {
      label: invoiceType === "driver" ? "Driver" : "Customer",
      key: "passenger",
    },
    { label: "Date & Time", key: "date" },
    {
      label: invoiceType === "driver" ? "DriverFare" : "Fare",
      key: "fare",
    },
    { label: "Tax", key: "tax" },
    { label: "Total Amount", key: "totalAmount" },
  ];
  const handleCustomerSelection = (newSelection) => {
    const wasAllSelected = selectedCustomers.includes("All");
    const isAllInNewSelection = newSelection.includes("All");
  
    if (isAllInNewSelection && !wasAllSelected) {
      const allCustomerEmails = Object.keys(uniqueCustomers);
      setSelectedCustomers(["All", ...allCustomerEmails]);
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

    const grouped = {};

    selectedBookings.forEach((booking) => {
      let uniqueKey;
      let contact;

      if (invoiceType === "driver") {
        const driver = booking?.drivers?.[0] || {};
        uniqueKey =
          driver._id || `${driver.name}-${driver.phone}` || Math.random();
        contact = {
          name: driver.name || "Unknown Driver",
          email: driver.email || "no@email.com",
          phone: driver.contact || "",
        };
      } else {
        const passenger = booking.passenger || {};
        uniqueKey =
          passenger._id ||
          `${passenger.name}-${passenger.phone}` ||
          Math.random();
        contact = {
          name: passenger.name || "Unknown Customer",
          email: passenger.email || "no@email.com",
          phone: passenger.phone || "",
        };
      }

      if (!grouped[uniqueKey]) {
        grouped[uniqueKey] = {
          contact,
          bookings: [],
        };
      }

      grouped[uniqueKey].bookings.push(booking);
    });

    try {
      for (const entry of Object.values(grouped)) {
        const { contact, bookings } = entry;
        const items = bookings.map((booking) => {
          const taxType = bookingTaxes[booking._id] || "No Tax";

          const fare =
            invoiceType === "driver"
              ? booking.returnJourneyToggle
                ? booking.returnDriverFare || 0
                : booking.driverFare || 0
              : booking.returnJourney?.fare ||
              booking.primaryJourney?.fare ||
              0;

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
            status: "Unpaid",
            notes: journeyNotes,
            source: source,
            internalNotes: internalNotes,
          };
        });
        const payload = {
          invoiceNumber: "",
          companyId: user.companyId,
          invoiceType,
          ...(invoiceType === "driver"
            ? { driver: contact }
            : { customer: contact }),
          items,
        };

        await createInvoice(payload).unwrap();
      }

      toast.success("Invoices Created Successfully");
      const mode = invoiceType === "driver" ? "driver" : "customer";
      navigate(`/dashboard/invoices/list?mode=${mode}`, { replace: true });
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
  const handleDriverSelection = (newSelection) => {
    const wasAllSelected = selectedDrivers.includes("All");
    const isAllInNewSelection = newSelection.includes("All");
  
    if (isAllInNewSelection && !wasAllSelected) {
      const allDriverEmails = Object.keys(uniqueDrivers);
      setSelectedDrivers(["All", ...allDriverEmails]);
    } else if (wasAllSelected && !isAllInNewSelection) {
      setSelectedDrivers([]);
    } else {
      setSelectedDrivers(newSelection.filter((item) => item !== "All"));
    }
  };
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
            const updatedSelectedRows = e.target.checked
              ? [...selectedRows, item._id]
              : selectedRows.filter((id) => id !== item._id);

            setSelectedRows(updatedSelectedRows);

            // Set globalTaxSelection based on first selected row's tax
            if (updatedSelectedRows.length > 0) {
              const firstSelectedBookingId = updatedSelectedRows[0];
              const firstSelectedTax =
                bookingTaxes[firstSelectedBookingId] || "No Tax";
              setGlobalTaxSelection(firstSelectedTax);
            } else {
              setGlobalTaxSelection("No Tax");
            }
          }}
        />
      ),

      bookingId: item.bookingId || "-",
      totalAmount: (() => {
        const taxType = bookingTaxes[item._id] || "No Tax";

        const fare =
          invoiceType === "driver"
            ? item.returnJourneyToggle
              ? item.returnDriverFare || 0
              : item.driverFare || 0
            : item.returnJourney?.fare || item.primaryJourney?.fare || 0;

        return taxType === "Tax"
          ? (fare * taxMultiplier).toFixed(2)
          : fare.toFixed(2);
      })(),
      pickUp: item.primaryJourney?.pickup || item.returnJourney?.pickup || "-",
      dropOff:
        item.primaryJourney?.dropoff || item.returnJourney?.dropoff || "-",
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
      date: item.createdAt ? new Date(item.createdAt).toLocaleString() : "-",
      passenger:
        invoiceType === "driver"
          ? item?.drivers?.[0]?.name || "-"
          : item.passenger?.name || "-",

      fare: (
        <span>
          {invoiceType === "driver"
            ? item.returnJourneyToggle
              ? item.returnDriverFare || 0
              : item.driverFare || 0
            : item.returnJourney
              ? item.returnJourney.fare
              : item.primaryJourney?.fare}
        </span>
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
      <OutletHeading
        name={
          invoiceType === "customer"
            ? "Create Customer Invoice"
            : "Create Driver Invoice"
        }
      />

      <div className="flex    gap-4">
        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
          <div className="flex min-w-[255px] max-w-xs">
            <SelectDateRange
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </div>

          {invoiceType === "customer" && (
            <div className="w-full sm:w-64">
              <SelectedSearch
                selected={selectedCustomers}
                setSelected={handleCustomerSelection}
                statusList={customerList}
                placeholder="Select Customer"
                showCount={false}
              />
            </div>
          )}

          {invoiceType === "driver" && (
            <div className="w-full sm:w-64">
              <SelectedSearch
                selected={selectedDrivers}
                setSelected={handleDriverSelection}
                statusList={driverList}
                placeholder="Select Driver"
                showCount={false}
              />
            </div>
          )}
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
        <div className=" whitespace-nowrap">
          <button
            onClick={handleCreateInvoice}
            disabled={isCreating}
            className="btn btn-primary"
          >
            {isCreating ? "Creating..." : `Create Invoice `}
          </button>
        </div>
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
