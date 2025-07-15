


import React from "react";

const FareSection = ({
  fareDetails,
  setFareDetails,
  emailNotify,
  setEmailNotify,
}) => {
  const handleFareChange = (key, value) => {
    setFareDetails((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (group, key) => {
    setFareDetails((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: !prev[group][key],
      },
    }));
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-[#0f192d] px-6 py-3">
        <h2 className="text-xl font-bold text-gray-50">Fare&nbsp;Details:-</h2>
      </div>
      <div className="p-6 space-y-6">
        {fareDetails.paymentMethod === "Card" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Card Payment Reference"
              className="custom_input"
              value={fareDetails.cardPaymentReference}
              onChange={(e) =>
                handleFareChange("cardPaymentReference", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Payment Gateway"
              className="custom_input"
              value={fareDetails.paymentGateway}
              onChange={(e) =>
                handleFareChange("paymentGateway", e.target.value)
              }
            />
          </div>
        )}

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
                checked={fareDetails.paymentMethod === method}
                onChange={(e) =>
                  handleFareChange("paymentMethod", e.target.value)
                }
              />
              {method}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          {[
            { key: "journeyFare", label: "Journey Fare" },
            { key: "driverFare", label: "Driver Fare" },
            { key: "returnJourneyFare", label: "Return Journey Fare" },
            { key: "returnDriverFare", label: "Return Driver Fare" },
          ].map((item) => (
            <div
              key={item.key}
              className="bg-gray-100 border border-gray-300 rounded px-4 py-3"
            >
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                {item.label}
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  className="custom_input"
                  value={fareDetails[item.key]}
                  onChange={(e) =>
                    handleFareChange(item.key, parseFloat(e.target.value) || 0)
                  }
                />
                <span className="bg-gray-200 border border-gray-300 px-3 py-1 rounded-r text-gray-700 font-medium">
                  GBP
                </span>
              </div>
            </div>
          ))}
        </div>

        <hr className="mb-7 mt-2 border-gray-300" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          {/* Email Notifications */}
          <div className="bg-gray-100 border border-gray-300 rounded-xl px-6 py-5 shadow-md">
            <h4 className="text-lg font-semibold text-blue-800 mb-3 border-b pb-1">
              Email
            </h4>
            <div className="space-y-3 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={fareDetails.emailNotifications.admin}
                  onChange={() =>
                    handleCheckboxChange("emailNotifications", "admin")
                  }
                />
                <span>Admin</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={fareDetails.emailNotifications.customer}
                  onChange={() =>
                    handleCheckboxChange("emailNotifications", "customer")
                  }
                />
                <span>Customer</span>
              </label>
            </div>
          </div>

          {/* App Notifications */}
          <div className="bg-gray-100 border border-gray-300 rounded-xl px-6 py-5 shadow-md">
            <h4 className="text-lg font-semibold text-teal-800 mb-3 border-b pb-1">
              Notification
            </h4>
            <div className="space-y-3 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-teal-600"
                  checked={fareDetails.appNotifications.customer}
                  onChange={() =>
                    handleCheckboxChange("appNotifications", "customer")
                  }
                />
                <span>Customer</span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FareSection;