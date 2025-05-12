import { apiSlice } from '../apiSlice';

export const companyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all companies
    fetchAllCompanies: builder.query({
      query: () => ({
        url: "/companies",
        method: "GET",
      }),
      providesTags: ["Companies"],
    }),

    // Get a company by ID
    getCompanyById: builder.query({
      query: (id) => ({
        url: `/companies/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Companies", id }],
    }),

    // Create a company
    createCompany: builder.mutation({
      query: (formData) => ({
        url: "/companies",
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Companies"],
    }),

    // Update a company
    updateCompany: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/companies/${id}`,
        method: "PUT",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Companies"],
    }),

    // Send email
    sendCompanyEmail: builder.mutation({
      query: (payload) => ({
        url: "/companies/send-company-email",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useFetchAllCompaniesQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useSendCompanyEmailMutation,
} = companyApi;
