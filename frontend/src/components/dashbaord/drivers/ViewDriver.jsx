import React from "react";
import IMAGES from "../../../assets/images";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import Icons from "../../../assets/icons";
import { downloadPDF } from "../../../constants/constantscomponents/pdfDownload";

const ViewDriver = ({ selectedDriver, setSelectedDriver }) => {
  const driver = selectedDriver?.driver.DriverData || {};
  const vehicle = selectedDriver?.driver.VehicleData || {};
  const uploads = selectedDriver?.driver.UploadedData || {};

  const formatDate = (dateString) =>
    dateString ? dateString.split("T")[0] : "N/A";

  const renderAvailability = () => {
    if (driver.availability?.length > 0) {
      return (
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <h4 style={{ fontWeight: "600" }}>Availability:</h4>
          <ul style={{ color: "#374151", fontSize: "0.875rem" }}>
            {driver.availability.map((slot, idx) => (
              <li key={idx} style={{ marginBottom: "0.25rem" }}>
                From: {new Date(slot.from).toLocaleDateString()} - To:
                {new Date(slot.to).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <p>
        <strong>Availability:</strong> N/A
      </p>
    );
  };

  const renderPreview = (fileUrl, label) => {
    if (!fileUrl) {
      return (
        <div className="w-40 h-28 flex items-center justify-center border-2 border-gray-300 bg-gray-100">
          <p className="text-sm text-gray-500">No file</p>
        </div>
      );
    }

    const isImage = /\.(jpeg|jpg|png|webp)$/i.test(fileUrl);
    const isPdf = /\.pdf$/i.test(fileUrl);

    return (
      <div className="flex flex-col items-center">
        {isImage ? (
          <img
            src={fileUrl}
            alt={label}
            className="w-40 h-28 object-cover border-2 border-gray-300"
          />
        ) : isPdf ? (
          <div
            rel="noopener noreferrer"
            className="w-40 h-28 flex items-center justify-center border-2 border-gray-300 bg-gray-100"
          >
            <Icons.FileText className="size-8 text-red-800" />
          </div>
        ) : (
          <div className="w-40 h-28 flex items-center justify-center border-2 border-gray-300 bg-gray-100">
            <p className="text-sm text-gray-500">Unsupported File</p>
          </div>
        )}
        <p className="mt-2 text-sm">{label}</p>
      </div>
    );
  };

  const renderUploadItem = (filePath, label) => {
    if (!filePath) {
      return renderPreview(null, label);
    }

    let actualFilePath = "";
    if (typeof filePath === "string") {
      actualFilePath = filePath;
    } else if (
      typeof filePath === "object" &&
      filePath !== null &&
      filePath.url
    ) {
      actualFilePath = filePath.url;
    }

    return renderPreview(actualFilePath, label);
  };

  return (
    <>
      <div>
        <div className="md:flex justify-between">
          <OutletHeading name="View Driver" />
          <div className="mb-3 flex items-center space-x-3 justify-center md:mb-0">
            <button
              className="btn btn-primary mb-2"
              onClick={() =>
                downloadPDF(
                  "driver-details-pdf",
                  `Driver-${driver.firstName}.pdf`
                )
              }
            >
              Download Driver Details
            </button>

            <button
              onClick={() => setSelectedDriver(null)}
              className="btn btn-primary mb-2"
            >
              ← Back to Driver List
            </button>
          </div>
        </div>

        <hr className="mb-4" />

        <div id="driver-details-pdf">
          <img
            src={uploads.driverPicture || IMAGES.dummyImg}
            alt="Driver"
            style={{
              width: "8rem",
              height: "8rem",
              borderRadius: "0.25rem",
              objectFit: "cover",
              border: "2px solid #d1d5db",
            }}
          />
          <div
            style={{
              fontSize: "14px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              color: "#2d3748",
              rowGap: "6px",
              columnGap: "20px",
              marginTop: "1.4rem",
            }}
          >
            <p>
              <strong>Status:</strong> {driver.status || "N/A"}
            </p>
            <p>
              <strong>Driver No.:</strong> {driver.employeeNumber || "N/A"}
            </p>
            <p>
              <strong>First Name:</strong> {driver.firstName || "N/A"}
            </p>
            <p>
              <strong>Sur Name:</strong> {driver.surName || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {driver.email || "N/A"}
            </p>
            <p>
              <strong>Contact:</strong> {driver.contact || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {driver.address || "N/A"}
            </p>
            <p>
              <strong>D.O.B.:</strong> {formatDate(driver.dateOfBirth)}
            </p>

            <div style={{ gridColumn: "span 2" }}>{renderAvailability()}</div>
          </div>

          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "bold",
              color: "#4a5568",
              marginBottom: "1rem",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "0.75rem",
              marginTop: "1rem",
            }}
          >
            Vehicle Details:
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1.5rem",
              marginBottom: "2.5rem",
            }}
          >
            <img
              src={uploads.carPicture || IMAGES.dummyImg}
              alt="Vehicle"
              // data-html2canvas-ignore="true"
              style={{
                width: "8rem",
                height: "8rem",
                objectFit: "cover",
                border: "2px solid #d1d5db",
              }}
            />

            <div
              style={{
                fontSize: "14px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                color: "#2d3748",
                rowGap: "6px",
                columnGap: "20px",
              }}
            >
              <p>
                <strong>Make:</strong> {vehicle.carMake || "N/A"}
              </p>
              <p>
                <strong>Model:</strong> {vehicle.carModal || "N/A"}
              </p>
              <p>
                <strong>Color:</strong> {vehicle.carColor || "N/A"}
              </p>
              <p>
                <strong>Reg. No.:</strong> {vehicle.carRegistration || "N/A"}
              </p>
              <p>
                <strong>Vehicle Insurance Expiry:</strong>
                {formatDate(vehicle.carInsuranceExpiry)}
              </p>
              <p>
                <strong>MOT Expiry:</strong> {formatDate(vehicle.motExpiryDate)}
              </p>
              <div
                style={{
                  gridColumn: "span 2",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center",
                }}
              >
                <strong>Vehicle Types:</strong>
                <span>
                  {vehicle.vehicleTypes?.length > 0
                    ? vehicle.vehicleTypes.join(", ")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "bold",
              color: "#4a5568",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "0.75rem",
            }}
          >
            License Details:
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              marginTop: "0.75rem",
              marginBottom: "1.5rem",
              gap: "1.5rem",
            }}
          >
            <div style={{ fontSize: "0.875rem", color: "#2d3748" }}>
              <p style={{ marginBottom: "0.25rem" }}>
                <strong>Driver License:</strong> {driver.driverLicense || "N/A"}
              </p>
              <p style={{ marginBottom: "0.25rem" }}>
                <strong>Driver License Expiry:</strong>
                {formatDate(driver.driverLicenseExpiry)}
              </p>
              <p style={{ marginBottom: "0.25rem" }}>
                <strong>Driver Private Hire License Expiry:</strong>
                {formatDate(driver.driverPrivateHireLicenseExpiry)}
              </p>
            </div>
            <div style={{ fontSize: "0.875rem", color: "#2d3748" }}>
              <p style={{ marginBottom: "0.25rem" }}>
                <strong>National Insurance:</strong>
                {driver.NationalInsurance || "N/A"}
              </p>
              <p style={{ marginBottom: "0.25rem" }}>
                <strong>Private Hire Card No:</strong>
                {driver.privateHireCardNo || "N/A"}
              </p>
              <p style={{ marginBottom: "0.25rem" }}>
                <strong>Vehicle Private Hire License:</strong>
                {vehicle.carPrivateHireLicense || "N/A"}
              </p>
              <p style={{ marginBottom: "0.25rem" }}>
                <strong>Vehicle Private Hire License Expiry:</strong>
                {formatDate(vehicle.carPrivateHireLicenseExpiry)}
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-lg mb-2 font-bold text-black border-b pb-1">
          Uploaded Documents:
        </h3>
        <div className="grid grid-cols-4 mt-4 grid-rows-2 space-y-4">
          {renderUploadItem(uploads.privateHireCard, "Private Hire Card")}
          {renderUploadItem(uploads.dvlaCard, "DVLA Card")}
          {renderUploadItem(
            uploads.privateHireCarPaper,
            "Private Hire Car Paper"
          )}
          {renderUploadItem(
            uploads.driverPrivateHirePaper,
            "Driver Private Hire Paper"
          )}
          {renderUploadItem(uploads.insurance, "Insurance")}
          {renderUploadItem(uploads.motExpiry, "MOT Expiry")}
          {renderUploadItem(uploads.V5, "V5")}
        </div>
      </div>
    </>
  );
};

export default ViewDriver;