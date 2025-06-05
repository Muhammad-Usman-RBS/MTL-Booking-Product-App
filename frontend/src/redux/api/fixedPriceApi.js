import { apiSlice } from "../apiSlice";

export const pricingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 FIXED PRICES
    getAllFixedPrices: builder.query({
      query: () => "/pricing/fixed-prices",
      providesTags: ["FixedPrices"],
    }),

    createFixedPrice: builder.mutation({
      query: (data) => ({
        url: "/pricing/fixed-prices",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FixedPrices"],
    }),

    updateFixedPrice: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/pricing/fixed-prices/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["FixedPrices"],
    }),

    deleteFixedPrice: builder.mutation({
      query: (id) => ({
        url: `/pricing/fixed-prices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FixedPrices"],
    }),

    // 🔹 EXTRAS
    getAllExtras: builder.query({
      query: () => "/pricing/extras",
      providesTags: ["Extras"],
    }),

    createExtra: builder.mutation({
      query: (body) => ({
        url: "/pricing/extras",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Extras"],
    }),

    updateExtra: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pricing/extras/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Extras"],
    }),

    deleteExtra: builder.mutation({
      query: (id) => ({
        url: `/pricing/extras/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Extras"],
    }),

  }),
});

export const {
  // Fixed price hooks
  useGetAllFixedPricesQuery,
  useCreateFixedPriceMutation,
  useUpdateFixedPriceMutation,
  useDeleteFixedPriceMutation,

  // Extras hooks
  useGetAllExtrasQuery,
  useCreateExtraMutation,
  useUpdateExtraMutation,
  useDeleteExtraMutation,
} = pricingApi;
