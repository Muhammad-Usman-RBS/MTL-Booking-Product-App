import { apiSlice } from "../slices/apiSlice";

export const corporateCustomerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCorporateCustomer: builder.mutation({
      query: (formData) => ({
        url: "/corporate-customer/create-corporate-customer",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["CorporateCustomerList"],
    }),

    getCorporateCustomers: builder.query({
      query: () => ({
        url: "/corporate-customer/corporate-customers",
        method: "GET",
      }),
      providesTags: ["CorporateCustomerList"],
    }),

    getCorporateCustomer: builder.query({
      query: (id) => ({
        url: `/corporate-customer/corporate-customer/${id}`,
        method: "GET",
      }),
    }),

    updateCorporateCustomer: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/corporate-customer/corporate-customer/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["CorporateCustomerList"],
    }),

    deleteCorporateCustomer: builder.mutation({
      query: (id) => ({
        url: `/corporate-customer/corporate-customer/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CorporateCustomerList"],
    }),

    // New query to get customer by VAT number
    getCorporateCustomerByVat: builder.query({
      query: (vatnumber) => ({
        url: `/corporate-customer/by-vat/${encodeURIComponent(vatnumber)}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) =>
        result ? [{ type: "CorporateCustomer", id: result._id }] : [],
    }),

  }),
});

export const {
  useCreateCorporateCustomerMutation,
  useGetCorporateCustomersQuery,
  useGetCorporateCustomerByVatQuery,
  useGetCorporateCustomerQuery,
  useUpdateCorporateCustomerMutation,
  useDeleteCorporateCustomerMutation,
} = corporateCustomerApi;
