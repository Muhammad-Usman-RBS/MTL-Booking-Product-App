import { apiSlice } from "../apiSlice";

export const discountApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllDiscounts: builder.query({
            query: () => "/pricing/discount",
            providesTags: ["Discounts"],
        }),
        createDiscount: builder.mutation({
            query: (newData) => ({
                url: "/pricing/discount",
                method: "POST",
                body: newData,
            }),
            invalidatesTags: ["Discounts"],
        }),
        updateDiscount: builder.mutation({
            query: ({ id, updatedData }) => ({
                url: `/pricing/discount/${id}`,
                method: "PUT",
                body: updatedData,
            }),
            invalidatesTags: ["Discounts"],
        }),
        deleteDiscount: builder.mutation({
            query: (id) => ({
                url: `/pricing/discount/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Discounts"],
        }),
    }),
});

export const {
    useGetAllDiscountsQuery,
    useCreateDiscountMutation,
    useUpdateDiscountMutation,
    useDeleteDiscountMutation,
} = discountApi;
