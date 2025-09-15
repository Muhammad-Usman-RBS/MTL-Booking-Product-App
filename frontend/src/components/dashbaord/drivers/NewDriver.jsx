import React, { useEffect, useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import DriverData from "./DriverData";
import VehicleData from "./VehicleData";
import {
  useCreateDriverMutation,
  useGetDriverByIdQuery,
  useUpdateDriverByIdMutation,
} from "../../../redux/api/driverApi";
import { toast } from "react-toastify";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { validateDriver, validateVehicle } from "../../../utils/validation/validators";
import IMAGES from "../../../assets/images";

const NewDriver = () => {
  const user = useSelector((state) => state?.auth?.user);
  const companyId = user?.companyId;
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

    // Run both validations
    const { errors: driverErrors, isValid: isDriverValid } = validateDriver(formData, { isEdit });
    const { errors: vehicleErrors, isValid: isVehicleValid } = validateVehicle(formData);

    const allErrors = { ...driverErrors, ...vehicleErrors };

    // If either validation fails, show all errors
    if (!isDriverValid || !isVehicleValid) {
      Object.values(allErrors).forEach((msg) => toast.error(msg));
      return;
    }

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

      form.append("companyId", companyId);

      if (isEdit) {
        await updateDriver({ id, formData: form }).unwrap();
        toast.success("Driver updated successfully!");
      } else {
        await createDriver(form).unwrap();
        toast.success("Driver created successfully!");
      }

      navigate("/dashboard/admin-list/add-user");
    } catch (error) {
      console.error("Error creating driver:", error);
      const errorMessage =
        error?.data?.message ||
        error?.error ||
        "Something went wrong while creating the driver";

      toast.error(errorMessage);
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
        driverPicture: UploadedData.driverPicture || "",
        privateHireCard: UploadedData.privateHireCard || "",
        dvlaCard: UploadedData.dvlaCard || "",
        carPicture: UploadedData.carPicture || "",
        privateHireCarPaper: UploadedData.privateHireCarPaper || "",
        driverPrivateHirePaper: UploadedData.driverPrivateHirePaper || "",
        insurance: UploadedData.insurance || "",
        motExpiry: UploadedData.motExpiry || "",
        V5: UploadedData.V5 || "",
      });
    }
  }, [driverData, isEdit]);

  return (
    <div>
      <div
        className={`${isEdit ? "border-[var(--light-gray)] border-b" : ""
          } flex items-center justify-between `}
      >
        <OutletHeading name={isEdit ? "Edit Driver" : "Add Driver"} />

        <Link to="/dashboard/drivers/list" className="mb-4">
          <button className="btn btn-primary ">← Back to Driver List</button>
        </Link>
      </div>
      <hr className="mb-6 border-[var(--light-gray)]" />
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PROFILE PICTURE */}
        <div className="inline-flex items-center gap-4 p-4 bg-sky-50 border-2 border-dashed border-sky-300 rounded-xl shadow-sm">
          <div className="flex flex-col items-center">
            <img
              src={filePreviews.driverPicture || IMAGES.dummyImg}
              alt="Driver-Preview"
              className="w-24 h-24 rounded-full object-cover border border-sky-200 shadow-md"
            />

            <label
              htmlFor="driverPicture"
              className="btn btn-reset mt-3 cursor-pointer text-sm"
            >
              Upload Driver Image
            </label>

            <input
              id="driverPicture"
              type="file"
              accept="image/*"
              name="driverPicture"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        </div>

        {/* DRIVER SECTION */}
        <DriverData
          user={user}
          handleAddAvailability={handleAddAvailability}
          handleInputChange={handleInputChange}
          formData={formData}
          handleRemoveAvailability={handleRemoveAvailability}
          filePreviews={filePreviews}
        />

        <VehicleData
        companyId={companyId}
          handleCheckboxChange={handleCheckboxChange}
          handleInputChange={handleInputChange}
          formData={formData}
          filePreviews={filePreviews}
        />

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
