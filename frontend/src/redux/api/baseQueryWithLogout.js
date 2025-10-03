import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearUser } from "../slices/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: "include", // important for cookies
});

export const baseQueryWithLogout = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // Token expired or unauthorized
    api.dispatch(clearUser());
    window.location.href = "/login";
  }

  return result;
};
