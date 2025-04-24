  import axios from "axios";

  const API = axios.create({ baseURL: "http://localhost:5000/api" });

  export const loginUser = async (email, password) =>
    API.post("/auth/login", { email, password });

  export const registerUser = async (data) =>
    API.post("/auth/register", data);