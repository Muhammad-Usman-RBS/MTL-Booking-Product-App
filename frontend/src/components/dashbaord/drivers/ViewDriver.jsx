import React from "react";
import IMAGES from "../../../assets/images";

const ViewDriver = ({ selectedDriver, setSelectedDriver }) => {
  return (
    <>
      <div className="p-6">
        <div className="md:flex justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4">View Driver</h2>
          </div>
          <div className="mb-3 md:mb-0">
            <button
              onClick={() => setSelectedDriver(null)}
              className="btn btn-primary"
            >
              ← Back to Driver List
            </button>
          </div>
        </div>
        <hr className="mb-4" />

        {/* DRIVER INFO */}
        <div className="grid md:grid-cols-2 gap-6 items-start mb-10 mt-12">
          <img
            src={selectedDriver.driverImage || IMAGES.dummyImg}
            alt="Driver"
            className="w-24 h-24 rounded object-cover border-2 border-gray-300"
          />

          <div className="text-sm text-gray-800 space-y-1">
            <p>
              <strong>Driver No.:</strong> {selectedDriver.no || "N/A"}
            </p>
            <p>
              <strong>Short Name:</strong> {selectedDriver.shortName || "N/A"}
            </p>
            <p>
              <strong>Full Name:</strong> {selectedDriver.name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {selectedDriver.email || "N/A"}
            </p>
            <p>
              <strong>Contact:</strong> {selectedDriver.contact || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {selectedDriver.address || "N/A"}
            </p>
            <p>
              <strong>D.O.B.:</strong> {selectedDriver.dob || "N/A"}
            </p>
          </div>
        </div>

        {/* VEHICLE DETAILS */}
        <h3 className="text-lg font-bold text-black mb-2 border-b pb-1">
          Vehicle Details:
        </h3>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <img
            src={selectedDriver.vehicleImage || "/default-vehicle.jpg"}
            alt="Vehicle"
            className="w-full md:w-64 h-40 object-cover border-2 border-gray-300"
          />

          <div className="text-sm text-gray-800 space-y-1">
            <p>
              <strong>Make:</strong> {selectedDriver.make || "N/A"}
            </p>
            <p>
              <strong>Model:</strong> {selectedDriver.model || "N/A"}
            </p>
            <p>
              <strong>Color:</strong> {selectedDriver.color || "N/A"}
            </p>
            <p>
              <strong>Reg. No.:</strong> {selectedDriver.regNo || "N/A"}
            </p>
            <p>
              <strong>Vehicle Insurance:</strong>
              {selectedDriver.insurance || "N/A"}
            </p>
            <p>
              <strong>Vehicle Insurance Expiry:</strong>
              {selectedDriver.insuranceExpiry || "N/A"}
            </p>
            <p>
              <strong>Vehicle Condition:</strong>
              {selectedDriver.condition || "N/A"}
            </p>
            <p>
              <strong>Vehicle Condition Expiry:</strong>
              {selectedDriver.conditionExpiry || "N/A"}
            </p>
          </div>
        </div>

        {/* LICENSE DETAILS */}
        <h3 className="text-lg font-bold text-black mb-2 border-b pb-1">
          License Details:
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-sm text-gray-800 space-y-1">
            <p>
              <strong>Driver License:</strong>
              {selectedDriver.drivingLicense || "N/A"}
            </p>
            <p>
              <strong>Driver License Expiry:</strong>
              {selectedDriver.licenseExpiry || "N/A"}
            </p>
            <p>
              <strong>Driver Taxi License:</strong>
              {selectedDriver.taxiLicense || "N/A"}
            </p>
            <p>
              <strong>Driver Taxi License Expiry:</strong>
              {selectedDriver.taxiLicenseExpiry || "N/A"}
            </p>
          </div>
          <div className="text-sm text-gray-800 space-y-1">
            <p>
              <strong>Vehicle Taxi License:</strong>
              {selectedDriver.vehicleTaxiLicense || "N/A"}
            </p>
            <p>
              <strong>Vehicle Taxi License Expiry:</strong>
              {selectedDriver.vehicleTaxiExpiry || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {selectedDriver.status || "N/A"}
            </p>
            <p>
              <strong>Documents:</strong>
              <span
                className={`font-semibold ${
                  selectedDriver.documents === "Fine"
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {selectedDriver.documents}
              </span>
            </p>
          </div>
        </div>

        {/* VEHICLE TYPES */}
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Vehicle Types</h4>
          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
            {selectedDriver.vehicleTypes?.length > 0 ? (
              selectedDriver.vehicleTypes.map((type, index) => (
                <li key={index}>{type}</li>
              ))
            ) : (
              <li>N/A</li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default ViewDriver;
