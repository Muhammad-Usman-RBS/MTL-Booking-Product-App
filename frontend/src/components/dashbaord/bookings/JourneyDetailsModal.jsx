import React, { useState, useRef } from "react";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PDFContent from "./PDFContent";
import IMAGES from "../../../assets/images";

const JourneyDetailsModal = () => {
  const [email, setEmail] = useState("Vivianodonnell@gmail.com");
  const pdfRef = useRef();
  const downloadPDF = async () => {
    const input = document.getElementById("pdf-container");
    if (!input) return;

    // Show hidden container temporarily
    input.style.opacity = "1";
    input.style.position = "static";
    input.style.pointerEvents = "auto";

    // Wait for render
    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff", // solid white background
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save("booking-confirmation.pdf");

    // Hide again
    input.style.opacity = "0";
    input.style.position = "absolute";
    input.style.pointerEvents = "none";
  };
  return (
    <>
      <div className="max-w-5xl w-full mx-auto space-y-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <SelectOption options={["Booking Confirmation", "Booking Receipt"]} />
          <div className="flex items-center gap-2 w-full">
            <span className="text-sm text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-gray-300 px-2 py-1.5 rounded text-sm"
              placeholder="Enter email"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="btn btn-success text-sm px-4 py-1.5">
              Send
            </button>
            <button
              onClick={downloadPDF}
              className="border px-4 py-1.5 rounded text-gray-700 hover:bg-gray-100 text-sm w-full md:w-auto"
            >
              📥
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-md text-xs">
            <strong className="text-gray-700">Internal Notes:</strong>
            <span className="italic text-red-600">Empty</span>
          </div>
          <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-md text-xs">
            <strong className="text-gray-700">Driver Notes:</strong>
            <span className="italic text-red-600">Empty</span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5 text-xs text-gray-800">
          <div className="space-y-2.5">
            <div>
              <strong>Order No.:</strong> 2503287940
            </div>
            <div>
              <strong>Booked On:</strong> 28 Mar 2025 21:33
            </div>
            <div>
              <strong>Payment Reference:</strong> Payment Link
            </div>
            <div>
              <strong>Pick Up:</strong>
              <div className="ml-4 mt-1 space-y-1">
                <div>
                  <strong>Date & Time:</strong> 24 Jun 2025 08:00 (24 Hrs)
                </div>
                <div>
                  <strong>Address:</strong> Citadines Apart’hotel Holborn-Covent
                  Garden London, 94-99 High Holborn, London WC1V 6LF, UK
                </div>
                <div>
                  <strong>Door No.:</strong> —
                </div>
              </div>
              <hr className="text-gray-300 my-2" />
            </div>
            <div>
              <strong>Drop Off:</strong>
              <div className="ml-4 mt-1 space-y-1">
                <div>
                  <strong>Address:</strong> DoubleTree by Hilton
                  Stratford-upon-Avon, Arden St, Stratford-upon-Avon CV37 6QQ,
                  UK
                </div>
                <div>
                  <strong>Door No.:</strong> —
                </div>
              </div>
              <hr className="text-gray-300 my-2" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <strong>Passenger Details:</strong>
              <div className="ml-4 mt-1 space-y-1">
                <div>
                  <strong>Passenger Name:</strong> Vivian Donnell
                </div>
                <div>
                  <strong>Email Address:</strong> Vivianodonnell@gmail.com
                </div>
                <div>
                  <strong>Contact Number:</strong> +13059348070
                </div>
              </div>
              <hr className="text-gray-300 my-2" />
            </div>
            <div>
              <strong>Vehicle Details:</strong>
              <div className="ml-4 mt-1 space-y-1">
                <div>
                  <strong>Vehicle:</strong> 8 Passenger MPV
                </div>
                <div>
                  <strong>Passengers:</strong> 7
                </div>
                <div>
                  <strong>Small Luggage:</strong> 6
                </div>
                <div>
                  <strong>Large Luggage:</strong> 6
                </div>
              </div>
              <hr className="text-gray-300 my-2" />
            </div>
            <div>
              <strong>Special Notes:</strong>
              <div className="ml-4 mt-1 italic text-gray-500">None</div>
              <hr className="text-gray-300 my-2" />
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="btn btn-primary text-sm px-5 py-1.5">
            Fare: <span className="text-base">400 GBP</span>
            <span className="text-xs ml-1">Card Payment</span>
          </div>
          <div className="text-gray-600 mt-2 text-xs">
            Approx. Distance: 105.49 Miles
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-100 border-t border-gray-300 p-3 rounded-md">
          <span className="text-gray-700 font-medium text-sm">
            This booking has been
            <span className="text-green-600 font-semibold">Approved</span>
          </span>
          <button className="btn btn-edit text-sm px-5 py-1.5">REJECT</button>
        </div>
      </div>

      <PDFContent ref={pdfRef} logoUrl={IMAGES.dashboardLargeLogo} />
    </>
  );
};

export default JourneyDetailsModal;
