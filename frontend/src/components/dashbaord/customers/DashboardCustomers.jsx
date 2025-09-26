import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetCorporateCustomersQuery,
  useDeleteCorporateCustomerMutation,
  useUpdateCorporateCustomerMutation,
} from "../../../redux/api/corporateCustomerApi";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import IMAGES from "../../../assets/images";
import Icons from "../../../assets/icons";
import NewCorporateCustomer from "./NewCorporateCustomer";
import ViewCorporateCustomer from "./ViewCorporateCustomer";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import EmptyTableMessage from "../../../constants/constantscomponents/EmptyTableMessage";
import { useLoading } from "../../common/LoadingProvider";

const DashboardCustomers = () => {
  const user = useSelector((state) => state?.auth?.user);
  const companyId = user?.companyId?.toString();
  const { showLoading, hideLoading } = useLoading();
  const { data: customersData, isLoading } = useGetCorporateCustomersQuery();
  const { data: bookingsResponse } = useGetAllBookingsQuery(companyId);

  const [deleteCustomer] = useDeleteCorporateCustomerMutation();
  const [updateCustomer] = useUpdateCorporateCustomerMutation();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState("All");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewCustomerId, setViewCustomerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, hideLoading, showLoading]);
  const allCustomers = customersData?.customers || [];

  // ✅ Fix: Ensure allBookings is always an array
  const allBookings = Array.isArray(bookingsResponse)
    ? bookingsResponse
    : bookingsResponse?.bookings || [];

  const filteredData = useMemo(() => {
    const query = search.toLowerCase();
    return allCustomers.filter(
      (customer) =>
        customer?.name?.toLowerCase().includes(query) ||
        customer?.email?.toLowerCase().includes(query)
    );
  }, [allCustomers, search]);

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

  const handleUpdateCustomer = async (id, updatedData) => {
    if (!id) return;
    try {
      await updateCustomer({ id, formData: updatedData }).unwrap();
      toast.success("Customer updated successfully!");
      setIsModalOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update customer.");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!customerId) return;
    try {
      await deleteCustomer(customerId).unwrap();
      toast.success("Customer permanently deleted!");
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (err) {
      console.error("Permanent delete failed:", err);
      toast.error("Failed to delete customer.");
    }
  };

  const tableHeaders = [
    { label: "No.", key: "index" },
    { label: "Profile", key: "profile" },
    { label: "Vat No.", key: "vatnumber" },
    { label: "Name", key: "name" },
    { label: "Company Name", key: "companyname" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Bookings", key: "bookings" },
    { label: "Actions", key: "actions" },
  ];

  const tableData = paginatedData.map((customer, index) => {
    const customerBookingCount = allBookings.filter(
      (booking) => booking?.passenger?.email === customer?.email
    ).length;

    return {
      index:
        (page - 1) *
          (perPage === "All" ? filteredData.length : Number(perPage)) +
        index +
        1,
      profile: (
        <img
          src={customer?.profile || IMAGES.dummyImg}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border border-gray-300"
        />
      ),
      vatnumber: customer?.vatnumber || "N/A",
      name: customer?.name || "N/A",
      companyname: customer?.companyname || "N/A",
      email: customer?.email || "N/A",
      phone: customer?.phone ? `+${customer.phone}` : "N/A",
      bookings: (
        <span className="font-medium text-gray-800">
          {customerBookingCount}
        </span>
      ),
      actions: (
        <div className="flex gap-2">
          <div className="icon-box icon-box-info">
            <Icons.Eye
              className="size-4"
              onClick={() => setViewCustomerId(customer._id)}
            />
          </div>
          <div className="icon-box icon-box-warning">
            <Icons.Pencil
              className="size-4"
              title="Edit"
              onClick={() => {
                setSelectedCustomer(customer);
                setIsModalOpen(true);
              }}
            />
          </div>
          <div className="icon-box icon-box-danger">
            <Icons.Trash
              title="Delete"
              className="size-4"
              onClick={() => {
                setShowDeleteModal(true);
                setCustomerToDelete(customer);
              }}
            />
          </div>
        </div>
      ),
    };
  });

  const exportTableData = paginatedData.map((customer, index) => {
    const customerBookingCount = allBookings.filter(
      (booking) => booking?.passenger?.email === customer?.email
    ).length;

    return {
      index:
        (page - 1) *
          (perPage === "All" ? filteredData.length : Number(perPage)) +
        index +
        1,
      vatnumber: customer?.vatnumber || "",
      name: customer?.name || "",
      companyname: customer?.companyname || "",
      email: customer?.email || "",
      phone: customer?.phone ? `+${customer.phone}` : "",
      bookings: customerBookingCount,
    };
  });

  return (
    <>
      <div>
        <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 sm:px-0 mb-4">
          <button
            onClick={() => {
              setSelectedCustomer(null);
              setIsModalOpen(true);
            }}
            className="btn btn-reset flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Create New Customer
          </button>
        </div>

        <CustomTable
          filename="Corporate-Customers-list"
          emptyMessage="No Customers Found"
          tableHeaders={tableHeaders}
          tableData={tableData}
          showSearch={true}
          exportTableData={exportTableData}
          searchValue={search}
          setSearchValue={setSearch}
          showPagination={true}
          showSorting={true}
          currentPage={page}
          setCurrentPage={setPage}
          perPage={perPage}
        />

        <DeleteModal
          isOpen={showDeleteModal}
          onConfirm={() => handleDeleteCustomer(customerToDelete?._id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setCustomerToDelete(null);
          }}
        />
      </div>

      <NewCorporateCustomer
        isOpen={isModalOpen}
        customerData={selectedCustomer}
        onSave={handleUpdateCustomer}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
      />

      {viewCustomerId && (
        <ViewCorporateCustomer
          customerId={viewCustomerId}
          onClose={() => setViewCustomerId(null)}
        />
      )}
    </>
  );
};

export default DashboardCustomers;
