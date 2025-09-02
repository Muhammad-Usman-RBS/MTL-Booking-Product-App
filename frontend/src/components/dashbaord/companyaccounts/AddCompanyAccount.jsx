import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilePreview from "../../../constants/constantscomponents/FilePreview";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { yesNoOptions } from "../../../constants/dashboardTabsData/data";
import { useSelector } from "react-redux";

// ⬇️ NEW: import associates query
import {
  useFetchClientAdminsQuery,
  useFetchAssociateAdminsQuery,
} from "../../../redux/api/adminApi";

import {
  useCreateCompanyMutation,
  useGetCompanyByIdQuery,
  useUpdateCompanyMutation,
} from "../../../redux/api/companyApi";

const AddCompanyAccount = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const user = useSelector((state) => state.auth?.user);
  const isClientAdmin = user?.role === "clientadmin";

  const [notFound, setNotFound] = useState(false);
  const [filePreviews, setFilePreviews] = useState({});

  const [formData, setFormData] = useState({
    profileImage: "",
    companyName: "",
    tradingName: "",
    email: "",
    contact: "",
    licensedBy: "",
    licenseNumber: "",
    referrerLink: "",
    cookieConsent: "",
    address: "",
    clientAdminId: "",
    fullName: "",
    status: "",
  });

  const handleInputChange = (e) => {
    const { name, type, files, value } = e.target;
    if (type === "file") {
      const file = files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (file && !allowedTypes.includes(file.type)) {
        toast.error("Only PDF, JPEG, PNG, JPG files are supported.");
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
      setFilePreviews((prev) => ({ ...prev, [name]: file ? URL.createObjectURL(file) : "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ⬇️ If NOT clientadmin, fetch clientadmins as before
  const { data: rawClientAdmins = [] } = useFetchClientAdminsQuery(undefined, {
    skip: isClientAdmin, // important
  });

  // ⬇️ If clientadmin, fetch ONLY its associates (by createdBy + companyId)
  const { data: rawAssociates = [] } = useFetchAssociateAdminsQuery(
    { createdBy: user?._id, companyId: user?.companyId },
    { skip: !isClientAdmin }
  );

  // Build options based on role
  const options = (isClientAdmin ? rawAssociates : rawClientAdmins)
    .filter((u) => u?.status !== "Deleted")
    // extra guard: if you still get others, keep only same company for associates
    .filter((u) => (isClientAdmin ? String(u?.companyId) === String(user?.companyId) : true))
    .map((u) => ({
      label: u.fullName,
      value: u._id,
      email: u.email,
      status: u.status,
    }));

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
      setFilePreviews({ profileImage: imagePath });
    }
  }, [companyData, isEdit, isError]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.clientAdminId) {
      toast.error(`Please select a ${isClientAdmin ? "Associate Admin" : "Client Admin"}.`);
      return;
    }
    try {
      const data = new FormData();
      for (const key in formData) {
        if (key === "profileImage") continue;
        const value = key === "licenseNumber" ? parseInt(formData[key] || "0") : formData[key];
        data.append(key, value);
      }
      if (formData.profileImage instanceof File) {
        data.append("profileImage", formData.profileImage);
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

  if (notFound) return <Navigate to="*" replace />;
  if (isEdit && isLoading) return <div className="text-center mt-10">Loading company data...</div>;

  return (
    <div>
      <div className={`${isEdit ? "border-[var(--light-gray)] border-b" : ""} flex items-center justify-between `}>
        <OutletHeading name={isEdit ? "Edit Company Account" : "Add Company Account"} />
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

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <input
          placeholder="Company Name *"
          className="custom_input"
          value={formData.companyName}
          onChange={(e) => handleChange("companyName", e.target.value)}
        />
        <input
          placeholder="Trading Name *"
          className="custom_input"
          value={formData.tradingName}
          onChange={(e) => handleChange("tradingName", e.target.value)}
        />
        <input
          type="email"
          placeholder="Email *"
          className="custom_input"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        <PhoneInput
          country={"gb"}
          inputClass="w-full custom_input"
          inputStyle={{ width: "100%" }}
          value={formData.contact}
          onChange={(value) => handleChange("contact", value)}
        />
        <input
          placeholder="Licensed By"
          className="custom_input"
          value={formData.licensedBy}
          onChange={(e) => handleChange("licensedBy", e.target.value)}
        />
        <input
          type="number"
          min="1"
          placeholder="License Number *"
          className="custom_input"
          value={formData.licenseNumber}
          onChange={(e) => handleChange("licenseNumber", e.target.value)}
        />
        <input
          placeholder="License Referrer Link"
          className="custom_input"
          value={formData.referrerLink}
          onChange={(e) => handleChange("referrerLink", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <SelectOption
          label={isClientAdmin ? "Assign to Associate Admin *" : "Assign to Client Admin *"}
          value={formData.clientAdminId}
          options={options}
          onChange={(e) => {
            const selectedId = e?.target?.value || e?.value || e;
            const sel = options.find((o) => o.value === selectedId);
            handleChange("clientAdminId", selectedId); // NOTE: backend expects user _id (associate or clientadmin)
            handleChange("fullName", sel?.label || "");
            handleChange("email", sel?.email || "");
            handleChange("status", sel?.status || "");
          }}
        />
        <SelectOption
          label="Cookie Consent *"
          options={yesNoOptions}
          value={formData.cookieConsent}
          onChange={(e) => handleChange("cookieConsent", e.target.value)}
        />
      </div>

      <div className="mt-6">
        <label className="block mb-1 font-medium">Company Address</label>
        <textarea
          placeholder="Company Address"
          className="custom_input w-full"
          rows={3}
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
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
