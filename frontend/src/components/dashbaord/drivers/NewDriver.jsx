import React, { useEffect, useState } from "react";
import IMAGES from "../../../assets/images";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import DriverData from "./DriverData";
import VehicleData from "./VehicleData";
import {
  useCreateDriverMutation,
  useGetDriverByIdQuery,
  useUpdateDriverByIdMutation,
} from "../../../redux/api/driverApi";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const NewDriver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [filePreviews, setFilePreviews] = useState({});
  const [createDriver] = useCreateDriverMutation();

  const { data: driverData } = useGetDriverByIdQuery(id, { skip: !isEdit });
  const [updateDriver] = useUpdateDriverByIdMutation();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();

      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        if (key === "availability") {
          form.append(key, JSON.stringify(value));
        } else if (value instanceof File || value instanceof Blob) {
          form.append(key, value);
        } else {
          form.append(key, value || "");
        }
      });

      if (isEdit) {
        await updateDriver({ id, formData: form }).unwrap();
        toast.success("Driver updated successfully!");
      } else {
        await createDriver(form).unwrap();
        toast.success("Driver created successfully!");
      }

      navigate("/dashboard/drivers/list");
    } catch (error) {
      console.error("Error creating driver:", error);
      toast.error("Error creating driver");
    }
  };
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
        ? [...prev.vehicleTypes, id]
        : prev.vehicleTypes.filter((type) => type !== id);

      return {
        ...prev,
        vehicleTypes: updatedVehicleTypes,
      };
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return dateString.slice(0, 10);
  };

  useEffect(() => {
    if (driverData?.driver && isEdit) {
      const {
        DriverData = {},
        VehicleData = {},
        UploadedData = {},
        ...rest
      } = driverData.driver;

      const availability = DriverData.availability || [{ from: "", to: "" }];

      setFormData((prev) => ({
        ...prev,
        ...DriverData,
        ...VehicleData,
        ...rest,
        dateOfBirth: formatDateForInput(
          DriverData.dateOfBirth || rest.dateOfBirth
        ),
        driverLicenseExpiry: formatDateForInput(
          DriverData.driverLicenseExpiry || rest.driverLicenseExpiry
        ),
        driverPrivateHireLicenseExpiry: formatDateForInput(
          DriverData.driverPrivateHireLicenseExpiry ||
            rest.driverPrivateHireLicenseExpiry
        ),
        carPrivateHireLicenseExpiry: formatDateForInput(
          VehicleData.carPrivateHireLicenseExpiry ||
            rest.carPrivateHireLicenseExpiry
        ),
        motExpiryDate: formatDateForInput(
          VehicleData.motExpiryDate || rest.motExpiryDate
        ),
        carInsuranceExpiry: formatDateForInput(
          VehicleData.carInsuranceExpiry || rest.carInsuranceExpiry
        ),
        availability: availability.map((slot) => ({
          from: formatDateForInput(slot.from),
          to: formatDateForInput(slot.to),
        })),
      }));

      setFilePreviews({
        driverPicture: UploadedData.driverPicture?.url || "",
        driverPictureName: UploadedData.driverPicture?.name || "",

        privateHireCard: UploadedData.privateHireCard?.url || "",
        privateHireCardName: UploadedData.privateHireCard?.name || "",

        dvlaCard: UploadedData.dvlaCard?.url || "",
        dvlaCardName: UploadedData.dvlaCard?.name || "",

        carPicture: UploadedData.carPicture?.url || "",
        carPictureName: UploadedData.carPicture?.name || "",

        privateHireCarPaper: UploadedData.privateHireCarPaper?.url || "",
        privateHireCarPaperName: UploadedData.privateHireCarPaper?.name || "",

        driverPrivateHirePaper: UploadedData.driverPrivateHirePaper?.url || "",
        driverPrivateHirePaperName:
          UploadedData.driverPrivateHirePaper?.name || "",

        insurance: UploadedData.insurance?.url || "",
        insuranceName: UploadedData.insurance?.name || "",

        motExpiry: UploadedData.motExpiry?.url || "",
        motExpiryName: UploadedData.motExpiry?.name || "",

        V5: UploadedData.V5?.url || "",
        V5Name: UploadedData.V5?.name || "",
      });
    }
  }, [driverData, isEdit]);

  return (
    <div>
      <OutletHeading name={isEdit ? "Edit Driver" : "Add Driver"} />
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PROFILE PICTURE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <img
            src={
              filePreviews.driverPicture ||
              formData.driverPicture ||
              IMAGES.dummyImg
            }
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
            {isEdit ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewDriver;