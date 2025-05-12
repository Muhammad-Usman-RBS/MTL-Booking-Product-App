import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useResetPasswordMutation } from "../../redux/api/userApi"; // ✅ RTK hook

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const email = location.state?.email || "";

  const [resetPassword] = useResetPasswordMutation(); // ✅ RTK Mutation

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return toast.error("Please fill all fields");

    try {
      await resetPassword({ email, otp, newPassword }).unwrap(); // ✅ Clean RTK way
      toast.success("Password reset successful! You can now log in.");
      navigate("/");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reset password");
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">OTP Code</label>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="custom_input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="custom_input"
        />
      </div>

      <button type="submit" className="btn btn-success w-full">
        Reset Password
      </button>
    </form>
  );
};

export default ResetPassword;
