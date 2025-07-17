import { apiSlice } from "../apiSlice";

export const invoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createInvoice: builder.mutation({
      query: (invoiceData) => ({
        url: "/invoice/create-invoice",
        method: "POST",
        body: invoiceData,
      }),
      invalidatesTags: ["Invoices"],
    }),
    getAllInvoices: builder.query({
      query: () => "/invoice/get-all-invoices",
      providesTags: ["Invoices"],
    }),
    updateInvoice: builder.mutation({
      query: ({ invoiceData, id }) => ({
        url: `/invoice/update-invoice/${id}`,
        method: "PUT",
        body: invoiceData,
      }),
      invalidatesTags: ["Invoices"],
    }),
    getInvoiceById: builder.query({
      query: (id) => ({
        url: `/invoice/get-invoice/${id}`,
        method: "GET",
      }),
      providesTags: [ "Invoices"],
     }),
  }),
});

export const {
  useCreateInvoiceMutation,
  useGetAllInvoicesQuery,
  useUpdateInvoiceMutation,
  useGetInvoiceByIdQuery,
} = invoiceApi;
