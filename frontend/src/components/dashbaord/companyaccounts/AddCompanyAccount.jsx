import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import countries from "../../../constants/constantscomponents/countries";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import IMAGES from "../../../assets/images";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { bookingPaymentOptions, yesNoOptions, invoicePaymentOptions } from "../../../constants/dashboardTabsData/data";
import { useGetCompanyByIdQuery, useCreateCompanyMutation, useUpdateCompanyMutation } from "../../../redux/api/companyApi";
import { useFetchClientAdminsQuery } from "../../../redux/api/adminApi";
import { BASE_API_URL } from "../../../config";

const AddCompanyAccount = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [profileImage, setProfileImage] = useState(null);
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
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
  });

  const {
    data: rawClientAdmins = [],
    isLoading
  } = useFetchClientAdminsQuery();

  const clientAdmins = rawClientAdmins
    .filter((admin) => admin.status !== "Deleted")
    .map((admin) => ({
      label: admin.fullName,
      value: admin._id,
      email: admin.email,
      status: admin.status,
    }));


  const { data: companyData } = useGetCompanyByIdQuery(id, { skip: !isEdit });
  const [createCompany] = useCreateCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();

  useEffect(() => {
    if (companyData) {
      setFormData(prev => ({
        ...prev,
        ...companyData,
        clientAdminId: companyData.clientAdminId || "",
      }));

      const imagePath = companyData.profileImage?.startsWith("/")
        ? companyData.profileImage
        : `/${companyData.profileImage}`;

      const finalImageUrl = `${BASE_API_URL}${imagePath}`;
      setProfileImage(finalImageUrl);
    }
  }, [companyData]);


  const handleProfileImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProfileImage(URL.createObjectURL(selectedFile));
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        const value = key === "dueDays" ? parseInt(formData[key] || "0") : formData[key];
        if (key !== "clientAdminId") {
          data.append(key, value);
        }
      });

      data.append("clientAdminId", formData.clientAdminId || "");
      data.append("clientAdminName", formData.fullName || "");
      data.append("clientAdminName", formData.status || "");

      if (file) {
        data.append("profileImage", file);
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
      console.error(err);
      toast.error(err?.data?.message || "❌ Something went wrong!");
    }
  };

  return (
    <div>
      <OutletHeading name={isEdit ? "Edit Company Account" : "Add Company Account"} />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <img
          src={profileImage || IMAGES.dummyImg}
          alt="Profile Preview"
          className="w-24 h-24 rounded-full object-cover border-gray-300 border-2"
        />
        <div>
          <label className="block font-medium text-sm mb-1">Upload Image</label>
          <label htmlFor="driver-upload" className="btn btn-edit mt-1 cursor-pointer inline-block">Choose File</label>
          <input id="driver-upload" type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <input placeholder="Company Name *" className="custom_input w-full" value={formData.companyName} onChange={(e) => handleChange("companyName", e.target.value)} />
        <input placeholder="Primary Contact Name*" className="custom_input w-full" value={formData.contactName} onChange={(e) => handleChange("contactName", e.target.value)} />
        <input type="email" placeholder="Email *" className="custom_input w-full" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
        <input placeholder="Website" className="custom_input w-full" value={formData.website} onChange={(e) => handleChange("website", e.target.value)} />
        <input placeholder="Primary Contact Designation *" className="custom_input w-full" value={formData.designation} onChange={(e) => handleChange("designation", e.target.value)} />
        <PhoneInput country={'gb'} inputClass="w-full custom_input" inputStyle={{ width: "100%" }} value={formData.contact} onChange={(value) => handleChange("contact", value)} />
        <input placeholder="City" className="custom_input w-full" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
        <input type="number" min="1" placeholder="Invoice Due Days *" className="custom_input w-full" value={formData.dueDays} onChange={(e) => handleChange("dueDays", e.target.value)} />
        <input placeholder="State/County" className="custom_input w-full" value={formData.state} onChange={(e) => handleChange("state", e.target.value)} />
        <input placeholder="Postcode/Zip Code" className="custom_input w-full" value={formData.zip} onChange={(e) => handleChange("zip", e.target.value)} />
        <input placeholder="Passphrase" className="custom_input w-full" value={formData.passphrase} onChange={(e) => handleChange("passphrase", e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="grid grid-cols-1 gap-4">
          <SelectOption
            label="Assign to ClientAdmin"
            value={formData.clientAdminId || ""}
            options={clientAdmins}
            onChange={(e) => {
              const selectedId = e?.target?.value || e?.value || e;
              const selectedAdmin = clientAdmins.find(admin => admin.value === selectedId);

              handleChange("clientAdminId", selectedId); // ✅ this is correct
              handleChange("fullName", selectedAdmin?.label || "");
              handleChange("email", selectedAdmin?.email || "");
              handleChange("status", selectedAdmin?.status);
            }}

          />
          <SelectOption options={countries} label="Country *" value={formData.country} onChange={(e) => handleChange("country", e.target.value)} />
          <SelectOption options={bookingPaymentOptions} label="Payment Option (Bookings) *" value={formData.bookingPayment} onChange={(e) => handleChange("bookingPayment", e.target.value)} />
          <SelectOption options={invoicePaymentOptions} label="Payment Options (Invoice Payment) *" value={formData.invoicePayment} onChange={(e) => handleChange("invoicePayment", e.target.value)} />
          <SelectOption options={yesNoOptions} label="Locations Display (Invoice) *" value={formData.showLocations} onChange={(e) => handleChange("showLocations", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <textarea placeholder="Address" className="custom_input w-full" rows={3} value={formData.address} onChange={(e) => handleChange("address", e.target.value)}></textarea>
          <textarea placeholder="Invoice Terms" className="custom_input w-full" rows={4} value={formData.invoiceTerms} onChange={(e) => handleChange("invoiceTerms", e.target.value)}></textarea>
        </div>
      </div>
      <div className="mt-8 text-right">
        <button onClick={handleSubmit} className="btn btn-reset">{isEdit ? "Update" : "Submit"}</button>
      </div>
    </div>
  );
};

export default AddCompanyAccount;
