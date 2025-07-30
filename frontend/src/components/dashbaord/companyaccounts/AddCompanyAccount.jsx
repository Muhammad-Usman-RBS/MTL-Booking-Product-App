import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilePreview from "../../../constants/constantscomponents/FilePreview";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import countries from "../../../constants/constantscomponents/countries";
import {
  bookingPaymentOptions,
  invoicePaymentOptions,
  yesNoOptions,
} from "../../../constants/dashboardTabsData/data";
import { useFetchClientAdminsQuery } from "../../../redux/api/adminApi";
import {
  useCreateCompanyMutation,
  useGetCompanyByIdQuery,
  useUpdateCompanyMutation,
} from "../../../redux/api/companyApi";

const AddCompanyAccount = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [notFound, setNotFound] = useState(false);
  const [filePreviews, setFilePreviews] = useState({});

  const [formData, setFormData] = useState({
    profileImage: "",
    companyName: "",
    contactName: "",
    email: "",
    website: "",
    designation: "",
    contact: "",
    city: "",
    dueDays: "",
    state: "",
    zip: "",
    passphrase: "",
    country: "",
    bookingPayment: "",
    invoicePayment: "",
    showLocations: "",
    address: "",
    invoiceTerms: "",
    clientAdminId: "",
    fullName: "",
    status: "",
    cookieConsent: "",
    tradingName: "",
    licenseNo: "",
    licenseReferenceLink: "",
  });
  const handleInputChange = (e) => {
    const { name, type, files, value } = e.target;

    if (type === "file") {
      const file = files[0];
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
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

  const { data: rawClientAdmins = [] } = useFetchClientAdminsQuery();
  const clientAdmins = [
    { label: "Select Name", value: "" },
    ...rawClientAdmins
      .filter((admin) => admin.status !== "Deleted")
      .map((admin) => ({
        label: admin.fullName,
        value: admin._id,
        email: admin.email,
        status: admin.status,
      })),
  ];

  const {
    data: companyData,
    isLoading,
    isError,
  } = useGetCompanyByIdQuery(id, { skip: !isEdit });

  const [createCompany] = useCreateCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();

  useEffect(() => {
    if (isEdit && isError) {
      setNotFound(true);
      return;
    }

    if (companyData) {
      const imagePath = companyData.profileImage?.startsWith("/")
        ? companyData.profileImage
        : `${companyData.profileImage}`;

      setFormData((prev) => ({
        ...prev,
        ...companyData,
        clientAdminId: companyData.clientAdminId || "",
      }));

      setFilePreviews({
        profileImage: imagePath,
      });
    }
  }, [companyData, isEdit, isError]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.clientAdminId) {
      toast.error("Please select a Client Admin.");
      return;
    }

    try {
      const data = new FormData();

      for (const key in formData) {
        if (key === "profileImage") continue; // skip to avoid double append
        const value =
          key === "dueDays" ? parseInt(formData[key] || "0") : formData[key];
        data.append(key, value);
      }

      if (formData.profileImage instanceof File) {
        data.append("profileImage", formData.profileImage); // add only once, correctly
      }

      if (isEdit) {
        await updateCompany({ id, formData: data }).unwrap();
        toast.success("Company Account updated successfully! ✨");
      } else {
        await createCompany(data).unwrap();
        toast.success("Company Account created successfully! 🚀");
      }

      navigate("/dashboard/company-accounts/list");
    } catch (err) {
      console.error("❌ Error submitting company form:", err);
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  // Redirect to 404 if invalid ID
  if (notFound) {
    return <Navigate to="*" replace />;
  }

  // Optional: show loading state
  if (isEdit && isLoading) {
    return <div className="text-center mt-10">Loading company data...</div>;
  }

  return (
    <div>
      <div
        className={`${
          isEdit ? "border-[var(--light-gray)] border-b" : ""
        } flex items-center justify-between `}
      >
        <OutletHeading
          name={isEdit ? "Edit Company Account" : "Add Company Account"}
        />

        <Link to="/dashboard/company-accounts/list" className="mb-4">
          <button className="btn btn-primary ">← Back to  List</button>
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <FilePreview
          label=""
          file={formData.profileImage}
          previewUrl={filePreviews.profileImage}
          previewName={filePreviews.profileImage}
          formDataFile={formData.profileImage}
          name="profileImage"
          onChange={handleInputChange}
        />
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-4 grid-rows-1 gap-4 mt-6">
        <input
          placeholder="Company Name *"
          className="custom_input"
          value={formData.companyName}
          onChange={(e) => handleChange("companyName", e.target.value)}
        />
        <input
          placeholder="Primary Contact Name *"
          className="custom_input"
          value={formData.contactName}
          onChange={(e) => handleChange("contactName", e.target.value)}
        />
        <input
          type="email"
          placeholder="Email *"
          className="custom_input"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        <input
          placeholder="Website"
          className="custom_input"
          value={formData.website}
          onChange={(e) => handleChange("website", e.target.value)}
        />
        <input
          placeholder="Designation *"
          className="custom_input"
          value={formData.designation}
          onChange={(e) => handleChange("designation", e.target.value)}
        />
        <PhoneInput
          country={"gb"}
          inputClass="w-full custom_input"
          inputStyle={{ width: "100%" }}
          value={formData.contact}
          onChange={(value) => handleChange("contact", value)}
        />
        <input
          placeholder="City"
          className="custom_input"
          value={formData.city}
          onChange={(e) => handleChange("city", e.target.value)}
        />
        <input
          type="number"
          min="1"
          placeholder="Due Days *"
          className="custom_input"
          value={formData.dueDays}
          onChange={(e) => handleChange("dueDays", e.target.value)}
        />
        <input
          placeholder="State"
          className="custom_input"
          value={formData.state}
          onChange={(e) => handleChange("state", e.target.value)}
        />
        <input
          placeholder="Zip Code"
          className="custom_input"
          value={formData.zip}
          onChange={(e) => handleChange("zip", e.target.value)}
        />
        <input
          placeholder="Passphrase"
          className="custom_input"
          value={formData.passphrase}
          onChange={(e) => handleChange("passphrase", e.target.value)}
        />
      </div>

      {/* Select & TextArea Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="grid grid-cols-1 gap-4">
          <SelectOption
            label="Assign to Client Admin *"
            value={formData.clientAdminId}
            options={clientAdmins}
            onChange={(e) => {
              const selectedId = e?.target?.value || e?.value || e;
              const selectedAdmin = clientAdmins.find(
                (admin) => admin.value === selectedId
              );
              handleChange("clientAdminId", selectedId);
              handleChange("fullName", selectedAdmin?.label || "");
              handleChange("email", selectedAdmin?.email || "");
              handleChange("status", selectedAdmin?.status);
            }}
          />
          <SelectOption
            label="Country *"
            options={countries}
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
          />
          <SelectOption
            label="Booking Payment *"
            options={bookingPaymentOptions}
            value={formData.bookingPayment}
            onChange={(e) => handleChange("bookingPayment", e.target.value)}
          />
          <SelectOption
            label="Invoice Payment *"
            options={invoicePaymentOptions}
            value={formData.invoicePayment}
            onChange={(e) => handleChange("invoicePayment", e.target.value)}
          />
          <SelectOption
            label="Show Locations *"
            options={yesNoOptions}
            value={formData.showLocations}
            onChange={(e) => handleChange("showLocations", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <textarea
            placeholder="Address"
            className="custom_input"
            rows={3}
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          <textarea
            placeholder="Invoice Terms"
            className="custom_input"
            rows={4}
            value={formData.invoiceTerms}
            onChange={(e) => handleChange("invoiceTerms", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 text-right">
        <button onClick={handleSubmit} className="btn btn-reset">
          {isEdit ? "Update" : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default AddCompanyAccount;
