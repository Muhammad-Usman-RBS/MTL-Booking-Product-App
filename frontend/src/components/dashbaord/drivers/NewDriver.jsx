import React, { useState } from "react";
import IMAGES from "../../../assets/images";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import DriverData from "./DriverData";
import VehicleData from "./VehicleData";
import { useCreateDriverMutation } from "../../../redux/api/driverApi";
import { toast } from "react-toastify"
const NewDriver = () => {
  const [filePreviews, setFilePreviews] = useState({});
  const [createDriver, { isLoading }] = useCreateDriverMutation()
  const [formData, setFormData] = useState({
    motExpiryDate: "",
    employeeNumber: "",
    status: "",
    firstName: "",
    surName: "",
    driverPrivateHireLicenseExpiry: "",
    driverPicture: "",
    privateHireCardNo: "",
    privateHireCard: "",
    dvlaCard: "",
    NationalInsurance: "",
    dateOfBirth: "",
    carRegistration: "",
    carPicture: "",
    privateHireCarPaper: "",
    driverPrivateHirePaper: "",
    insurance: "",
    motExpiry: "",
    V5: "",
    email: "",
    address: "",
    vehicleTypes: "",
    carMake: "",
    carModal: "",
    carColor: "",
    carPrivateHireLicense: "",
    carPrivateHireLicenseExpiry: "",
    carInsuranceExpiry: "",
    contact: "",
    driverLicense: "",
    driverLicenseExpiry: "",
    availability: [{ from: "", to: "" }],
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const form = new FormData();

      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        if (
          key === 'availability' ||
          key === 'nominatedDrivers' ||
          key === 'experienceHistory'
        ) {
          form.append(key, JSON.stringify(value));
        } else if (value instanceof File || value instanceof Blob) {
          form.append(key, value);
        } else if (value !== "" && value !== null && value !== undefined) {
          form.append(key, value);
        }
      });

      createDriver(form);
      toast.success("Driver profile saved successfully!");
    } catch (error) {
      console.error("Error creating driver:", error);
      toast.error("error creating driver")


    }
  }
  const handleInputChange = (e, index = null, field = null) => {
    const { name, type, files, value } = e.target;

    if (name.startsWith("availability") && index !== null) {
      setFormData((prev) => {
        const updatedAvailability = [...prev.availability];
        updatedAvailability[index][field] = value;
        return {
          ...prev,
          availability: updatedAvailability,
        };
      });
      return;
    }

    if (type === "file") {
      const file = files[0];
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (file && !allowedTypes.includes(file.type)) {
        toast.error("Only PDF, JPEG, PNG, JPG files are supported.");
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));
      setFilePreviews((prev) => ({
        ...prev,
        [name]: file ? URL.createObjectURL(file) : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };


  const handleAddAvailability = () => {
    if (formData.availability.length < 3) {
      setFormData((prev) => ({
        ...prev,
        availability: [...prev.availability, { from: "", to: "" }],
      }));
    }
  };
  const handleRemoveAvailability = (index) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;
    setFormData((prev) => {
      const updatedVehicleTypes = checked
        ? [...prev.vehicleTypes, id] // Add vehicle type if checked
        : prev.vehicleTypes.filter((type) => type !== id); // Remove vehicle type if unchecked

      return {
        ...prev,
        vehicleTypes: updatedVehicleTypes, // Update vehicleTypes array
      };
    });
  }; return (
    <div>
      <OutletHeading name="Add Driver" />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PROFILE PICTURE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <img
            src={filePreviews.driverPicture || IMAGES.dummyImg || formData.driverPicture}
            alt="Profile Preview"
            className="w-24 h-24 rounded-full object-cover border-gray-300 border-2"
          />



          <div>
            <label className="block font-medium text-sm mb-1">
              Upload Driver Image
            </label>
            <label
              htmlFor="driverPicture"
              className="btn btn-edit mt-1 cursor-pointer inline-block"
            >
              Choose File
            </label>
            <input
              id="driverPicture"
              name="driverPicture"
              accept="image/*,application/pdf"

              type="file"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        </div>

        {/* DRIVER SECTION */}

        <DriverData
          handleAddAvailability={handleAddAvailability}
          handleInputChange={handleInputChange}
          formData={formData}
          handleRemoveAvailability={handleRemoveAvailability}
          filePreviews={filePreviews}
        />

        <VehicleData
          handleCheckboxChange={handleCheckboxChange}
          handleInputChange={handleInputChange}
          formData={formData}
          filePreviews={filePreviews}
        />
        {/* SUBMIT */}
        <div className="text-center mt-6">
          <button type="submit" className="btn btn-reset">
            UPDATE
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewDriver;