import React from "react";
import { useSelector } from "react-redux";

const FareSection = ({
  fareDetails,
  setFareDetails,
  returnJourneyToggle,
  onFareManuallyEdited,
  userRole,
  vatnumber,
  isFetching,
  error,
  customerByVat,
  editBookingData,
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

  const isEditMode = !!editBookingData?._id;

  let fareFields = [];
  
  if (isEditMode && returnJourneyToggle) {
    fareFields = [
      { key: "returnJourneyFare", label: "Return Journey Fare" },
      { key: "returnDriverFare", label: "Return Driver Fare" },
    ];
  } else {
    fareFields = [
      { key: "journeyFare", label: "Journey Fare" },
      { key: "driverFare", label: "Driver Fare" },
      ...(returnJourneyToggle
        ? [
            { key: "returnJourneyFare", label: "Return Journey Fare" },
            { key: "returnDriverFare", label: "Return Driver Fare" },
          ]
        : []),
    ];
  }

  const isCustomerWithVat = userRole === "customer" && vatnumber;

  return (
    <>
      {/* Hide payment method section if Billing Details is shown */}
      {!isCustomerWithVat && (
        <>
          <h5 className="font-bold text-[var(--dark-gray)] mb-3">
            Choose your payment method:
          </h5>

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

            {/* Fare Inputs (always visible) */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
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
                      onChange={(e) => handleFareChange(key, e.target.value.trim())}
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
      )}

      {/* Billing Details OR Vehicle Selection */}
      <div className="mt-6">
        {isCustomerWithVat && (
          <div className="bg-white shadow-lg rounded-2xl border border-gray-200 h-full flex flex-col">
            {/* Header */}
            <div className="bg-[#0f192d] px-6 py-3 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-50">Billing Details</h2>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-4 flex-grow">
              <p className="font-semibold text-gray-700">
                This is a customer account.
              </p>

              {isFetching && (
                <p className="text-blue-600 font-medium animate-pulse">Loading…</p>
              )}

              {error && (
                <p
                  className="text-red-600 font-semibold bg-red-100 p-3 rounded-md shadow-sm"
                  role="alert"
                >
                  Failed to load customer data.
                </p>
              )}

              {!isFetching && !error && (
                <>
                  {customerByVat ? (
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-4 shadow-inner">
                      <p className="text-gray-800 font-medium">
                        <span className="font-semibold">Payment Options Invoice:</span>
                        &nbsp;{customerByVat?.paymentOptionsInvoice || "—"}
                      </p>
                    </div>
                  ) : (
                    <p
                      className="text-amber-700 font-medium mt-2"
                      role="alert"
                    >
                      VAT match not found. Please check the VAT number for typos or spacing.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default FareSection;
