import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import axios from "axios";
import IMAGES from "../../../assets/images";

const EditProfile = () => {
  const [form, setForm] = useState({
    email: "",
    name: "",
    newPassword: "",
    currentPassword: "",
  });

  const [profileImg, setProfileImg] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setForm({
        email: user.email || "",
        name: user.fullName || "",
        newPassword: "",
        currentPassword: "",
      });

      // ✅ Set full image URL if saved
      if (user.profileImage) {
        setPreview(user.profileImage);  // full URL from backend
      }
    }
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(localStorage.getItem("user"))?.token;

      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("fullName", form.name);
      formData.append("newPassword", form.newPassword);
      formData.append("currentPassword", form.currentPassword);
      if (profileImg) formData.append("profileImage", profileImg);

      const response = await axios.put("http://localhost:5000/api/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      if (response.status === 200) {
        const updatedUser = response.data;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setPreview(updatedUser.profileImage);
        toast.success("Profile updated successfully!"); // ✅ Toast success
      }

    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Something went wrong."); // ✅ Toast error
    }
  };

  const handleReset = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setForm({
      email: user?.email || "",
      name: user?.fullName || "",
      newPassword: "",
      currentPassword: "",
    });
    setProfileImg(null);
    setPreview(null);
  };

  return (
    <>
      <OutletHeading name="Profile Update" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* / /  <img
          src={preview || IMAGES.profileimg}
          alt="Profile"
          className="w-22 h-22 rounded-full object-cover border"
        /> */}

        {preview ? (
          <img
            src={preview}
            alt="Profile-Preview"
            className="w-22 h-22 rounded-full object-cover border border-gray-300S"
          />
        ) : (
          <img
            src={IMAGES.dummyImg}
            alt="Profile-Preview"
            className="w-22 h-22 rounded-full object-cover border border-gray-300S"
          />
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

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
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

        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="custom_input"
          />
        </div>

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

        <div className="flex flex-wrap gap-3 col-span-1 md:col-span-2">
          <button type="button" onClick={handleReset} className="btn btn-reset">
            Reset
          </button>
          <button type="submit" className="btn btn-success">
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default EditProfile;




