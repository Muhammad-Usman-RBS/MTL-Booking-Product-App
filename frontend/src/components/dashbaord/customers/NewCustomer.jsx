import React, { useState, useEffect } from "react";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "../../../redux/api/customerApi";
import { useSelector } from "react-redux";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "react-toastify";

const NewCustomer = ({ isOpen, onClose, customerData, onSave }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    homeAddress: "",
    status: "Active",
    profile: "",
  });

  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  useEffect(() => {
    if (customerData) {
      setFormData({
        name: customerData.name || "",
        email: customerData.email || "",
        contact: customerData.contact || "",
        address: customerData.address || "",
        homeAddress: customerData.homeAddress || "",
        status: customerData.status || "Active",
        profile: customerData.profile || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        contact: "",
        address: "",
        homeAddress: "",
        status: "Active",
        profile: "",
      });
    }
  }, [customerData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, contact: value }));
  };

 const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setImageFile(file); // Save the file for later (submit time)

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

    if (!formData.name.trim() || !formData.email.trim() || !formData.contact.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const customerPayload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      contact: formData.contact.trim(),
      address: formData.address.trim(),
      homeAddress: formData.homeAddress.trim(),
      status: formData.status.trim(),
profile: imageFile ? formData.profile : customerData?.profile || "",
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
        <form onSubmit={handleSubmit} className="space-y-3">

          {["name", "email", "address", "homeAddress"].map((field) => (
            <div key={field}>
              <label className="block mb-1 font-medium capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="custom_input"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            </div>
          ))}

          <div>
            <label className="block mb-1 font-medium">Contact</label>
            <PhoneInput
              country="gb"
              inputClass="w-full custom_input"
              inputStyle={{ width: "100%" }}
              value={formData.contact}
              onChange={handlePhoneChange}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="custom_input"
            />
            {formData.profile && (
              <div className="mt-2">
                <img
                  src={formData.profile}
                  alt="Profile Preview"
                  className="w-20 h-20 rounded-full border object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-medium text-sm mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="custom_input"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="btn btn-reset"
              disabled={
                isCreating || isUpdating ||
                !formData.name || !formData.email || !formData.contact
              }
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
