import React from "react";
import FilePreview from "../../../constants/constantscomponents/FilePreview";

const VehicleData = ({
  filePreviews,
  handleInputChange,
  handleCheckboxChange,
  formData,
}) => {
  return (
    <>
      <div>
        <h3 className="text-xl font-semibold mt-6">Vehicle Information</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 mt-2">
          <FilePreview
            label="Upload Car Image"
            file={formData.carPicture}
            previewUrl={filePreviews.carPicture}
            previewName={filePreviews.carPictureName}
            formDataFile={formData.carPicture}
            name="carPicture"
            onChange={handleInputChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Vehicle Make</label>
            <input
              name="carMake"
              value={formData.carMake || ""}
              onChange={handleInputChange}
              className="custom_input"
            />
          </div>
          <div>
            <label>Vehicle Model</label>
            <input
              name="carModal"
              value={formData.carModal || ""}
              onChange={handleInputChange}
              className="custom_input"
            />
          </div>
          <div>
            <label>Vehicle Color</label>
            <input
              name="carColor"
              value={formData.carColor || ""}
              onChange={handleInputChange}
              className="custom_input"
            />
          </div>
          <div>
            <label>Vehicle Reg. No.</label>
            <input
              name="carRegistration"
              value={formData.carRegistration || ""}
              onChange={handleInputChange}
              className="custom_input"
            />
          </div>

          <div>
            <label>Vehicle Insurance Expiry</label>
            <input
              type="date"
              name="carInsuranceExpiry"
              value={formData.carInsuranceExpiry || ""}
              onChange={handleInputChange}
              className="custom_input"
            />
          </div>
          <div>
            <label>Vehicle Private Hire License</label>
            <input
              name="carPrivateHireLicense"
              value={formData.carPrivateHireLicense || ""}
              onChange={handleInputChange}
              className="custom_input"
            />
          </div>
          <div>
            <label>Vehicle Private Hire License Expiry</label>
            <input
              type="date"
              name="carPrivateHireLicenseExpiry"
              value={formData.carPrivateHireLicenseExpiry || ""}
              onChange={handleInputChange}
              className="custom_input"
            />
          </div>
          <div>
            <label>MOT Expiry</label>
            <input
              type="date"
              name="motExpiryDate"
              value={formData.motExpiryDate || ""}
              onChange={handleInputChange}
              className="custom_input"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FilePreview
            label="Private Hire Card"
            file={formData.privateHireCard}
            previewUrl={filePreviews.privateHireCard}
            previewName={filePreviews.privateHireCardName}
            formDataFile={formData.privateHireCard}
            name="privateHireCard"
            onChange={handleInputChange}
          />
        </div>
        <div>
          <FilePreview
            label="Private Hire Car Paper"
            file={formData.privateHireCarPaper}
            previewUrl={filePreviews.privateHireCarPaper}
            previewName={filePreviews.privateHireCarPaperName}
            formDataFile={formData.privateHireCarPaper}
            name="privateHireCarPaper"
            onChange={handleInputChange}
          />
        </div>
        <div>
          <FilePreview
            label="Insurance"
            file={formData.insurance}
            previewUrl={filePreviews.insurance}
            previewName={filePreviews.insuranceName}
            formDataFile={formData.insurance}
            name="insurance"
            onChange={handleInputChange}
          />
        </div>
        <div>
          <FilePreview
            label="MOT Expiry"
            file={formData.motExpiry}
            previewUrl={filePreviews.motExpiry}
            previewName={filePreviews.motExpiryName}
            formDataFile={formData.motExpiry}
            name="motExpiry"
            onChange={handleInputChange}
          />
        </div>
        <div>
          <FilePreview
            label="V5"
            file={formData.V5}
            previewUrl={filePreviews.V5}
            previewName={filePreviews.V5Name}
            formDataFile={formData.V5}
            name="V5"
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="mt-6">
        <label className="block font-semibold mb-2">Vehicle Types</label>
        <div className="grid grid-cols-3 grid-rows-3 gap-2">
          {[
            "Standard Sedan",
            "Executive Sedan",
            "Luxury Saloon",
            "6 Passenger MPV",
            "8 Passenger MPV",
          ].map((type) => (
            <div key={type} className="flex items-center">
              <input
                type="checkbox"
                id={type.toLowerCase()}
                onChange={handleCheckboxChange}
                checked={formData.vehicleTypes.includes(type.toLowerCase())}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label
                className="ml-2 text-sm text-gray-700"
                htmlFor={type.toLowerCase().replace(/ /g, "")}
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default VehicleData;