// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const apiSlice = createApi({
//   reducerPath: 'api',
//   baseQuery: fetchBaseQuery({
//     baseUrl: import.meta.env.VITE_API_BASE_URL,
//     prepareHeaders: (headers) => {
//       const token = JSON.parse(localStorage.getItem('user'))?.token;
//       if (token) headers.set('Authorization', `Bearer ${token}`);
//       return headers;
//     },
//   }),
//   tagTypes: ['User'],
//   endpoints: () => ({}),
// });

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include", // Cookies ko automatically bhejne aur receive karne ke liye
  }),
  tagTypes: ["User"],
  endpoints: () => ({}),
});
