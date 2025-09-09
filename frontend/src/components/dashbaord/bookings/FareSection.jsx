import React from "react";
import { useSelector } from "react-redux";

const FareSection = ({
  fareDetails,
  setFareDetails,
  returnJourneyToggle,
  calculatedJourneyFare,   // still accepted but not shown as a hint
  calculatedReturnFare,    // still accepted but not shown as a hint
  onFareManuallyEdited,    // keep so parent can stop auto-sync on manual edits
}) => {
  const { currency } = useSelector((state) => state.currency);

  const handleFareChange = (key, value) => {
    if (key === "journeyFare") onFareManuallyEdited?.("journey");
    if (key === "returnJourneyFare") onFareManuallyEdited?.("return");

    const next =
      value === "" || value === null || Number.isNaN(Number(value))
        ? ""
        : Number(value);

    setFareDetails((prev) => ({ ...prev, [key]: next }));
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

  const fareFields = [
    { key: "journeyFare", label: "Journey Fare" },
    { key: "driverFare", label: "Driver Fare" },
    ...(returnJourneyToggle
      ? [
          { key: "returnJourneyFare", label: "Return Journey Fare" },
          { key: "returnDriverFare", label: "Return Driver Fare" },
        ]
      : []),
  ];

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden h-full">
      <div className="bg-[#0f192d] px-6 py-3">
        <h2 className="text-xl font-bold text-gray-50">Fare&nbsp;Details:-</h2>
      </div>

      <div className="p-6 space-y-6">
        {fareDetails.paymentMethod === "Card, Bank" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Card Payment Reference"
              className="custom_input"
              value={fareDetails.cardPaymentReference}
              onChange={(e) =>
                setFareDetails((prev) => ({
                  ...prev,
                  cardPaymentReference: e.target.value,
                }))
              }
            />
            <input
              type="text"
              placeholder="Payment Gateway"
              className="custom_input"
              value={fareDetails.paymentGateway}
              onChange={(e) =>
                setFareDetails((prev) => ({
                  ...prev,
                  paymentGateway: e.target.value,
                }))
              }
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          {["Cash", "Card, Bank", "Payment Link", "Invoice", "Paypal"].map(
            (method) => (
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
                    setFareDetails((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                />
                {method}
              </label>
            )
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          {fareFields.map(({ key, label }) => (
            <div
              key={key}
              className="bg-gray-100 border border-[var(--light-gray)] rounded px-4 py-3"
            >
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                {label}
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  step="0.01"
                  className="custom_input"
                  value={fareDetails[key] ?? ""}

                  placeholder="0"
                  onChange={(e) =>
                    handleFareChange(key, e.target.value.trim())
                  }
                />
                <span className="bg-gray-200 border border-[var(--light-gray)] px-3 py-1 rounded-r text-gray-700 font-medium">
                  {currency}
                </span>
              </div>
            </div>
          ))}
        </div>

        <hr className="mb-7 mt-2 border-[var(--light-gray)]" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          {/* Email Notifications */}
          <div className="bg-gray-100 border border-[var(--light-gray)] rounded-xl px-6 py-5 shadow-md">
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
          <div className="bg-gray-100 border border-[var(--light-gray)] rounded-xl px-6 py-5 shadow-md">
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
