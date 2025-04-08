// EditCustomer.jsx
import React, { useState } from "react";
import CustomModal from "../../../constants/CustomModal";
import SelectOption from "../../../constants/SelectOption";

const options = ["Active", "Suspended", "Pending", "Deleted", "Delete Pending"];

const EditCustomer = ({ customer, onClose }) => {
  const [formData, setFormData] = useState({ ...customer });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (value) => {
    setFormData({ ...formData, status: value });
  };

  const handleSubmit = () => {
    console.log("Updated Customer:", formData);
    onClose();
  };

  return (
    <CustomModal
      isOpen={!!customer}
      onClose={onClose}
      heading={`Edit ${formData.name}`}
    >
      <div className="text-sm px-4 pb-4 w-[500px]">
        <div className="flex flex-col items-center mb-4">
          <img
            src={formData?.profile || "/default-user.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full border"
          />

          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" className="form-checkbox" />
            Delete Profile Picture
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="custom_input"
              placeholder="Name"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="custom_input"
              placeholder="Email"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Contact</label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="custom_input"
              placeholder="Contact"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              className="custom_input"
              placeholder="Address"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Home Address</label>
            <input
              type="text"
              name="homeAddress"
              value={formData.homeAddress || ""}
              onChange={handleChange}
              className="custom_input"
              placeholder="Home Address"
            />
          </div>

          <div>
            <label className="block font-medium text-sm mb-1">Status</label>
            <SelectOption
              width="full"
              options={options}
              value={formData.status}
              onChange={handleSelectChange}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleSubmit}
              className="btn btn-reset"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default EditCustomer;
