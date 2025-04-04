import React, { useState } from "react";

const FareSection = () => {
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [emailNotify, setEmailNotify] = useState({
    admin: false,
    customer: false,
  });
  const [notification, setNotification] = useState({ customer: false });

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow rounded-md mt-6 space-y-6">
      {/* Conditionally Visible Inputs */}
      {paymentMethod === "Card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Card Payment Reference"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Payment Gateway"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:ring-blue-500"
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
          { label: "Journey Fare", bg: "from-pink-100 to-pink-200" },
          { label: "Driver Fare", bg: "from-yellow-100 to-yellow-200" },
          { label: "Return Journey Fare", bg: "from-green-100 to-green-200" },
          { label: "Return Driver Fare", bg: "from-blue-100 to-blue-200" },
        ].map((item, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${item.bg} border rounded px-4 py-3`}
          >
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              {item.label}
            </label>
            <div className="flex items-center">
              <input
                type="number"
                defaultValue={0}
                className="w-full px-3 py-2 border border-gray-800 rounded-l focus:outline-none focus:ring focus:ring-blue-500"
              />
              <span className="bg-gray-200 border border-gray-800 px-3 py-2 rounded-r text-gray-700 font-medium">
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
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl px-6 py-5 shadow-md w-[250px]">
          <h4 className="text-lg font-semibold text-purple-800 mb-3 border-b pb-1">
            Email
          </h4>
          <div className="space-y-3 text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-purple-600"
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
                className="accent-purple-600"
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
        <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl px-6 py-5 shadow-md w-[250px]">
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
        <button className="btn btn-success font-semibold px-6 py-2 rounded-md shadow transition">
          Book
        </button>
      </div>
    </div>
  );
};

export default FareSection;
