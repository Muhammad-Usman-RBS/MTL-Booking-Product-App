import { apiSlice } from "../apiSlice";

export const postcodePriceApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        fetchAllPostcodePrices: builder.query({
            query: () => ({
                url: "/pricing/postcode-prices",
                method: "GET",
            }),
            providesTags: ["PostcodePrices"],
        }),

        // Widget Fetch (Public Widget)
        fetchAllPostcodePricesWidget: builder.query({
            query: (companyId) => ({
                url: `/pricing/widget/postcode-prices?companyId=${companyId}`,
                method: "GET",
            }),
            providesTags: ["PostcodePrices"],
        }),

        createPostcodePrice: builder.mutation({
            query: (data) => ({
                url: "/pricing/postcode-prices",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["PostcodePrices"],
        }),

        updatePostcodePrice: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/pricing/postcode-prices/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["PostcodePrices"],
        }),

        deletePostcodePrice: builder.mutation({
            query: (id) => ({
                url: `/pricing/postcode-prices/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["PostcodePrices"],
        }),
    }),
});

export const {
    useFetchAllPostcodePricesQuery,
    useCreatePostcodePriceMutation,
    useUpdatePostcodePriceMutation,
    useDeletePostcodePriceMutation,
    useFetchAllPostcodePricesWidgetQuery,
} = postcodePriceApi;
