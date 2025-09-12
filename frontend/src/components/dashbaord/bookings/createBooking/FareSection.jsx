import React from "react";
import { useSelector } from "react-redux";

const FareSection = ({
  fareDetails,
  setFareDetails,
  returnJourneyToggle,
  onFareManuallyEdited,
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
    <>
      <h5 className="font-bold text-[var(--dark-gray)] mb-3">Choose your payment method:</h5>
      <div className="space-y-6">
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
      </div>
    </>
  );
};

export default FareSection;
