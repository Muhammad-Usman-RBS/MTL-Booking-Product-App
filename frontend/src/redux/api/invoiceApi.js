import { apiSlice } from "../slices/apiSlice";

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
     deleteInvoiceById: builder.mutation({
      query: (id) => ({
        url: `/invoice/delete-invoice/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Invoices"],
    }),
    sendInvoiceEmail: builder.mutation({
      query: (emailData) => ({
        url: "/invoice/send-invoice-email",
        method: "POST",
        body: emailData,
      }),
      }),
  }),
});

export const {
  useCreateInvoiceMutation,
  useGetAllInvoicesQuery,
  useUpdateInvoiceMutation,
  useGetInvoiceByIdQuery,
  useDeleteInvoiceByIdMutation,
  useSendInvoiceEmailMutation
} = invoiceApi;
