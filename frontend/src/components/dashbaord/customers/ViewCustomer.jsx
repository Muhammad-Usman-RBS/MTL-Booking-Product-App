import React from "react";
import CustomModal from "../../../constants/constantscomponents/CustomModal";

const ViewCustomer = ({ customer, onClose }) => {
  return (
    <CustomModal isOpen={!!customer} onClose={onClose} heading="View">
      <div className="text-sm px-4 pb-4 w-[500px]">
        <div className="flex justify-center mb-6">
          <img
            src={customer?.profile || "/default-user.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full border"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
          <div>
            <p>
              <strong>Status</strong>
            </p>
            <p
              className={`font-semibold ${
                customer.status === "Active" ? "text-green-600" : "text-red-600"
              }`}
            >
              {customer.status}
            </p>
          </div>

          <div>
            <p>
              <strong>Name</strong>
            </p>
            <p>{customer.name}</p>
          </div>

          <div>
            <p>
              <strong>Address</strong>
            </p>
            <p>{customer.address || "N/A"}</p>
          </div>

          <div>
            <p>
              <strong>Home Address</strong>
            </p>
            <p>{customer.homeAddress || "N/A"}</p>
          </div>

          <div>
            <p>
              <strong>Created Date</strong>
            </p>
            <p>{customer.createdDate}</p>
          </div>

          <div>
            <p>
              <strong>Email</strong>
            </p>
            <p>{customer.email}</p>
          </div>

          <div>
            <p>
              <strong>Last Login</strong>
            </p>
            <p>{customer.lastLogin}</p>
          </div>

          <div>
            <p>
              <strong>Contact</strong>
            </p>
            <p>{customer.contact}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="border rounded px-4 py-1 text-gray-700 text-sm">
            Bookings: {customer.bookings || 0}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 border rounded hover:bg-gray-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ViewCustomer;
