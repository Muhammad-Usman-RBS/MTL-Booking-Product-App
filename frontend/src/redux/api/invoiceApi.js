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
  }),
});

export const { useCreateInvoiceMutation } = invoiceApi;
