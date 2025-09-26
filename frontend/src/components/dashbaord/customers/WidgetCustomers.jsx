import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import IMAGES from "../../../assets/images";
import { useGetAllCustomersQuery } from "../../../redux/api/adminApi";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import EmptyTableMessage from "../../../constants/constantscomponents/EmptyTableMessage";

const WidgetCustomers = () => {
  const user = useSelector((state) => state?.auth?.user);
  const companyId = user?.companyId?.toString();

  const { data } = useGetAllCustomersQuery();
  const allCustomers = Array.isArray(data) ? data : data?.customers || [];

  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetAllBookingsQuery(companyId);
  const allBookings = Array.isArray(bookingsData)
    ? bookingsData
    : bookingsData?.bookings || [];

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState("All");

  // Count bookings per customer
  const bookingsCountByCustomer = useMemo(() => {
    const map = {};

    allCustomers.forEach((customer) => {
      const customerId = customer._id;
      const name = customer.fullName?.trim().toLowerCase();
      const email = customer.email?.trim().toLowerCase();
      const phone = customer.phone?.trim();

      // Count all bookings that match by ID or passenger info
      const matchedBookings = allBookings.filter((booking) => {
        if (booking.customerId?.toString() === customerId) return true;

        const passenger = booking.passenger || {};
        const passengerName = passenger.name?.trim().toLowerCase();
        const passengerEmail = passenger.email?.trim().toLowerCase();
        const passengerPhone = passenger.phone?.trim();

        return (
          (passengerName && passengerName === name) ||
          (passengerEmail && passengerEmail === email) ||
          (passengerPhone && passengerPhone === phone)
        );
      });

      map[customerId] = matchedBookings.length;
    });

    return map;
  }, [allCustomers, allBookings]);

  const filteredData = useMemo(() => {
    const query = search.toLowerCase();
    return allCustomers
      .filter(
        (customer) =>
          customer?.role === "customer" &&
          customer?.companyId?.toString() === companyId
      )
      .filter(
        (customer) =>
          customer?.fullName?.toLowerCase().includes(query) ||
          customer?.email?.toLowerCase().includes(query)
      );
  }, [allCustomers, companyId, search]);

  const totalPages =
    perPage === "All" ? 1 : Math.ceil(filteredData.length / Number(perPage));

  const paginatedData =
    perPage === "All"
      ? filteredData
      : filteredData.slice(
          (page - 1) * Number(perPage),
          page * Number(perPage)
        );

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filteredData, perPage]);

  const tableHeaders = [
    { label: "No.", key: "index" },
    { label: "Profile", key: "profile" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Bookings", key: "bookings" },
    { label: "Status", key: "status" },
  ];

  const tableData =
    filteredData.length === 0
      ? EmptyTableMessage({
          message: "No widget customers found.",
          colSpan: tableHeaders.length,
        })
      : paginatedData.map((customer, index) => ({
          index:
            (page - 1) *
              (perPage === "All" ? filteredData.length : Number(perPage)) +
            index +
            1,
          profile: (
            <img
              src={customer?.profileImage || IMAGES.dummyImg}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
          ),
          name: customer?.fullName || "N/A",
          email: customer?.email || "N/A",
          bookings: (
            <span className="font-medium text-gray-800">
              {bookingsCountByCustomer[customer?._id] || 0}
            </span>
          ),
          status: <span>{customer?.status || "N/A"}</span>,
        }));
        const exportTableData = paginatedData.map((customer, index) => ({
          index:
            (page - 1) * (perPage === "All" ? filteredData.length : Number(perPage)) +
            index +
            1,
          name: customer?.fullName || "",
          email: customer?.email || "",
          bookings: bookingsCountByCustomer[customer?._id] || 0,
          status: customer?.status || "",
        }));
  return (
    <CustomTable
      filename="Widget-Customers-list"
      tableHeaders={tableHeaders}
      tableData={tableData}
      exportTableData={exportTableData} 
      showSearch={true}
      searchValue={search}
      setSearchValue={setSearch}
      showPagination={true}
      showSorting={true}
      currentPage={page}
      setCurrentPage={setPage}
      perPage={perPage}
    />
  );
};

export default WidgetCustomers;
