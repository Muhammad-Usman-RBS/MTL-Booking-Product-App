import { apiSlice } from "../apiSlice";

export const vouchersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET All Vouchers
        getAllVouchers: builder.query({
            query: () => "/pricing/vouchers",
            providesTags: ["Vouchers"],
        }),

        // CREATE Voucher
        createVoucher: builder.mutation({
            query: (newVoucher) => ({
                url: "/pricing/vouchers",
                method: "POST",
                body: newVoucher,
            }),
            invalidatesTags: ["Vouchers"],
        }),

        // UPDATE Voucher
        updateVoucher: builder.mutation({
            query: ({ id, updatedData }) => ({
                url: `/pricing/vouchers/${id}`,
                method: "PUT",
                body: updatedData,
            }),
            invalidatesTags: ["Vouchers"],
        }),

        // DELETE Voucher
        deleteVoucher: builder.mutation({
            query: (id) => ({
                url: `/pricing/vouchers/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Vouchers"],
        }),
    }),
});

export const {
    useGetAllVouchersQuery,
    useCreateVoucherMutation,
    useUpdateVoucherMutation,
    useDeleteVoucherMutation,
} = vouchersApi;
