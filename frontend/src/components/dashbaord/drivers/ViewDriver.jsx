import React from "react";
import IMAGES from "../../../assets/images";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const ViewDriver = ({ selectedDriver, setSelectedDriver }) => {
  const driver = selectedDriver?.driver.DriverData || {};
  const vehicle = selectedDriver?.driver.VehicleData || {};
  const uploads = selectedDriver?.driver.UploadedData || {};
  console.log("driver data", uploads);
  const VITE_APP_API_URL = "http://localhost:5000";

  return (
    <>
      <div>
        <div className="md:flex justify-between">
          <OutletHeading name="View Driver" />
          <div className="mb-3 md:mb-0">
            <button
              onClick={() => setSelectedDriver(null)}
              className="btn btn-primary mb-2"
            >
              ← Back to Driver List
            </button>
          </div>
        </div>
        <hr className="mb-4" />

        {/* DRIVER INFO */}
        <div className="grid md:grid-cols-1 gap-6 items-start mb-10 mt-4">
          <img
            src={
              uploads.driverPicture
                ? `${VITE_APP_API_URL}/${uploads.driverPicture}`
                : IMAGES.dummyImg
            }
            alt="Driver"
            className="w-32 h-32 rounded object-cover border-2 border-gray-300"
          />

          <div className="text-sm grid grid-cols-2 text-gray-800 space-y-1">
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
              <strong>D.O.B.:</strong>
              {driver.dateOfBirth?.split("T")[0] || "N/A"}
            </p>

            {driver.availability?.length > 0 ? (
              <div className=" flex  space-x-1" >
                <h4 className="  font-semibold">Availability:</h4>
                <ul className=" text-gray-700 text-sm space-y-1">
                  {driver.availability.map((slot, idx) => (
                    <li key={idx}>
                      From: {new Date(slot.from).toLocaleDateString()} - To:
                      {new Date(slot.to).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>
                <strong>Availability:</strong> N/A
              </p>
            )}
          </div>
        </div>

        {/* VEHICLE DETAILS */}
        <h3 className="text-lg font-bold text-gray-600 mb-4 border-b pb-1 mt-4">
          Vehicle Details:
        </h3>
        <div className="grid md:grid-cols-1 gap-6 mb-10">
          <img
            src={
              uploads.carPicture
                ? `${VITE_APP_API_URL}/${uploads.carPicture}`
                : IMAGES.dummyImg
            }
            alt="Vehicle"
            className="w-32 h-32 object-cover border-2 border-gray-300"
          />

          <div className="text-sm grid grid-cols-2 text-gray-800 space-y-1">
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
              {vehicle.carInsuranceExpiry?.split("T")[0] || "N/A"}
            </p>
            <p>
              <strong>MOT Expiry:</strong>
              {vehicle.motExpiryDate?.split("T")[0] || "N/A"}
            </p>
            <div className=" flex space-x-1 ">
              <h4 className="font-semibold ">Vehicle Types:</h4>
              <p className="text-gray-700 text-sm">
                {vehicle.vehicleTypes?.length > 0
                  ? vehicle.vehicleTypes.join(", ")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* LICENSE DETAILS */}
        <h3 className="text-lg font-bold text-gray-600  border-b pb-1">
          License Details:
        </h3>
        <div className="grid md:grid-cols-2 mt-3 mb-6 gap-6">
          <div className="text-sm text-gray-800 space-y-1">
            <p>
              <strong>Driver License:</strong> {driver.driverLicense || "N/A"}
            </p>
            <p>
              <strong>Driver License Expiry:</strong>
              {driver.driverLicenseExpiry?.split("T")[0] || "N/A"}
            </p>
            <p>
              <strong>Driver Private Hire License Expiry:</strong>
              {driver.driverPrivateHireLicenseExpiry?.split("T")[0] || "N/A"}
            </p>
          </div>
          <div className="text-sm text-gray-800 space-y-1">
            <p>
              <strong>National Insurance:</strong>
              {driver.NationalInsurance || "N/A"}
            </p>
            <p>
              <strong>Private Hire Card No:</strong>
              {driver.privateHireCardNo || "N/A"}
            </p>
            <p>
              <strong>Vehicle Private Hire License:</strong>
              {vehicle.carPrivateHireLicense || "N/A"}
            </p>
            <p>
              <strong>Vehicle Private Hire License Expiry:</strong>
              {vehicle.carPrivateHireLicenseExpiry?.split("T")[0] || "N/A"}
            </p>
          </div>
        </div>

        {/* VEHICLE TYPES */}

        {/* UPLOADED DOCUMENTS */}
        <h3 className="text-lg mb-2   font-bold text-black border-b  pb-1">
          Uploaded Documents:
        </h3>
        <div className=" grid grid-cols-4 mt-4 grid-rows-2 space-y-4">
          <div>
            <img
              src={
                uploads.privateHireCard
                  ? `${VITE_APP_API_URL}/${uploads.privateHireCard}`
                  : IMAGES.dummyImg
              }
              alt="Private Hire Card"
              className="w-40 h-28 object-cover border-2 border-gray-300 "
            />
            <p className=" mt-2">Private Hire Card</p>
          </div>
          <div>
            <img
              src={
                uploads.dvlaCard
                  ? `${VITE_APP_API_URL}/${uploads.dvlaCard}`
                  : IMAGES.dummyImg
              }
              alt="DVLA Card"
              className="w-40 h-28 object-cover border-2 border-gray-300"
            />
            <p className=" mt-2">DVLA Card</p>
          </div>
          <div>
            <img
              src={
                uploads.privateHireCarPaper
                  ? `${VITE_APP_API_URL}/${uploads.privateHireCarPaper}`
                  : IMAGES.dummyImg
              }
              alt="Private Hire Car Paper"
              className="w-40 h-28 object-cover border-2 border-gray-300"
            />
            <p className=" mt-2">Private Hire Car Paper</p>
          </div>
          <div>
            <img
              src={
                uploads.driverPrivateHirePaper
                  ? `${VITE_APP_API_URL}/${uploads.driverPrivateHirePaper}`
                  : IMAGES.dummyImg
              }
              alt="Driver Private Hire Paper"
              className="w-40 h-28 object-cover border-2 border-gray-300"
            />
            <p className=" mt-2">Driver Private Hire Paper</p>
          </div>
          <div>
            <img
              src={
                uploads.insurance
                  ? `${VITE_APP_API_URL}/${uploads.insurance}`
                  : IMAGES.dummyImg
              }
              alt="Insurance"
              className="w-40 h-28 object-cover border-2 border-gray-300"
            />
            <p className=" mt-2">Insurance</p>
          </div>
          <div>
            <img
              src={
                uploads.motExpiry
                  ? `${VITE_APP_API_URL}/${uploads.motExpiry}`
                  : IMAGES.dummyImg
              }
              alt="MOT Expiry"
              className="w-40 h-28 object-cover border-2 border-gray-300"
            />
            <p className=" mt-2">MOT Expiry</p>
          </div>
          <div>
            <img
              src={
                uploads.V5
                  ? `${VITE_APP_API_URL}/${uploads.V5}`
                  : IMAGES.dummyImg
              }
              alt="V5 Document"
              className="w-40 h-28 object-cover border-2 border-gray-300"
            />
            <p className=" mt-2">V5</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewDriver;