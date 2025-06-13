import React, { useState } from "react";

const FareSection = ({ handleSubmit, isLoading, editBookingData, emailNotify,
  setEmailNotify,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [notification, setNotification] = useState({ customer: false });

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow rounded-md mt-6 space-y-6">
      {/* Conditionally Visible Inputs */}
      {paymentMethod === "Card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Card Payment Reference"
            className="custom_input"
          />
          <input
            type="text"
            placeholder="Payment Gateway"
            className="custom_input"
          />
        </div>
      )}

      {/* Payment Method */}
      <div className="flex flex-wrap items-center gap-4">
        {["Cash", "Card", "Payment Link"].map((method) => (
          <label
            key={method}
            className="flex items-center cursor-pointer gap-2"
          >
            <input
              type="radio"
              name="payment"
              className="cursor-pointer"
              value={method}
              checked={paymentMethod === method}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            {method}
          </label>
        ))}
      </div>

      {/* Fare Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Journey Fare" },
          { label: "Driver Fare" },
          { label: "Return Journey Fare" },
          { label: "Return Driver Fare" },
        ].map((item, index) => (
          <div
            key={index}
            className={`bg-gray-100 border border-gray-300 rounded px-4 py-3`}
          >
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              {item.label}
            </label>
            <div className="flex items-center">
              <input type="number" defaultValue={0} className="custom_input" />
              <span className="bg-gray-200 border border-gray-300 px-3 py-1 rounded-r text-gray-700 font-medium">
                GBP
              </span>
            </div>
          </div>
        ))}
      </div>

      <hr className="my-4" />

      {/* Notifications */}
      <div className="flex flex-wrap justify-center gap-6">
        {/* Email Section */}
        <div className="bg-gray-100 border border-gray-300 rounded-xl px-6 py-5 shadow-md w-[250px]">
          <h4 className="text-lg font-semibold text-blue-800 mb-3 border-b pb-1">
            Email
          </h4>
          <div className="space-y-3 text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-blue-600"
                checked={emailNotify.admin}
                onChange={() =>
                  setEmailNotify((prev) => ({ ...prev, admin: !prev.admin }))
                }
              />
              <span>Admin</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-blue-600"
                checked={emailNotify.customer}
                onChange={() =>
                  setEmailNotify((prev) => ({
                    ...prev,
                    customer: !prev.customer,
                  }))
                }
              />
              <span>Customer</span>
            </label>
          </div>
        </div>

        {/* Notification Section */}
        <div className="bg-gray-100 border border-gray-300 rounded-xl px-6 py-5 shadow-md w-[250px]">
          <h4 className="text-lg font-semibold text-teal-800 mb-3 border-b pb-1">
            Notification
          </h4>
          <div className="space-y-3 text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-teal-600"
                checked={notification.customer}
                onChange={() =>
                  setNotification((prev) => ({
                    ...prev,
                    customer: !prev.customer,
                  }))
                }
              />
              <span>Customer</span>
            </label>
          </div>
        </div>
      </div>

      {/* Book Button */}
      <div className="flex justify-center">

        <button
          onClick={handleSubmit}
          className="btn btn-primary font-semibold px-6 py-2 rounded-md shadow transition"
          disabled={isLoading}
        >
          {isLoading
            ? "Processing..."
            : editBookingData && editBookingData._id
              ? "Update Booking"
              : "Submit Booking"}
        </button>
      </div>
    </div>
  );
};

export default FareSection;
