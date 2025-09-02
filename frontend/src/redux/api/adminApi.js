import { apiSlice } from '../slices/apiSlice';

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

    // 🔥 NEW: Fetch associate admins for a given clientadmin (createdBy) and optional companyId filter
    // Backend route example options (pick the one you actually implemented):
    //  - /admins/associates?createdBy=<id>&companyId=<id>
    //  - /get-associate-admins?createdBy=<id>&companyId=<id>
    // If your baseQuery supports "params", you can use { params: { createdBy, companyId } }.
    fetchAssociateAdmins: builder.query({
      query: ({ createdBy, companyId }) => {
        const q = new URLSearchParams();
        if (createdBy) q.set("createdBy", createdBy);
        if (companyId) q.set("companyId", companyId);
        return {
          url: `/admins/associates?${q.toString()}`, // <-- adjust path if your server uses a different one
          method: "GET",
        };
      },
      providesTags: ["AssociateAdmins"],
    }),

    getAllUsers: builder.query({
      query: () => ({
        url: "get-All-Users",
        method: "GET",
      }),
      providesTags: ["Users"]
    }),

    // Get all drivers
    adminGetAllDrivers: builder.query({
      query: () => ({
        url: "/get-all-drivers",
        method: "GET",
      }),
      providesTags: ["Drivers"],
    }),

    // Get all customers
    getAllCustomers: builder.query({
      query: () => ({
        url: "/get-all-customers",
        method: "GET",
      }),
      providesTags: ["Customers"],
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

    // Create Customer Via Widget
    createCustomerViaWidget: builder.mutation({
      query: (payload) => ({
        url: "/create-customer",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useFetchClientAdminsQuery,
  useFetchAssociateAdminsQuery, // ⬅️ NEW EXPORT
  useCreateClientAdminMutation,
  useUpdateClientAdminMutation,
  useDeleteClientAdminMutation,
  useUpdateClientAdminStatusMutation,
  useAdminGetAllDriversQuery,
  useGetAllCustomersQuery,
  useCreateCustomerViaWidgetMutation,
} = adminApi;
