import React from "react";
import IMAGES from "../../../assets/images";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import Icons from "../../../assets/icons";
import { downloadPDF } from "../../../constants/constantscomponents/pdfDownload";
import OutletBtnHeading from "../../../constants/constantscomponents/OutletBtnHeading";

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
        <strong>Availability:  </strong>
        <span style={{ color: "#6B7280", fontStyle: "italic" }}>
          Not Added Yet
        </span>
      </p>
    );
  };

  const renderPreview = (fileUrl, label, fileName = "") => {
    if (!fileUrl) {
      return (
        <div className="flex flex-col items-center">
          <div className="w-40 h-28 flex items-center justify-center border-2 border-[var(--light-gray)] bg-gray-100">
            <p className="text-sm text-gray-500">No file</p>
          </div>
          <p className="mt-2 text-sm font-medium">{label}</p>
        </div>
      );
    }

    const isImage = /\.(jpeg|jpg|png|webp)$/i.test(fileUrl);
    const isPdf = /\.pdf$/i.test(fileUrl);

    return (
      <div >
        {isImage ? (
          <img
            src={fileUrl}
            alt={label}
            className="w-40 h-28 object-cover border-2 border-[var(--light-gray)]"
          />
        ) : (
          isPdf && (
            <div className="w-40 h-28 flex flex-col items-center justify-center border-2 border-[var(--light-gray)] bg-gray-100">
              <Icons.FileText className="size-8 text-red-800" />
              {fileName && (
                <p className="text-xs text-gray-500 mt-3 px-2 text-center break-words w-full">
                  {fileName}
                </p>
              )}
            </div>
          )
        )}
        <p className="mt-2 text-sm font-medium">{label}</p>
      </div>
    );
  };

  const renderUploadItem = (filePath, label) => {
    if (!filePath) {
      return renderPreview(null, label);
    }

    let actualFilePath = "";
    let fileName = "";

    if (typeof filePath === "string") {
      actualFilePath = filePath;
      fileName = filePath.split("/").pop();
    } else if (typeof filePath === "object" && filePath !== null) {
      actualFilePath = filePath.url || "";
      fileName =
        filePath.original_filename ||
        filePath.name ||
        filePath.url?.split("/").pop();
    }

    return renderPreview(actualFilePath, label, fileName);
  };
  return (
    <>
      <OutletBtnHeading
        name="View Driver"
        buttonLabel="← Back to Drivers"
        buttonBg="btn btn-primary"
        onButtonClick={() => setSelectedDriver(null)}
      />

      <div className="flex justify-end mb-6">
        <button
          className="btn btn-reset mb-2"
          onClick={() =>
            downloadPDF(
              "driver-details-pdf",
              `Driver-${driver.firstName}.pdf`
            )
          }
        >
          Download Driver Details
        </button>
      </div>
      <div id="driver-details-pdf" >
        <div style={{ fontFamily: "Arial, sans-serif", color: "#2d3748" }}>
          {/* Driver Profile */}
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
                  {renderAvailability()}
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
                <p><strong>Insurance Expiry:</strong> {formatDate(vehicle.carInsuranceExpiry)}</p>
                <p><strong>MOT Expiry:</strong> {formatDate(vehicle.motExpiryDate)}</p>
                <div style={{ gridColumn: "span 2" }}>
                  <strong>Vehicle Types:</strong>{" "}
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
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px 20px",
                fontSize: "14px",
              }}
            >
              <div>
                <p><strong>Driver License:</strong> {driver.driverLicense || "N/A"}</p>
                <p><strong>License Expiry:</strong> {formatDate(driver.driverLicenseExpiry)}</p>
                <p><strong>Private Hire License Expiry:</strong> {formatDate(driver.driverPrivateHireLicenseExpiry)}</p>
                <p><strong>Vehicle Hire License Expiry:</strong> {formatDate(vehicle.carPrivateHireLicenseExpiry)}</p>
              </div>
              <div>
                <p><strong>National Insurance:</strong> {driver.NationalInsurance || "N/A"}</p>
                <p><strong>Private Hire Card No.:</strong> {driver.privateHireCardNo || "N/A"}</p>
                <p><strong>Vehicle Hire License:</strong> {vehicle.carPrivateHireLicense || "N/A"}</p>
              </div>
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
          Uploaded Documents:
        </h3>

        <div className="grid grid-cols-4 gap-y-6 mt-4">
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