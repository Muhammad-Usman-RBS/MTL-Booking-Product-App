import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

// Components
import OutletBtnHeading from "../../../constants/constantscomponents/OutletBtnHeading";
import CompanyAccountForm from "./CompanyAccountForm";

// API hooks
import {
  useFetchClientAdminsQuery,
  useFetchAssociateAdminsQuery,
} from "../../../redux/api/adminApi";
import {
  useCreateCompanyMutation,
  useGetCompanyByIdQuery,
  useUpdateCompanyMutation,
} from "../../../redux/api/companyApi";

// Validators
import { validateCompanyAccount } from "../../../utils/validation/validators";

const AddCompanyAccount = () => {
  // Router hooks
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Redux state
  const user = useSelector((state) => state.auth?.user);
  const isClientAdmin = user?.role === "clientadmin";

  // Local states
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
    website: "",
    cookieConsent: "",
    address: "",
    clientAdminId: "",
    fullName: "",
    status: "",
  });

  // Validation states
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
      setFilePreviews((prev) => ({
        ...prev,
        [name]: file ? URL.createObjectURL(file) : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setFieldTouched(field);
    const { errors: e } = validateCompanyAccount(formData);
    setErrors(e);
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

  const handleSubmit = async () => {
    const { errors: e, isValid } = validateCompanyAccount(formData);
    setErrors(e);

    setManyTouched([
      "companyName",
      "tradingName",
      "email",
      "contact",
      "licenseNumber",
      "website",
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
  if (isEdit && isLoading)
    return <div className="text-center mt-10">Loading company data...</div>;

  return (
    <div>
      <OutletBtnHeading
        name={isEdit ? "Edit Company Account" : "Add Company Account"}
        buttonLabel="← Back to Users List"
        buttonLink="/dashboard/company-accounts/list"
        buttonBg="btn btn-back"
      />

      <CompanyAccountForm
        isEdit={isEdit}
        isClientAdmin={isClientAdmin}
        formData={formData}
        filePreviews={filePreviews}
        errors={errors}
        touched={touched}
        options={options}
        onInputChange={handleInputChange}
        onChange={handleChange}
        onBlur={handleBlur}
        onTouch={setFieldTouched}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AddCompanyAccount;
