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

import {
  useFetchClientAdminsQuery,
  useFetchAssociateAdminsQuery,
} from "../../../redux/api/adminApi";

import {
  useCreateCompanyMutation,
  useGetCompanyByIdQuery,
  useUpdateCompanyMutation,
} from "../../../redux/api/companyApi";

// ✅ use ONE shared validators file
import {
  validateCompanyAccount,
} from "../../../utils/validation/validators";
import OutletBtnHeading from "../../../constants/constantscomponents/OutletBtnHeading";

const Req = () => <span className="text-red-500 ml-0.5">*</span>;

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
    licensedBy: "",      // OPTIONAL
    licenseNumber: "",
    referrerLink: "",
    cookieConsent: "",
    address: "",
    clientAdminId: "",
    fullName: "",
    status: "",
  });

  // ✅ new: error + touched states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setFieldTouched = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const setManyTouched = (fields) => {
    const t = {};
    fields.forEach((f) => (t[f] = true));
    setTouched((prev) => ({ ...prev, ...t }));
  };

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

  const { data: rawClientAdmins = [] } = useFetchClientAdminsQuery(undefined, {
    skip: isClientAdmin,
  });

  const { data: rawAssociates = [] } = useFetchAssociateAdminsQuery(
    { createdBy: user?._id, companyId: user?.companyId },
    { skip: !isClientAdmin }
  );

  const options = (isClientAdmin ? rawAssociates : rawClientAdmins)
    .filter((u) => u?.status !== "Deleted")
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

  // ✅ onBlur -> set touched + live-validate field
  const handleBlur = (field) => {
    setFieldTouched(field);
    const { errors: e } = validateCompanyAccount(formData);
    setErrors(e);
  };

  const inputBase =
    "custom_input " +
    (/* small util: conditional red border via function below */ "");

  const errorClass = (field) =>
    touched[field] && errors[field] ? "border-red-500 focus:border-red-500" : "";

  const ErrorText = ({ field }) =>
    touched[field] && errors[field] ? (
      <p className="text-red-600 text-sm mt-1">{errors[field]}</p>
    ) : null;

  const handleSubmit = async () => {
    // validate all
    const { errors: e, isValid } = validateCompanyAccount(formData);
    setErrors(e);

    // mark all as touched for showing messages
    setManyTouched([
      "companyName",
      "tradingName",
      "email",
      "contact",
      // "licensedBy" optional
      "licenseNumber",
      "referrerLink",
      "cookieConsent",
      "address",
      "clientAdminId",
    ]);

    if (!isValid) {
      toast.error("Validation failed. Kindly check the required fields.");
      return;
    }

    if (!formData.clientAdminId) {
      toast.error(`Please select a ${isClientAdmin ? "Associate Admin" : "Client Admin"}.`);
      return;
    }

    try {
      const data = new FormData();
      for (const key in formData) {
        if (key === "profileImage") continue; // optional
        const value =
          key === "licenseNumber" ? parseInt(formData[key] || "0", 10) : formData[key];
        data.append(key, value);
      }
      if (formData.profileImage instanceof File) {
        data.append("profileImage", formData.profileImage);
      }
      if (isEdit) {
        await updateCompany({ id, formData: data }).unwrap();
        toast.success("Company Account updated successfully!");
      } else {
        await createCompany(data).unwrap();
        toast.success("Company Account created successfully!");
      }
      navigate("/dashboard/company-accounts/list");
    } catch (err) {
      console.error("Error submitting company form:", err);
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  if (notFound) return <Navigate to="*" replace />;
  if (isEdit && isLoading) return <div className="text-center mt-10">Loading company data...</div>;

  return (
    <div>
      <OutletBtnHeading
        name={isEdit ? "Edit Company Account" : "Add Company Account"}
        buttonLabel="← Back to Users List"
        buttonLink="/dashboard/company-accounts/list"
        buttonBg="btn btn-primary"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* profileImage OPTIONAL — no star or error */}
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
        <div>
          <label className="block mb-1 font-medium">
            Company Name{!isEdit && <Req />}
          </label>
          <input
            name="companyName"
            placeholder="Company Name"
            className={`custom_input ${errorClass("companyName")}`}
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            onBlur={() => handleBlur("companyName")}
          />
          <ErrorText field="companyName" />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Trading Name{!isEdit && <Req />}
          </label>
          <input
            name="tradingName"
            placeholder="Trading Name"
            className={`custom_input ${errorClass("tradingName")}`}
            value={formData.tradingName}
            onChange={(e) => handleChange("tradingName", e.target.value)}
            onBlur={() => handleBlur("tradingName")}
          />
          <ErrorText field="tradingName" />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Contact{!isEdit && <Req />}
          </label>
          <PhoneInput
            country={"gb"}
            inputClass={`w-full custom_input ${errorClass("contact")}`}
            inputStyle={{ width: "100%" }}
            value={formData.contact}
            onChange={(value) => handleChange("contact", value)}
            onBlur={() => handleBlur("contact")}
            inputProps={{ name: "contact" }}
          />
          <ErrorText field="contact" />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            {isClientAdmin ? "Assign to Associate Admin" : "Assign to Client Admin"}{!isEdit && <Req />}
          </label>
          <SelectOption
            label="" // avoid double labels if your component also shows label
            value={formData.clientAdminId}
            options={options}
            onChange={(e) => {
              const selectedId = e?.target?.value || e?.value || e;
              const sel = options.find((o) => o.value === selectedId);
              handleChange("clientAdminId", selectedId);
              handleChange("fullName", sel?.label || "");
              handleChange("email", sel?.email || "");
              handleChange("status", sel?.status || "");
            }}
            onBlur={() => handleBlur("clientAdminId")}
          />
          <ErrorText field="clientAdminId" />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Email{!isEdit && <Req />}
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={`custom_input ${errorClass("email")}`}
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
          />
          <ErrorText field="email" />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Licensed By {/* OPTIONAL — no star */}
          </label>
          <input
            name="licensedBy"
            placeholder="Licensed By"
            className="custom_input"
            value={formData.licensedBy}
            onChange={(e) => handleChange("licensedBy", e.target.value)}
            onBlur={() => setFieldTouched("licensedBy")}
          />
          {/* no error for optional */}
        </div>

        <div>
          <label className="block mb-1 font-medium">
            License Number{!isEdit && <Req />}
          </label>
          <input
            type="number"
            name="licenseNumber"
            min="1"
            placeholder="License Number"
            className={`custom_input ${errorClass("licenseNumber")}`}
            value={formData.licenseNumber}
            onChange={(e) => handleChange("licenseNumber", e.target.value)}
            onBlur={() => handleBlur("licenseNumber")}
          />
          <ErrorText field="licenseNumber" />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            License Referrer Link{!isEdit && <Req />}
          </label>
          <input
            name="referrerLink"
            placeholder="https://example.com/license"
            className={`custom_input ${errorClass("referrerLink")}`}
            value={formData.referrerLink}
            onChange={(e) => handleChange("referrerLink", e.target.value)}
            onBlur={() => handleBlur("referrerLink")}
          />
          <ErrorText field="referrerLink" />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Cookie Consent{!isEdit && <Req />}
          </label>
          <SelectOption
            label=""
            options={yesNoOptions}
            value={formData.cookieConsent}
            onChange={(e) => handleChange("cookieConsent", e.target.value)}
            onBlur={() => handleBlur("cookieConsent")}
          />
          <ErrorText field="cookieConsent" />
        </div>

      </div>

      <div className="mt-6">
        <label className="block mb-1 font-medium">
          Company Address{!isEdit && <Req />}
        </label>
        <textarea
          name="address"
          placeholder="Company Address"
          className={`custom_input w-full ${errorClass("address")}`}
          rows={3}
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          onBlur={() => handleBlur("address")}
        />
        <ErrorText field="address" />
      </div>

      <div className="mt-8 text-right">
        <button onClick={handleSubmit} className="btn btn-success">
          {isEdit ? "Update" : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default AddCompanyAccount;
