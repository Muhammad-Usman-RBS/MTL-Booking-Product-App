import React from "react";
import IMAGES from "../../../assets/images";
import html2pdf from "html2pdf.js";

const DriverPDFTemplate = ({ driver, vehicle, uploads, formatDate,formatDateWithStatus }) => {
  const handleDownloadPDF = async () => {
    const element = document.getElementById("driver-details-pdf");
    if (!element) return;

    const prevDisplay = element.style.display;
    element.style.display = "block";

    await html2pdf()
      .set({
        margin: 0.5,
        filename: `Driver-${driver.firstName || "Unknown"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();

    element.style.display = prevDisplay || "none";
  };

  const renderAvailabilityPDF = () => {
    if (driver.availability?.length > 0) {
      return (
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <h4 style={{ fontWeight: "600" }}>Availability:</h4>
          <ul style={{ color: "#374151", fontSize: "0.875rem" }}>
            {driver.availability.map((slot, idx) => (
              <li key={idx} style={{ marginBottom: "0.25rem" }}>
                From: {new Date(slot.from).toLocaleDateString()} - To:&nbsp;
                {new Date(slot.to).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <p>
        <strong>Availability: </strong>
        <span style={{ color: "#6B7280", fontStyle: "italic" }}>
          Not Added Yet
        </span>
      </p>
    );
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <button className="btn btn-edit mb-2" onClick={handleDownloadPDF}>
          Download Driver Details
        </button>
      </div>

      {/* Hidden PDF Template */}
      <div id="driver-details-pdf" style={{ display: "none" }}>
        <div style={{ fontFamily: "Arial, sans-serif", color: "#2d3748" }}>
          {/* Driver Profile Details */}
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "30px",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#2b6cb0",
                borderBottom: "2px solid #edf2f7",
                paddingBottom: "8px",
                marginBottom: "20px",
              }}
            >
              Driver Profile Details
            </h3>

            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <img
                src={uploads.driverPicture || IMAGES.dummyImg}
                alt="Driver"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "6px",
                  objectFit: "cover",
                  border: "2px solid #cbd5e0",
                }}
              />
              <div
                style={{
                  fontSize: "14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  rowGap: "8px",
                  columnGap: "20px",
                  flex: 1,
                }}
              >
                <p><strong>Status:</strong> {driver.status || "N/A"}</p>
                <p><strong>Driver No.:</strong> {driver.employeeNumber || "N/A"}</p>
                <p><strong>First Name:</strong> {driver.firstName || "N/A"}</p>
                <p><strong>Sur Name:</strong> {driver.surName || "N/A"}</p>
                <p><strong>Email:</strong> {driver.email || "N/A"}</p>
                <p><strong>Contact:</strong> {driver.contact || "N/A"}</p>
                <p><strong>Address:</strong> {driver.address || "N/A"}</p>
                <p><strong>D.O.B.:</strong> {formatDate(driver.dateOfBirth)}</p>
                <div style={{ gridColumn: "span 2", marginTop: "10px" }}>
                  {renderAvailabilityPDF()}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "30px",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#2b6cb0",
                borderBottom: "2px solid #edf2f7",
                paddingBottom: "8px",
                marginBottom: "20px",
              }}
            >
              Vehicle Details
            </h3>

            <div style={{ display: "flex", gap: "20px" }}>
              <img
                src={uploads.carPicture || IMAGES.dummyImg}
                alt="Vehicle"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  border: "2px solid #cbd5e0",
                }}
              />
              <div
                style={{
                  fontSize: "14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  rowGap: "8px",
                  columnGap: "20px",
                  flex: 1,
                }}
              >
                <p><strong>Make:</strong> {vehicle.carMake || "N/A"}</p>
                <p><strong>Model:</strong> {vehicle.carModal || "N/A"}</p>
                <p><strong>Color:</strong> {vehicle.carColor || "N/A"}</p>
                <p><strong>Reg. No.:</strong> {vehicle.carRegistration || "N/A"}</p>
                <p><strong>Insurance Expiry:</strong> {formatDateWithStatus(vehicle.carInsuranceExpiry)}</p>
                <p><strong>MOT Expiry:</strong> {formatDateWithStatus(vehicle.carInsuranceExpiry)}</p>
                <div style={{ gridColumn: "span 2" }}>
                  <strong>Vehicle Types:</strong>&nbsp;
                  {vehicle.vehicleTypes?.length > 0 ? vehicle.vehicleTypes.join(", ") : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* License Details */}
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "30px",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#2b6cb0",
                borderBottom: "2px solid #edf2f7",
                paddingBottom: "8px",
                marginBottom: "20px",
              }}
            >
              License Details
            </h3>

            <div
              style={{
                fontSize: "14px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                rowGap: "8px",
                columnGap: "20px",
              }}
            >
              <p><strong>Driver License:</strong> {driver.driverLicense || "N/A"}</p>
              <p><strong>License Expiry:</strong> {formatDateWithStatus(driver.driverLicenseExpiry)}</p>
              <p><strong>Private Hire License Expiry:</strong>{formatDateWithStatus(driver.driverPrivateHireLicenseExpiry)}</p>
              <p><strong>Vehicle Hire License Expiry:</strong> {formatDateWithStatus(vehicle.carPrivateHireLicenseExpiry)}</p>
              <p><strong>National Insurance:</strong> {driver.NationalInsurance || "N/A"}</p>
              <p><strong>Private Hire Card No.:</strong> {driver.privateHireCardNo || "N/A"}</p>
              <p><strong>Vehicle Hire License:</strong> {vehicle.carPrivateHireLicense || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DriverPDFTemplate;
