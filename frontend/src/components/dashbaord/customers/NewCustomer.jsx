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
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        homeAddress: "",
        profile: "",
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
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      homeAddress: formData.homeAddress.trim(),
      profile: formData.profile,
      companyId,
    };

    try {
      if (customerData && customerData._id) {
        // Use the onSave callback if provided
        if (typeof onSave === "function") {
          await onSave(customerData._id, customerPayload); // correctly passes to DashboardCustomers handler
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
        <div className="flex items-center gap-5 mb-3">
          {/* Profile Preview */}
          <div className="shrink-0">
            <img
              src={formData.profile || IMAGES.dummyImg}
              alt="Profile"
              className="w-20 h-20 rounded-full border border-gray-300 object-cover shadow-sm"
            />
          </div>

          {/* Upload Input */}
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
            <label className="block mb-1 font-medium">Phone</label>
            <PhoneInput
              country="gb"
              inputClass="w-full custom_input"
              inputStyle={{ width: "100%" }}
              value={formData.phone}
              onChange={handlePhoneChange}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="btn btn-reset"
              disabled={
                isCreating || isUpdating ||
                !formData.name || !formData.email || !formData.phone
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
