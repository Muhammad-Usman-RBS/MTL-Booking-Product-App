import axios from "axios";
const API = axios.create({ baseURL: "http://localhost:5000/api" });

// API.interceptors.request.use((config) => {
//   const token = JSON.parse(localStorage.getItem("user"))?.token;
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// ______________AUTH API'S________________________________________

export const loginUser = async (email, password) =>
  API.post("/auth/login", { email, password }, { withCredentials: true });

export const sendForgotPasswordOtp = async (email) =>
  API.post("/auth/forgot-password", { email });

export const resetPassword = async (email, otp, newPassword) =>
  API.post("/auth/new-password", { email, otp, newPassword });

export const updateUserProfile = async (formData, token) =>
  API.put("/auth/profile", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

// ______________ADMIN LIST API'S__________________________________

export const fetchClientAdmins = async (token) =>
  API.get("/create-clientadmin", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateClientAdminStatus = async (adminId, newStatus, token) =>
  API.put(
    `/create-clientadmin/${adminId}`,
    { status: newStatus },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const createClientAdmin = async (payload, token) =>
  API.post("/create-clientadmin", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateClientAdmin = async (adminId, payload, token) =>
  API.put(`/create-clientadmin/${adminId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteClientAdmin = async (adminId, token) =>
  API.delete(`/create-clientadmin/${adminId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ______________COMPANY ACCOUNTS API'S______________________________

export const getCompanyById = async (id, token) =>
  API.get(`/companies/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createCompany = async (formData, token) =>
  API.post("/companies", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

export const updateCompany = async (id, formData, token) =>
  API.put(`/companies/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

export const getClientAdmins = async (token) =>
  API.get("/create-clientadmin", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchAllCompanies = async (token) =>
  API.get("/companies", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const sendCompanyEmail = async (payload, token) =>
  API.post("/companies/send-company-email", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ______________GENERAL PRICING API'S______________________________
// Fetch general pricing data
export const getGeneralPricing = async (token) =>
  API.get("/pricing/general", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Create or update general pricing
export const updateGeneralPricing = async (formData, token) =>
  API.post(
    "/pricing/general",
    {
      ...formData,
      type: "general", // ensure the required type is included
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

