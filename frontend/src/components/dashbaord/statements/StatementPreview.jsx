import React from "react";

const StatementPreview = ({ data, onBack }) => {
  return (
    <div className="p-4">
      <button className="btn btn-primary" onClick={onBack}>
        ← Back
      </button>

      {data.map((item, index) => (
        <div
          key={index}
          className="border p-4 mb-6 mt-4 shadow-md bg-white rounded text-sm"
        >
          <div className="font-bold text-lg">Mega Transfers Limited</div>
          <div className="text-xs mb-2">
            1st Floor, 29 Minerva Road, London, England, NW10 6HJ <br />
            VAT Number - 442612419
          </div>

          <div className="flex justify-between font-medium mb-2">
            <div>{item.driver}</div>
            <div>
              <span className="font-semibold">Period:</span> {item.period.from}
              to {item.period.to}
            </div>
          </div>

          <table className="w-full text-left border mt-3 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">✓</th>
                <th className="border px-2 py-1">Order No.</th>
                <th className="border px-2 py-1">Date & Time</th>
                <th className="border px-2 py-1">Payment</th>
                <th className="border px-2 py-1">Cash</th>
                <th className="border px-2 py-1">Fare</th>
              </tr>
            </thead>
            <tbody>
              {item.bookings.length > 0 ? (
                item.bookings.map((b, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">✓</td>
                    <td className="border px-2 py-1">{b.orderNo}</td>
                    <td className="border px-2 py-1">{b.dateTime}</td>
                    <td className="border px-2 py-1">{b.payment}</td>
                    <td className="border px-2 py-1">{b.cash}</td>
                    <td className="border px-2 py-1">{b.fare}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-2 border">
                    No bookings for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-3 space-y-1 text-sm font-medium">
            <div>Total Jobs: {item.bookings.length}</div>
            <div>Total Cash Collected: {item.cashCollected} GBP</div>
            <div>Total Driver Fare: {item.fare} GBP</div>
            <div>Previous Due: {item.previousDue} GBP</div>
            <div>Payment: {item.payment} GBP</div>
            <div className="font-bold text-base">Due: {item.due} GBP</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatementPreview;
