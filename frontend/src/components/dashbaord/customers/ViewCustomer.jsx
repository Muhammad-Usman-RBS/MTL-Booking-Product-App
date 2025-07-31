import React from "react";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { useGetCustomerQuery } from "../../../redux/api/customerApi";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import { useSelector } from "react-redux";
import IMAGES from "../../../assets/images";

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
  const user = useSelector((state) => state?.auth?.user);
  const companyId = user?.companyId?.toString();

  const { data: bookingsResponse } = useGetAllBookingsQuery(companyId);
  const allBookings = Array.isArray(bookingsResponse)
    ? bookingsResponse
    : bookingsResponse?.bookings || [];

  // Match bookings by email (or fallback to phone)
  const totalBookings = allBookings.filter(
    (booking) =>
      booking?.passenger?.email === customer?.email ||
      booking?.passenger?.phone === customer?.phone
  ).length;

  return (
    <CustomModal isOpen={!!customerId} onClose={onClose} heading="Customer Information">
      <div className="text-sm px-6 pb-6 w-96">
        {isLoading && (
          <p className="text-center py-10 font-medium text-gray-500 animate-pulse">
            Loading customer details...
          </p>
        )}

        {error && (
          <p className="text-center py-10 font-medium text-red-600">
            Failed to load customer information.
          </p>
        )}

        {!isLoading && !error && customer && (
          <>
            <div className="flex justify-center mb-6 mt-4">
              <div className="relative w-28 h-28">
                <img
                  src={customer?.profile || IMAGES.dummyImg}
                  alt="Profile"
                  className="w-full h-full rounded-full border-4 border-[var(--main-color)] object-cover shadow-lg"
                />
                <div className="absolute bottom-0 right-0 bg-[var(--main-color)] p-1 rounded-full border-white border">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              {[
                { label: "Full Name", value: customer?.name },
                { label: "Email Address", value: customer?.email },
                { label: "Contact Number", value: customer?.phone ? `+${customer.phone}` : null },
                { label: "Primary Address", value: customer?.address },
                { label: "Home Address", value: customer?.homeAddress },
                { label: "Created On", value: formatDate(customer?.createdAt) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white border border-gray-200 py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-gray-800 font-semibold">{value || "N/A"}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <div className="btn btn-reset">
                Total Bookings: {totalBookings}
              </div>
            </div>
          </>
        )}
      </div>
    </CustomModal>
  );
};

export default ViewCustomer;
