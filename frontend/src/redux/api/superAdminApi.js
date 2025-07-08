import { apiSlice } from "../apiSlice";

export const superAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateSuperAdminPermissions: builder.mutation({
      query: (permissions) => ({
        url: "/superadmin/superadmin-permissions",
        method: "PATCH",
        body: { permissions },
      }),
      invalidatesTags: ["SuperadminPermissions"],
    }),
  }),
});

export const {
  useUpdateSuperAdminPermissionsMutation,
} = superAdminApi;
