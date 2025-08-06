import React, { useState, useEffect } from "react";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { useCreateCustomerMutation, useUpdateCustomerMutation } from "../../../redux/api/customerApi";
import { useSelector } from "react-redux";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "react-toastify";
import IMAGES from "../../../assets/images";

const NewCustomer = ({ isOpen, onClose, customerData, onSave }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    homeAddress: "",
    primaryContactName: "",
    primaryContactDesignation: "",
    website: "",
    city: "",
    stateCounty: "",
    postcode: "",
    country: "United Kingdom",
    locationsDisplay: "Yes",
    paymentOptionsBooking: [],
    paymentOptionsInvoice: "Pay Via Debit/Credit Card, Bank",
    invoiceDueDays: "1",
    invoiceTerms: "",
    passphrase: "",
    vatnumber: "",
  });

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  useEffect(() => {
    if (customerData) {
      setFormData({
        name: customerData.name || "",
        email: customerData.email || "",
        phone: customerData.phone || "",
        address: customerData.address || "",
        homeAddress: customerData.homeAddress || "",
        primaryContactName: customerData.primaryContactName || "",
        primaryContactDesignation: customerData.primaryContactDesignation || "",
        website: customerData.website || "",
        city: customerData.city || "",
        stateCounty: customerData.stateCounty || "",
        postcode: customerData.postcode || "",
        country: customerData.country || "United Kingdom",
        locationsDisplay: customerData.locationsDisplay || "Yes",
        paymentOptionsBooking: customerData.paymentOptionsBooking || [],
        paymentOptionsInvoice: customerData.paymentOptionsInvoice || "Pay Via Debit/Credit Card, Bank",
        invoiceDueDays: customerData.invoiceDueDays || "1",
        invoiceTerms: customerData.invoiceTerms || "",
        passphrase: customerData.passphrase || "",
        vatnumber: customerData.vatnumber || "",
      });
      setPreview(customerData.profile || "");
    }
  }, [customerData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("email", formData.email);
    payload.append("phone", formData.phone);
    payload.append("address", formData.address);
    payload.append("homeAddress", formData.homeAddress);
    payload.append("primaryContactName", formData.primaryContactName);
    payload.append("primaryContactDesignation", formData.primaryContactDesignation);
    payload.append("website", formData.website);
    payload.append("city", formData.city);
    payload.append("stateCounty", formData.stateCounty);
    payload.append("postcode", formData.postcode);
    payload.append("country", formData.country);
    payload.append("locationsDisplay", formData.locationsDisplay);
    payload.append("paymentOptionsInvoice", formData.paymentOptionsInvoice);
    payload.append("invoiceDueDays", formData.invoiceDueDays);
    payload.append("invoiceTerms", formData.invoiceTerms);
    payload.append("passphrase", formData.passphrase);
    payload.append("vatnumber", formData.vatnumber);
    payload.append("companyId", companyId);

    if (imageFile) {
      payload.append("profile", imageFile); // ✅ This is what backend expects
    }

    try {
      if (customerData && customerData._id) {
        await updateCustomer({ id: customerData._id, formData: payload }).unwrap();
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(payload).unwrap();
        toast.success("Customer created successfully");
      }

      onClose();
    } catch (err) {
      console.error("❌ Submission error:", err);
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} heading={customerData ? "Edit Customer" : "Add New Customer"}>
      <div className="text-sm w-96 px-4 pb-4 pt-4">
        {/* Image Upload Section */}
        <div className="flex items-center gap-5 mb-3">
          <div className="shrink-0">
            <img
              src={preview || IMAGES.dummyImg}
              alt="Profile"
              className="w-20 h-20 rounded-full border border-gray-300 object-cover shadow-sm"
            />
          </div>
          <div className="flex flex-col items-start gap-2">
            <label className="text-sm font-medium">Upload Profile Image</label>
            <label
              htmlFor="upload-image"
              className="px-4 py-1.5 rounded-md bg-gray-300 text-sm text-black cursor-pointer hover:bg-gray-400 transition"
            >
              Choose File
            </label>
            <input
              id="upload-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            "name",
            "email",
            "primaryContactName",
            "primaryContactDesignation",
            "website",
            "address",
            "homeAddress",
            "city",
            "stateCounty",
            "postcode",
            "invoiceTerms",
            "passphrase",
            "vatnumber"
          ].map((field) => {
            const label =
              field === "vatnumber"
                ? "VAT Number"
                : field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

            return (
              <div key={field}>
                <label className="block mb-1 font-medium">{label}</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="custom_input"
                  placeholder={label}
                />
              </div>
            );
          })}

          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <PhoneInput
              country="gb"
              inputClass="w-full custom_input"
              inputStyle={{ width: "100%" }}
              value={formData.phone}
              onChange={handlePhoneChange}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Country</label>
            <select name="country" value={formData.country} onChange={handleChange} className="custom_input">
              <option>United Kingdom</option>
              <option>United States</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Locations Display (Invoice)</label>
            <select name="locationsDisplay" value={formData.locationsDisplay} onChange={handleChange} className="custom_input">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Payment Options (Invoice)</label>
            <select name="paymentOptionsInvoice" value={formData.paymentOptionsInvoice} onChange={handleChange} className="custom_input">
              <option>Pay Via Debit/Credit Card, Bank</option>
              <option>PayPal</option>
              <option>Cash</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Invoice Due Days</label>
            <input
              type="number"
              name="invoiceDueDays"
              value={formData.invoiceDueDays}
              onChange={handleChange}
              className="custom_input"
              min="1"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="btn btn-reset"
              disabled={isCreating || isUpdating || !formData.name || !formData.email || !formData.phone}
            >
              {customerData
                ? isUpdating ? "Updating..." : "Update"
                : isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </CustomModal>
  );
};

export default NewCustomer;
