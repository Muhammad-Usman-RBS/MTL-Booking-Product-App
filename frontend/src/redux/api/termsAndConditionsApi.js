import { apiSlice } from "../slices/apiSlice";

export const termsAndConditionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    createTermsAndConditions: builder.mutation({
      query: (formData) => ({
        url: `/terms-and-conditions/create`,
        method: "POST",
        body: formData,
      }),
    }),

    getTermsAndConditions: builder.query({
      query: () => ({
        url: `/terms-and-conditions/get`,
        method: "GET",
      }),
    }),

    updateTermsAndConditions: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/terms-and-conditions/update/${id}`,
        method: "PUT",
        body: formData,
      }),
    }),

    deleteTermsAndConditions: builder.mutation({
      query: ({ id }) => ({
        url: `/terms-and-conditions/delete/${id}`,
        method: "DELETE",
        body: { id },
      }),
    }),
    
  }),
});

export const {
  useCreateTermsAndConditionsMutation,
  useGetTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
  useDeleteTermsAndConditionsMutation,
} = termsAndConditionsApi;
