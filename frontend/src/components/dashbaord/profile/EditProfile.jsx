import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditProfile = () => {
  const [form, setForm] = useState({
    email: "mtlcontrol8@gmail.com",
    name: "Muhammad Usman",
    newPassword: "",
    currentPassword: "",
  });

  const [profileImg, setProfileImg] = useState(null);
  const [preview, setPreview] = useState(null);

  // Get initials from name
  const getInitials = (fullName) => {
    const parts = fullName.trim().split(" ");
    return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImg(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // handle form submission logic (e.g. API call)
    console.log("Form Data:", form);
    console.log("Profile Image File:", profileImg);
  
    toast.success("Profile updated successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  

  const handleReset = () => {
    setForm({
      email: "",
      name: "",
      newPassword: "",
      currentPassword: "",
    });
    setProfileImg(null);
    setPreview(null);
  };

  return (
    <>
      <div className="ps-2 pe-2 md:ps-6 md:pe-6">
        <h2 className="text-2xl font-bold mb-4">Profile Update</h2>
        <hr className="mb-6" />

        {/* Profile image section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {preview ? (
            <img
              src={preview}
              alt="Profile Preview"
              className="w-22 h-22 rounded-full object-cover border"
            />
          ) : (
            <div className="w-22 h-22 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
              {getInitials(form.name)}
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

        {/* Form fields in grid layout */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="custom_input"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="custom_input"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="custom_input"
            />
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              required
              className="custom_input"
            />
          </div>

          {/* Buttons - full width row */}
          <div className="flex flex-wrap gap-3 col-span-1 md:col-span-2">
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-reset"
            >
              Reset
            </button>
            <button type="submit" className="btn btn-success">
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditProfile;
