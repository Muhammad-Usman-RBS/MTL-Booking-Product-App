import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Icons from "../../../assets/icons";
import IMAGES from "../../../assets/images";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../../redux/slices/authSlice";
import UsePasswordToggle from "../../../hooks/UsePasswordToggle";
import { useUpdateUserProfileMutation } from "../../../redux/api/userApi";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const EditProfile = () => {
  // Password toggle hooks
  const {
    type: newPasswordType,
    visible: newPasswordVisible,
    toggleVisibility: toggleNewPassword,
  } = UsePasswordToggle();

  const {
    type: currentPasswordType,
    visible: currentPasswordVisible,
    toggleVisibility: toggleCurrentPassword,
  } = UsePasswordToggle();

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    email: "",
    name: "",
    newPassword: "",
    currentPassword: "",
    // 🔹 Superadmin fields
    superadminCompanyName: "",
    superadminCompanyAddress: "",
    superadminCompanyPhoneNumber: "",
    superadminCompanyEmail: "",
  });

  const [profileImg, setProfileImg] = useState(null);
  const [preview, setPreview] = useState(null);

  const [updateProfile] = useUpdateUserProfileMutation();

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || "",
        name: user.fullName || "",
        newPassword: "",
        currentPassword: "",
        // 🔹 load superadmin fields only if available
        superadminCompanyName: user.superadminCompanyName || "",
        superadminCompanyAddress: user.superadminCompanyAddress || "",
        superadminCompanyPhoneNumber: user.superadminCompanyPhoneNumber || "",
        superadminCompanyEmail: user.superadminCompanyEmail || "",
      });
      if (user.profileImage) {
        setPreview(user.profileImage);
      }
    }
  }, [user]);

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
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("fullName", form.name);
      formData.append("newPassword", form.newPassword);
      formData.append("currentPassword", form.currentPassword);
      if (profileImg) formData.append("profileImage", profileImg);

      // 🔹 add superadmin fields if user is superadmin
      if (user.role === "superadmin") {
        formData.append("superadminCompanyName", form.superadminCompanyName);
        formData.append("superadminCompanyAddress", form.superadminCompanyAddress);
        formData.append("superadminCompanyPhoneNumber", form.superadminCompanyPhoneNumber);
        formData.append("superadminCompanyEmail", form.superadminCompanyEmail);
      }

      const updatedUser = await updateProfile(formData).unwrap();
      dispatch(setUser({ ...user, ...updatedUser }));
      setPreview(updatedUser.profileImage);

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error?.data?.message || "Something went wrong.");
    }
  };

  const handleReset = () => {
    if (user) {
      setForm({
        email: user.email || "",
        name: user.fullName || "",
        newPassword: "",
        currentPassword: "",
        superadminCompanyName: user.superadminCompanyName || "",
        superadminCompanyAddress: user.superadminCompanyAddress || "",
        superadminCompanyPhoneNumber: user.superadminCompanyPhoneNumber || "",
        superadminCompanyEmail: user.superadminCompanyEmail || "",
      });
      setProfileImg(null);
      setPreview(user.profileImage || null);
    }
  };

  return (
    <>
      <OutletHeading name="Profile Update" />

      <div className="inline-flex items-center gap-4 p-4 bg-sky-50 border-2 border-dashed border-sky-300 rounded-xl shadow-sm">
        <div className="flex flex-col items-center">
          <img
            src={preview || IMAGES.dummyImg}
            alt="Profile-Preview"
            className="w-24 h-24 rounded-full object-cover border border-sky-200 shadow-md"
          />
          <label
            htmlFor="profile-upload"
            className="btn btn-reset mt-3 cursor-pointer text-sm"
          >
            Upload Profile Image
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
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
      >
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={user.role !== "superadmin"}
            className={`custom_input ${user.role !== "superadmin" ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
              }`}
          />
          {user.role !== "superadmin" && (
            <p className="text-red-500 text-sm mt-1">Only a superadmin can change the email.</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Name
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

        {/* 🔹 Superadmin Extra Fields */}
        {user.role === "superadmin" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                name="superadminCompanyName"
                value={form.superadminCompanyName}
                onChange={handleChange}
                className="custom_input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company Address</label>
              <input
                type="text"
                name="superadminCompanyAddress"
                value={form.superadminCompanyAddress}
                onChange={handleChange}
                className="custom_input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company Phone</label>
              <input
                type="text"
                name="superadminCompanyPhoneNumber"
                value={form.superadminCompanyPhoneNumber}
                onChange={handleChange}
                className="custom_input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company Email</label>
              <input
                type="email"
                name="superadminCompanyEmail"
                value={form.superadminCompanyEmail}
                onChange={handleChange}
                className="custom_input"
              />
            </div>
          </>
        )}

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <div className="relative">
            <input
              type={newPasswordType}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="custom_input"
            />
            <span
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={toggleNewPassword}
            >
              {newPasswordVisible ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
            </span>
          </div>
        </div>

        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Current Password
          </label>
          <div className="relative">
            <input
              type={currentPasswordType}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              required
              className="custom_input"
            />
            <span
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={toggleCurrentPassword}
            >
              {currentPasswordVisible ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 col-span-1 md:col-span-2">
          <button type="button" onClick={handleReset} className="btn btn-cancel">
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