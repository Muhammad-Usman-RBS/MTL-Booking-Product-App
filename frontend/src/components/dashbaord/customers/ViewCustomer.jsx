import React from "react";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { useGetCustomerQuery } from "../../../redux/api/customerApi";

// Format date as DD-MMM-YYYY
const formatDate = (date) => {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const ViewCustomer = ({ customerId, onClose }) => {
  const { data: customer, isLoading, error } = useGetCustomerQuery(customerId);

  const isActive = customer?.status === "Active";
  const statusColor = isActive ? "text-green-600" : "text-red-500";

  return (
    <CustomModal isOpen={!!customerId} onClose={onClose} heading="View Customer">
      <div className="text-sm px-4 pb-4 w-full max-w-[500px]">
        {isLoading && (
          <p className="text-center py-6 font-medium text-gray-500">
            Loading customer details...
          </p>
        )}

        {error && (
          <p className="text-center py-6 font-medium text-red-600">
            Failed to load customer information.
          </p>
        )}

        {!isLoading && !error && customer && (
          <>
            {/* Profile Image */}
            <div className="flex justify-center mb-6">
              <img
                src={customer?.profile || "/default-user.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full border border-gray-300 object-cover"
              />
            </div>

            {/* Customer Details Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
              <div>
                <p className="font-medium">Status</p>
                <p className={`font-semibold ${statusColor}`}>
                  {customer?.status || "N/A"}
                </p>
              </div>

              <div>
                <p className="font-medium">Name</p>
                <p>{customer?.name || "N/A"}</p>
              </div>

              <div>
                <p className="font-medium">Email</p>
                <p>{customer?.email || "N/A"}</p>
              </div>

              <div>
                <p className="font-medium">Contact</p>
                <p>{customer?.contact || "N/A"}</p>
              </div>

              <div className="col-span-2">
                <p className="font-medium">Address</p>
                <p>{customer?.address || "N/A"}</p>
              </div>

              <div className="col-span-2">
                <p className="font-medium">Home Address</p>
                <p>{customer?.homeAddress || "N/A"}</p>
              </div>

              <div>
                <p className="font-medium">Created Date</p>
                <p>{formatDate(customer?.createdAt)}</p>
              </div>

              <div>
                <p className="font-medium">Last Login</p>
                <p>{formatDate(customer?.lastLogin)}</p>
              </div>
            </div>

            {/* Total Bookings */}
            <div className="flex justify-start">
              <div className="border rounded px-4 py-1 bg-gray-100 text-gray-800 text-sm">
                Total Bookings: <strong>{customer?.bookings || 0}</strong>
              </div>
            </div>
          </>
        )}
      </div>
    </CustomModal>
  );
};

export default ViewCustomer;
