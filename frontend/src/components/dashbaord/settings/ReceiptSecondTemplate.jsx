import React, { useState, useRef } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import IMAGES from "../../../assets/images";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ReceiptSecondTemplate = () => {
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

        {/* Preview Section */}
        <div style={{ flex: 1 }}>
          <div
            ref={previewRef}
            style={{
              position: "relative",
              backgroundColor: "#0f1115",
              color: "white",
              width: "100%",
              maxWidth: "1024px",
              height: "600px",
              //   borderRadius: "20px",
              border: "4px solid #f3f4f6",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              overflow: "hidden",
              padding: "40px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {/* Decorative Gold Lines */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                borderTop: "80px solid #f3f4f6",
                borderRight: "80px solid transparent",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 0,
                height: 0,
                borderTop: "80px solid #f3f4f6",
                borderLeft: "80px solid transparent",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: 0,
                height: 0,
                borderBottom: "80px solid #f3f4f6",
                borderRight: "80px solid transparent",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 0,
                height: 0,
                borderBottom: "80px solid #f3f4f6",
                borderLeft: "80px solid transparent",
              }}
            ></div>

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
            <p
              style={{
                fontSize: "16px",
                fontStyle: "italic",
                marginTop: "10px",
              }}
            >
              {companyAddress}
            </p>
            <p style={{ fontSize: "16px", fontStyle: "italic" }}>
              {contactNumber}
            </p>
            <p
              style={{
                fontSize: "16px",
                fontStyle: "italic",
                marginBottom: "20px",
              }}
            >
              {companyEmail}
            </p>

            <p
              style={{
                backgroundColor: "#f3f4f6",
                color: "black",
                padding: "6px 24px",
                borderRadius: "9999px",
                textTransform: "uppercase",
                fontWeight: "600",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              {companyName}
            </p>

            <h1
              style={{
                color: "#f3f4f6",
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              {passengerName}
            </h1>

            <p
              style={{ maxWidth: "600px", fontSize: "24px", color: "#d1d5db" }}
            >
              Thank you for travelling with {companyName}, {passengerName}!
            </p>

            <p
              style={{
                maxWidth: "600px",
                fontSize: "14px",
                color: "#d1d5db",
                marginBottom: "32px",
              }}
            >
              We hope you enjoyed your trip.
            </p>

            <p
              style={{
                backgroundColor: "#f3f4f6",
                color: "black",
                padding: "8px 32px",
                borderRadius: "10px",
                fontSize: "12px",
              }}
            >
              Total {totalAmount}
            </p>

            <p
              style={{
                maxWidth: "600px",
                fontSize: "14px",
                color: "#d1d5db",
                marginTop: "24px",
              }}
            >
              Thank you for riding with us! Feel free to reach back to pre-book
              your next ride. If you have any issues with the service you
              received, please let us know via contact us.
            </p>
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

export default ReceiptSecondTemplate;
