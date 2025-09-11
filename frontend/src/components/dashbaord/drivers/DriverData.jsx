import React from "react";
import FilePreview from "../../../constants/constantscomponents/FilePreview";
import Icons from "../../../assets/icons";

const DriverData = ({
  user,
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
            <label className="block mb-1 text-sm font-medium">
              Employee No.
            </label>
            <input
              type="text"
              name="employeeNumber"
              value={formData.employeeNumber}
              onChange={handleInputChange}
              readOnly={user?.role === "driver"}
              className={`custom_input ${user?.role === "driver"
                  ? "bg-gray-100 cursor-not-allowed opacity-70"
                  : ""
                }`}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              className="custom_input"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Sur Name <span className="text-red-500">*</span>
            </label>
            <input
              className="custom_input"
              name="surName"
              value={formData.surName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={user?.role === "driver"}
              className={`custom_input ${user?.role === "driver"
                  ? "bg-gray-100 cursor-not-allowed opacity-70"
                  : ""
                }`}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Contact <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              className="custom_input"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
            />
          </div>

          <div className="w-full">
            <label htmlFor="status" className="block mb-1 text-sm font-medium">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              disabled={user?.role === "driver"}
              className={`custom_input ${user?.role === "driver"
                  ? "bg-gray-100 cursor-not-allowed opacity-70"
                  : ""
                }`}
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
            <label className="block mb-1 text-sm font-medium">
              D.O.B. <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="custom_input"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Driving License <span className="text-red-500">*</span>
            </label>
            <input
              className="custom_input"
              name="driverLicense"
              value={formData.driverLicense}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Driving License Expiry <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="custom_input"
              name="driverLicenseExpiry"
              value={formData.driverLicenseExpiry}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Driver Private Hire Card No.</label>
            <input
              className="custom_input"
              name="privateHireCardNo"
              value={formData.privateHireCardNo}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Driver Private Hire License Expiry</label>
            <input
              type="date"
              className="custom_input"
              name="driverPrivateHireLicenseExpiry"
              value={formData.driverPrivateHireLicenseExpiry}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">NI Number</label>
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
        <label className="block mb-1 text-sm font-medium">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          className="custom_input"
          rows="2"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Holidays</label>
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
            className="flex items-center mt-2 text-blue-600 cursor-pointer hover:text-blue-800 text-sm"
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
      <hr className="mb-12 mt-12 border-[var(--light-gray)]" />
    </>
  );
};

export default DriverData;
