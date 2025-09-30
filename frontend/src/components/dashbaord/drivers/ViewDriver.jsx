import React from "react";
import IMAGES from "../../../assets/images";
import OutletBtnHeading from "../../../constants/constantscomponents/OutletBtnHeading";
import RenderDocuments from "./RendorDocument";
import DriverPDFTemplate from "./DriverPDFTemplate";

const ViewDriver = ({ selectedDriver, setSelectedDriver }) => {
  const driver = selectedDriver?.driver.DriverData || {};
  const vehicle = selectedDriver?.driver.VehicleData || {};
  const uploads = selectedDriver?.driver.UploadedData || {};

  const formatDate = (dateString) =>
    dateString ? dateString.split("T")[0] : "N/A";
  const isExpired = (dateString) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiryDate < today;
  };

  const formatDateWithStatus = (dateString) => {
    const formattedDate = formatDate(dateString);
    if (formattedDate === "N/A") return formattedDate;

    if (isExpired(dateString)) {
      return (
        <>
          {formattedDate}
          <span
            style={{
              color: "red",
              fontSize: "12px",
              fontWeight: "bold",
              marginLeft: "8px",
            }}
          >
            (EXPIRED)
          </span>
        </>
      );
    }
    return formattedDate;
  };
  return (
    <>
      <OutletBtnHeading
        name="View Driver"
        buttonLabel="← Back to Drivers"
        buttonBg="btn btn-back"
        onButtonClick={() => setSelectedDriver(null)}
      />

      {/* PDF Download & Template */}
      <DriverPDFTemplate
        driver={driver}
        vehicle={vehicle}
        formatDateWithStatus={formatDateWithStatus}
        uploads={uploads}
        formatDate={formatDate}
      />

      {/* Responsive Display with Tailwind */}
      <div className="space-y-6">
        {/* Driver Profile Details */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-[#2b6cb0] border-b-2 border-gray-200 pb-2 mb-5">
            Driver Profile Details
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
            <img
              src={uploads.driverPicture || IMAGES.dummyImg}
              alt="Driver"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border-2 border-gray-300 mx-auto sm:mx-0"
            />
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 gap-y-2 text-sm">
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[100px]">
                    Status:
                  </span>
                  <span className="text-gray-600 break-words">
                    {driver.status || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[100px]">
                    Driver No.:
                  </span>
                  <span className="text-gray-600 break-words">
                    {driver.employeeNumber || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[100px]">
                    First Name:
                  </span>
                  <span className="text-gray-600 break-words">
                    {driver.firstName || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[100px]">
                    Sur Name:
                  </span>
                  <span className="text-gray-600 break-words">
                    {driver.surName || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[100px]">
                    Email:
                  </span>
                  <span className="text-gray-600 break-words">
                    {driver.email || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[100px]">
                    Contact:
                  </span>
                  <span className="text-gray-600 break-words">
                    {driver.contact || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:col-span-2">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[100px]">
                    Address:
                  </span>
                  <span className="text-gray-600 break-words">
                    {driver.address || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[100px]">
                    D.O.B.:
                  </span>
                  <span className="text-gray-600">
                    {formatDate(driver.dateOfBirth)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-[#2b6cb0] border-b-2 border-gray-200 pb-2 mb-5">
            Vehicle Details
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <img
              src={uploads.carPicture || IMAGES.dummyImg}
              alt="Vehicle"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border-2 border-gray-300 mx-auto sm:mx-0"
            />
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 gap-y-2 text-sm">
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[80px]">
                    Make:
                  </span>
                  <span className="text-gray-600 break-words">
                    {vehicle.carMake || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[80px]">
                    Model:
                  </span>
                  <span className="text-gray-600 break-words">
                    {vehicle.carModal || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[80px]">
                    Color:
                  </span>
                  <span className="text-gray-600 break-words">
                    {vehicle.carColor || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[80px]">
                    Reg. No.:
                  </span>
                  <span className="text-gray-600 break-words">
                    {vehicle.carRegistration || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[120px]">
                    Insurance Expiry:
                  </span>
                  <span className="text-gray-600">
                    {formatDateWithStatus(vehicle.carInsuranceExpiry)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[100px]">
                    MOT Expiry:
                  </span>
                  <span className="text-gray-600">
                    {formatDateWithStatus(vehicle.motExpiryDate)}
                  </span>
                </div>
                <div className="col-span-1 sm:col-span-2 mt-2">
                  <span className="font-semibold text-gray-700">
                    Vehicle Types:{" "}
                  </span>
                  <span className="text-gray-600">
                    {vehicle.vehicleTypes?.length > 0
                      ? vehicle.vehicleTypes.join(", ")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* License Details */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-[#2b6cb0] border-b-2 border-gray-200 pb-2 mb-5">
            License Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 gap-y-3 text-sm">
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[140px]">
                Driver License:
              </span>
              <span className="text-gray-600 break-words">
                {driver.driverLicense || "N/A"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[120px]">
                License Expiry:
              </span>

              <span className="text-gray-600">
                {formatDateWithStatus(driver.driverLicenseExpiry)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[180px]">
                Private Hire License Expiry:
              </span>
              <span className="text-gray-600">
                {formatDateWithStatus(driver.driverPrivateHireLicenseExpiry)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[180px]">
                Vehicle Hire License Expiry:
              </span>
              <span className="text-gray-600">
                {formatDateWithStatus(vehicle.carPrivateHireLicenseExpiry)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[140px]">
                National Insurance:
              </span>
              <span className="text-gray-600 break-words">
                {driver.NationalInsurance || "N/A"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row">
              <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[160px]">
                Private Hire Card No.:
              </span>
              <span className="text-gray-600 break-words">
                {driver.privateHireCardNo || "N/A"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:col-span-2">
              <span className="font-semibold text-gray-700 min-w-0 sm:min-w-[160px]">
                Vehicle Hire License:
              </span>
              <span className="text-gray-600 break-words">
                {vehicle.carPrivateHireLicense || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
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
          Uploaded Documents
        </h3>
        <RenderDocuments uploads={uploads} />
      </div>
    </>
  );
};

export default ViewDriver;
