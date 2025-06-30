import { apiSlice } from "../apiSlice";

export const vouchersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // Admin: GET all vouchers
    getAllVouchers: builder.query({
      query: () => "/pricing/vouchers",
      providesTags: ["Vouchers"],
    }),

    // Admin: CREATE voucher
    createVoucher: builder.mutation({
      query: (newVoucher) => ({
        url: "/pricing/vouchers",
        method: "POST",
        body: newVoucher,
      }),
      invalidatesTags: ["Vouchers"],
    }),

    // Admin: UPDATE voucher
    updateVoucher: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/pricing/vouchers/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Vouchers"],
    }),

    // Admin: DELETE voucher
    deleteVoucher: builder.mutation({
      query: (id) => ({
        url: `/pricing/vouchers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vouchers"],
    }),

    // Public: GET voucher by code for widget
    getVoucherByCode: builder.query({
      query: (code) => `/pricing/vouchers/widget?code=${code}`,
    }),
  }),
});

export const {
  useGetAllVouchersQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useGetVoucherByCodeQuery,
} = vouchersApi;
