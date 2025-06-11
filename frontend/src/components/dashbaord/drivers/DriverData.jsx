import React from "react";
import FilePreview from "../../../constants/constantscomponents/FilePreview";
import Icons from "../../../assets/icons";

const DriverData = ({
  filePreviews,
  handleAddAvailability,
  handleInputChange,
  formData,
  handleRemoveAvailability,
}) => {
  return (
    <>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Employee No.</label>
            <input
              className="custom_input"
              name="employeeNumber"
              value={formData.employeeNumber}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>First Name</label>
            <input
              className="custom_input"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Sur Name</label>
            <input
              className="custom_input"
              name="surName"
              value={formData.surName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              className="custom_input"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Contact</label>
            <input
              type="tel"
              className="custom_input"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-full">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Deleted">Deleted</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div>
            <label>D.O.B.</label>
            <input
              type="date"
              className="custom_input"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Driving License</label>
            <input
              className="custom_input"
              name="driverLicense"
              value={formData.driverLicense}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Driving License Expiry</label>
            <input
              type="date"
              className="custom_input"
              name="driverLicenseExpiry"
              value={formData.driverLicenseExpiry}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Driver Private Hire Card No.</label>
            <input
              className="custom_input"
              name="privateHireCardNo"
              value={formData.privateHireCardNo}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Driver Private Hire License Expiry</label>
            <input
              type="date"
              className="custom_input"
              name="driverPrivateHireLicenseExpiry"
              value={formData.driverPrivateHireLicenseExpiry}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>NI Number</label>
            <input
              className="custom_input"
              name="NationalInsurance"
              value={formData.NationalInsurance}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      <div>
        <label>Address</label>
        <textarea
          className="custom_input"
          rows="2"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label>Holidays</label>
        {formData.availability?.map((slot, index) => (
          <div
            key={index}
            className="flex flex-col mt-2 md:flex-row md:items-center gap-2 mb-3"
          >
            <div className="flex items-center gap-2 w-full">
              <label className="text-xs mb-1 text-gray-500">From:</label>
              <input
                type="date"
                name={`availability[${index}].from`}
                value={slot?.from || ""}
                onChange={(e) => handleInputChange(e, index, "from")}
                className="custom_input"
              />
            </div>

            <div className="flex items-center gap-2 w-full">
              <label className="text-xs mb-1 text-gray-500">To:</label>
              <input
                type="date"
                name={`availability[${index}].to`}
                value={slot.to || ""}
                onChange={(e) => handleInputChange(e, index, "to")}
                className="custom_input"
              />
            </div>
            <div>
              {index > 0 && (
                <div className="p-2 ">
                  <button
                    type="button"
                    onClick={() => handleRemoveAvailability(index)}
                    className=" btn btn-cancel"
                  >
                    <Icons.X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {formData.availability?.length < 3 && (
          <button
            type="button"
            onClick={handleAddAvailability}
            className="flex items-center mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <Icons.Plus size={16} className="mr-1" />
            Add Holidays
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <FilePreview
            label="DVLA Card"
            file={formData.dvlaCard}
            previewUrl={filePreviews.dvlaCard}
            previewName={filePreviews.dvlaCardName}
            formDataFile={formData.dvlaCard}
            name="dvlaCard"
            onChange={handleInputChange}
          />
        </div>
        <FilePreview
          label="Driver Private Hire Paper"
          file={formData.driverPrivateHirePaper}
          previewUrl={filePreviews.driverPrivateHirePaper}
          previewName={filePreviews.driverPrivateHirePaperName}
          formDataFile={formData.driverPrivateHirePaper}
          name="driverPrivateHirePaper"
          onChange={handleInputChange}
        />
      </div>
      <hr className="mb-12 mt-12 border-gray-300" />
    </>
  );
};

export default DriverData;