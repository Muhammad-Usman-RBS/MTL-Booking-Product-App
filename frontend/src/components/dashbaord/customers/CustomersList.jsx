import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetCustomersQuery,
  useDeleteCustomerMutation,
  useUpdateCustomerMutation,
} from "../../../redux/api/customerApi";
import Icons from "../../../assets/icons";
import NewCustomer from "./NewCustomer";
import ViewCustomer from "./ViewCustomer";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import EmptyTableMessage from "../../../constants/constantscomponents/EmptyTableMessage";
import { Link } from "react-router-dom";

const tabOptions = ["Active", "Suspended", "Pending", "Deleted"];

const CustomersList = () => {
  const user = useSelector((state) => state?.auth?.user);
  const companyId = user?.companyId;

  const { data: customersData } = useGetCustomersQuery();
  const [deleteCustomer] = useDeleteCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();

  const [activeTab, setActiveTab] = useState("Active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState("All");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewCustomerId, setViewCustomerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const allCustomers = customersData?.customers || [];

  const filteredData = useMemo(() => {
    const query = search.toLowerCase();
    return allCustomers.filter(
      (customer) =>
        customer?.status === activeTab &&
        (customer?.name?.toLowerCase().includes(query) ||
          customer?.email?.toLowerCase().includes(query))
    );
  }, [allCustomers, search, activeTab]);

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
  }, [filteredData, perPage, activeTab]);

  const handleStatusChange = async (id, newStatus) => {
    if (!id) return;
    try {
      await updateCustomer({ id, formData: { status: newStatus } }).unwrap();
      toast.success(`Customer status updated to ${newStatus}`);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update status.");
    }
  };

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
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const tableData =
    filteredData.length === 0
      ? EmptyTableMessage({
          message: "No customers found. Create a new customer.",
          colSpan: tableHeaders.length,
        })
      : paginatedData.map((customer, index) => ({
          index:
            (page - 1) *
              (perPage === "All" ? filteredData.length : Number(perPage)) +
            index +
            1,
          name: customer?.name || "N/A",
          email: customer?.email || "N/A",
          status: <span>{customer?.status}</span>,
          actions: (
            <div className="flex gap-2">
              {customer.status === "Active" && (
                <>
                  <Icons.Eye
                    className="w-8 h-8 rounded-md hover:bg-blue-600 hover:text-white text-[var(--dark-gray)] cursor-pointer border border-[var(--light-gray)] p-2"
                    onClick={() => setViewCustomerId(customer._id)}
                  />
                  <Icons.Pencil
                    className="w-8 h-8 rounded-md hover:bg-yellow-600 hover:text-white text-[var(--dark-gray)] cursor-pointer border border-[var(--light-gray)] p-2"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setIsModalOpen(true);
                    }}
                  />
                </>
              )}

              {customer.status !== "Active" && (
                <button
                  onClick={() => handleStatusChange(customer._id, "Active")}
                  className="tab tab-success"
                >
                  Active
                </button>
              )}
              {customer.status !== "Suspended" && (
                <button
                  onClick={() => handleStatusChange(customer._id, "Suspended")}
                  className="tab-suspended tab"
                >
                  Suspend
                </button>
              )}
              {customer.status !== "Deleted" ? (
                <button
                  onClick={() => handleStatusChange(customer._id, "Deleted")}
                  className="tab tab-danger"
                >
                  Delete
                </button>
              ) : (
                <>
                  <Link to={`/dashboard/customers/edit/${customer._id}`}>
                    <Icons.Pencil
                      title="Edit"
                      className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
                    />
                  </Link>

                  <span
                    onClick={() => {
                      setShowDeleteModal(true);
                      setCustomerToDelete(customer);
                    }}
                    className="cursor-pointer"
                  >
                    <Icons.Trash
                      title="Delete"
                      className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)]"
                    />
                  </span>
                </>
              )}
            </div>
          ),
        }));

  return (
    <>
      <div>
        <OutletHeading name="Customer List" />

        {/* Create New */}
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

        {/* Tabs */}
        <div className="w-full overflow-x-auto mb-4">
          <div className="flex gap-4 text-sm font-medium border-b min-w-max sm:text-base px-2">
            {tabOptions.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-[var(--dark-gray)] hover:text-blue-500"
                }`}
              >
                {tab} ({allCustomers.filter((c) => c?.status === tab).length})
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <CustomTable
          tableHeaders={tableHeaders}
          tableData={tableData}
          showSearch={true}
          searchValue={search}
          setSearchValue={setSearch}
          showPagination={true}
          showSorting={true}
          currentPage={page}
          setCurrentPage={setPage}
          perPage={perPage}
        />

        {/* Delete Modal */}
        <DeleteModal
          isOpen={showDeleteModal}
          onConfirm={() => handleDeleteCustomer(customerToDelete?._id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setCustomerToDelete(null);
          }}
        />
      </div>

      {/* New/Edit Modal */}
      <NewCustomer
        isOpen={isModalOpen}
        customerData={selectedCustomer}
        onSave={handleUpdateCustomer}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
      />

      {/* View Modal */}
      {viewCustomerId && (
        <ViewCustomer
          customerId={viewCustomerId}
          onClose={() => setViewCustomerId(null)}
        />
      )}
    </>
  );
};

export default CustomersList;
