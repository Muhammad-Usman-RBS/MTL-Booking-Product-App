import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        { withCredentials: true }
      );

      localStorage.setItem('user', JSON.stringify(data));
      toast.success("Login successful!");

      setTimeout(() => {
        switch (data.role) {
          case 'superadmin':
            navigate('/dashboard/home');
            break;
          case 'clientadmin':
            navigate('/dashboard/home');
            break;
          case 'driver':
            navigate('/dashboard/driver');
            break;
          case 'demo':
            navigate('/dashboard/home');   // 🛠️ Now demo will also land on dashboard/home
            break;
          case 'manager':
            navigate('/dashboard/home');   // 🛠️ Optional: for future-proofing if manager role comes
            break;
          default:
            navigate('/dashboard/home');   // 🛠️ Safer default fallback
        }
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Check your credentials.";
      toast.error(msg);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="xyz@gmail.com"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className="w-full px-4 py-2 pt-2.5 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="w-full cursor-pointer text-white px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
            style={{
              background: "linear-gradient(90deg, rgba(37,37,157,1) 0%, rgba(0,212,255,1) 100%)",
            }}
          >
            Log In
          </button>
        </div>
        <div className="text-center mt-3">
          <Link to="/forgot-password" className="text-blue-600 text-sm font-semibold underline cursor-pointer">
            Forgot your password?
          </Link>
        </div>
      </form>
    </>
  );
};

export default Login;
