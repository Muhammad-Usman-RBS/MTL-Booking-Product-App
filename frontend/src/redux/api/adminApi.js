// src/redux/api/adminApi.js
import { apiSlice } from '../apiSlice';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all client admins
    fetchClientAdmins: builder.query({
      query: () => ({
        url: "/create-clientadmin",
        method: "GET",
      }),
      providesTags: ["ClientAdmins"],
    }),

    // Create new client admin
    createClientAdmin: builder.mutation({
      query: (payload) => ({
        url: "/create-clientadmin",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ClientAdmins"],
    }),

    // Update client admin
    updateClientAdmin: builder.mutation({
      query: ({ adminId, payload }) => ({
        url: `/create-clientadmin/${adminId}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["ClientAdmins"],
    }),

    // Delete client admin
    deleteClientAdmin: builder.mutation({
      query: (adminId) => ({
        url: `/create-clientadmin/${adminId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ClientAdmins"],
    }),

    // Update client admin status
    updateClientAdminStatus: builder.mutation({
      query: ({ adminId, newStatus }) => ({
        url: `/create-clientadmin/${adminId}`,
        method: "PUT",
        body: { status: newStatus },
      }),
      invalidatesTags: ["ClientAdmins"],
    }),
  }),
});

export const {
  useFetchClientAdminsQuery,
  useCreateClientAdminMutation,
  useUpdateClientAdminMutation,
  useDeleteClientAdminMutation,
  useUpdateClientAdminStatusMutation,
} = adminApi;
