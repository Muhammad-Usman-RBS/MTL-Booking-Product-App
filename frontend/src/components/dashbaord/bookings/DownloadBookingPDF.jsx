import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Icons from "../../../assets/icons";

const DownloadBookingPDF = ({ data, filename = "Bookings-Report" }) => {
  const downloadPDF = () => {
    const doc = new jsPDF();
    const headers = [
      [
        "Order No.",
        "Passenger",
        "Date & Time",
        "Pick Up",
        "Drop Off",
        "Vehicle",
        "Payment",
        "Driver",
        "Fare",
        "DR Fare",
      ],
    ];

    const rows = data.map((row) => [
      row.orderNo,
      row.passenger,
      row.date,
      row.pickUp,
      row.dropOff,
      row.vehicle,
      row.payment,
      row.driver,
      row.fare,
      row.drFare,
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 20,
      margin: { top: 10, left: 10, right: 10 },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        halign: "center",
      },
      bodyStyles: { halign: "left" },
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <button
      onClick={downloadPDF}
      className="bg-[var(--dark-gray)] text-white p-2 rounded"
    >
      <Icons.Download size={16} />
    </button>
  );
};

export default DownloadBookingPDF;
