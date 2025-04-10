import React, { useState } from "react";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const options = ["Active", "Suspended", "Pending", "Deleted", "Delete Pending"];
 
const getInitials = (name) => {
  if (!name) return "N/A";
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials;
};

const NewCustomer = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    homeAddress: "",
    status: "Active",
    profile: null,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profile: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    console.log("New Customer:", formData);
    onClose();
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} heading="Add New Customer">
      <div className="text-sm px-4 pb-4 w-[500px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {preview ? (
            <img
              src={preview}
              alt="Profile Preview"
              className="w-22 h-22 rounded-full object-cover border"
            />
          ) : (
            <div className="w-22 h-22 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
              {getInitials(formData.name)}
            </div>
          )}

          <div>
            <label className="block font-medium text-sm mb-1">
              Upload Profile Image
            </label>

            <label htmlFor="profile-upload" className="btn btn-edit mt-1">
              Choose File
            </label>

            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-3">
          {/* Form fields here */}
          {["name", "email", "contact", "address", "homeAddress"].map(
            (field) => (
              <div key={field}>
                <label className="block mb-1 font-medium">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
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
            )
          )}

          <div>
            <label className="block font-medium text-sm mb-1">Status</label>
            <SelectOption width="full" options={options} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={handleSubmit} className="btn btn-reset">
              Create
            </button>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default NewCustomer;
