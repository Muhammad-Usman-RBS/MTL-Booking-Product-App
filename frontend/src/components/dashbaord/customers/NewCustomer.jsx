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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    homeAddress: "",
    profile: "",
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
        profile: customerData.profile || "",
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
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        profile: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const customerPayload = {
      ...formData,
      companyId,
    };

    try {
      if (customerData && customerData._id) {
        if (typeof onSave === "function") {
          await onSave(customerData._id, customerPayload);
        } else {
          await updateCustomer({ id: customerData._id, formData: customerPayload }).unwrap();
          toast.success("Customer updated successfully");
        }
      } else {
        await createCustomer(customerPayload).unwrap();
        toast.success("Customer created successfully");
      }

      onClose();
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error: " + (err?.data?.message || "Unknown error"));
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      heading={customerData ? "Edit Customer" : "Add New Customer"}
    >
      <div className="text-sm w-96 px-4 pb-4 pt-4">
        {/* Image Upload Section */}
        <div className="flex items-center gap-5 mb-3">
          <div className="shrink-0">
            <img
              src={formData.profile || IMAGES.dummyImg}
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
          {/* Basic Fields */}
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
            "vatnumber" // ✅ Corrected to match schema
          ].map((field) => {
            const formattedLabel =
              field === "vatnumber"
                ? "VAT Number"
                : field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());

            return (
              <div key={field}>
                <label className="block mb-1 font-medium capitalize">
                  {formattedLabel}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="custom_input"
                  placeholder={formattedLabel}
                />
              </div>
            );
          })}

          {/* Phone Input */}
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

          {/* Dropdowns and Selects */}
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
