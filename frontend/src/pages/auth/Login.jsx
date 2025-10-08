import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoginUserMutation } from "../../redux/api/userApi";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/authSlice";
import UsePasswordToggle from "../../hooks/UsePasswordToggle";
import Icons from "../../assets/icons";

const Login = () => {
  const {
    type: passwordType,
    visible: passwordVisible,
    toggleVisibility: togglePasswordVisibility,
  } = UsePasswordToggle();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
  
    try {
      const data = await loginUser({ email, password }).unwrap();
      console.log("OTP navigation state:", { userId: data.userId, email });

      // ✅ If OTP is required → stop further execution
      if (data.requiresOtp) {
        toast.info("OTP sent to your email. Please verify.");
        navigate("/verify-otp", {
          state: { userId: data.userId, email },
        });
        return; // ✅ Add this line
      }
  
      // 🔐 OTP not required, log in directly
      dispatch(setUser(data));
      toast.success("Login successful!");
  
      setTimeout(() => {
        switch (data.role) {
          case "superadmin":
          case "clientadmin":
          case "demo":
            navigate("/dashboard/home");
            break;
          default:
            navigate("/dashboard/home");
        }
      }, 800);
    } catch (err) {
      const msg = err?.data?.message || "Login failed. Check your credentials.";
      toast.error(msg);
    }
  };
  

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="xyz@gmail.com"
          className="w-full px-4 py-2 bg-gray-50 border border-[var(--light-gray)] rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
        />
      </div>

      <div className="relative">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          type={passwordType}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          className="w-full px-4 py-2 pr-10 pt-2.5 bg-gray-50 border border-[var(--light-gray)] rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
        />
        <span
          className="absolute top-1/2 right-3 transform translate-y-1/4 cursor-pointer text-gray-500"
          onClick={togglePasswordVisibility}
        >
          {passwordVisible ? (
            <Icons.EyeOff size={18} />
          ) : (
            <Icons.Eye size={18} />
          )}
        </span>
      </div>

      <div className="text-center">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer text-white px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 disabled:opacity-50"
          style={{
            background:
              "linear-gradient(90deg, rgba(37,37,157,1) 0%, rgba(0,212,255,1) 100%)",
          }}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </div>

      <div className="text-center mt-3">
        <Link
          to="/forgot-password"
          className="text-blue-600 text-sm font-semibold underline cursor-pointer"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
};

export default Login;
