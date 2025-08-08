import { apiSlice } from "../slices/apiSlice";

export const discountApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Authenticated - Get All Discounts for logged-in company
        getAllDiscounts: builder.query({
            query: () => "/pricing/discount",
            providesTags: ["Discounts"],
        }),

        // Authenticated - Create new discount
        createDiscount: builder.mutation({
            query: (newData) => ({
                url: "/pricing/discount",
                method: "POST",
                body: newData,
            }),
            invalidatesTags: ["Discounts"],
        }),

        // Authenticated - Update discount by ID
        updateDiscount: builder.mutation({
            query: ({ id, updatedData }) => ({
                url: `/pricing/discount/${id}`,
                method: "PUT",
                body: updatedData,
            }),
            invalidatesTags: ["Discounts"],
        }),

        // Authenticated - Delete discount by ID
        deleteDiscount: builder.mutation({
            query: (id) => ({
                url: `/pricing/discount/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Discounts"],
        }),

        // Public - Get Discounts by companyId (for widget use)
        getDiscountsByCompanyId: builder.query({
            query: (companyId) => `/pricing/discount/widget?companyId=${companyId}`,
        }),
    }),
});

export const {
    useGetAllDiscountsQuery,
    useCreateDiscountMutation,
    useUpdateDiscountMutation,
    useDeleteDiscountMutation,
    useGetDiscountsByCompanyIdQuery,
} = discountApi;
