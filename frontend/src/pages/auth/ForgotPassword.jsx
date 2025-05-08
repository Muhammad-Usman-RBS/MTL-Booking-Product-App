import React, { useState } from "react";
import { toast } from "react-toastify";
import { sendForgotPasswordOtp } from "../../utils/authService";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");

    try {
      await sendForgotPasswordOtp(email);
      // await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      toast.success("OTP sent to your email!");
      navigate("/new-password", { state: { email } }); // Send email to ResetPassword page
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <form onSubmit={handleSendOtp} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="custom_input"
        />
      </div>
      <button type="submit" className="btn btn-success w-full">
        Send OTP
      </button>
    </form>
  );
};

export default ForgotPassword;
