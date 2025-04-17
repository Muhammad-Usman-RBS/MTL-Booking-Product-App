import React, { useState, useRef } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import IMAGES from "../../../assets/images";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ReceiptFirstTemplate = () => {
  const [companyName, setCompanyName] = useState("Mega Transfers Limited");
  const [companyAddress, setCompanyAddress] = useState("123 Main Street, City");
  const [contactNumber, setContactNumber] = useState("+123456789");
  const [companyEmail, setCompanyEmail] = useState("info@mega.com");
  const [passengerName, setPassengerName] = useState("John Doe");
  const [totalAmount, setTotalAmount] = useState("$90");
  const [logoFile, setLogoFile] = useState(null);
  const previewRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setLogoFile(URL.createObjectURL(file));
  };

  return (
    <>
      <div className="p-6 flex flex-col lg:flex-row gap-6 justify-center">
        {/* Left Panel: Input Form */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 w-full lg:max-w-md">
          <OutletHeading name="Edit Proposal" />
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Company Address
              </label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Contact Number
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Company Email
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Passenger Name
              </label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Total Amount
              </label>
              <input
                type="text"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 pb-1">
                Upload Logo
              </label>
              <label htmlFor="profile-upload" className="btn btn-reset">
                Choose File
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Right Panel: Preview Certificate Style */}
        <div>
          <div
            ref={previewRef}
            style={{
              position: "relative",
              backgroundColor: "#003366",
              color: "white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              width: "100%",
              maxWidth: "768px",
              overflow: "hidden",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {/* Top Section */}
            <div
              style={{
                padding: "32px",
                borderBottom: "1px solid white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      marginBottom: "8px",
                    }}
                  >
                    {companyName}
                  </div>
                  <div style={{ fontSize: "14px" }}>{companyAddress}</div>
                  <div style={{ fontSize: "14px" }}>{contactNumber}</div>
                  <div style={{ fontSize: "14px" }}>{companyEmail}</div>
                </div>
                <img
                  src={logoFile || IMAGES.dashboardSmallLogo}
                  alt="Logo"
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    padding: "4px",
                  }}
                />
              </div>
            </div>

            {/* Middle Message */}
            <div
              style={{
                padding: "32px",
                borderBottom: "1px solid white",
              }}
            >
              <p style={{ fontSize: "18px", marginBottom: "8px" }}>
                Thank you for travelling with {companyName}, {passengerName}!
              </p>
              <p style={{ fontSize: "14px", marginTop: "4px" }}>
                We hope you enjoyed your trip.
              </p>
            </div>

            {/* Summary Section */}
            <div
              style={{
                backgroundColor: "white",
                color: "black",
                padding: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "20px",
                  fontWeight: "bold",
                  borderBottom: "2px solid #ccc",
                  paddingBottom: "8px",
                  marginBottom: "16px",
                }}
              >
                <span>Total</span>
                <span>{totalAmount}</span>
              </div>

              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                JOURNEY SUMMARY
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#555",
                  marginBottom: "16px",
                }}
              >
                Thank you for riding with us! Feel free to reach back to
                pre-book your next ride. If you have any issues with the service
                you received, please let us know via contact us.
              </p>
              <p
                style={{ fontSize: "12px", fontStyle: "italic", color: "#999" }}
              >
                This is not a tax invoice.
              </p>
            </div>

            {/* Footer */}
            <div
              style={{
                width: "100%",
                height: "96px",
                backgroundColor: "#003366",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  color: "white",
                  fontWeight: "600",
                  fontSize: "18px",
                  letterSpacing: "1px",
                }}
              >
                Thank you for choosing {companyName}!
              </p>
            </div>
          </div>
          <div className="text-end mt-4">
            <button
              onClick={async (e) => {
                e.preventDefault();
                const input = previewRef.current;

                if (!input) return;

                try {
                  const canvas = await html2canvas(input, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: null,
                  });

                  const imgData = canvas.toDataURL("image/png");

                  const pdf = new jsPDF("landscape", "mm", "a4");
                  const pdfWidth = pdf.internal.pageSize.getWidth();
                  const pdfHeight = pdf.internal.pageSize.getHeight();

                  const imgWidth = pdfWidth;
                  const imgHeight = (canvas.height * imgWidth) / canvas.width;

                  const finalHeight =
                    imgHeight > pdfHeight ? pdfHeight : imgHeight;
                  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, finalHeight);

                  pdf.save("Receipt Download.pdf");
                } catch (error) {
                  console.error("PDF download failed:", error);
                }
              }}
              className="btn btn-success"
            >
              Download Receipt as PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiptFirstTemplate;
