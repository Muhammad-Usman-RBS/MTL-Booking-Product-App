import { apiSlice } from "../slices/apiSlice";

export const coverageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCoverage: builder.mutation({
      query: (payload) => ({
        url: "/settings/create-coverage",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Coverage"],
    }),

    getAllCoverages: builder.query({
        query: (companyId) => ({
          url: `/settings/get-all-coverages?companyId=${companyId}`,
          method: "GET",
        }),
        providesTags: ["Coverage"],
      }),

    getCoverageById: builder.query({
      query: (id) => ({
        url: `/settings/get-single-coverage/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Coverage", id }],
    }),

    updateCoverage: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/settings/update-coverage/${id}`,
        method: "PUT",
        body: updatedData,
      }),
    }),

    deleteCoverage: builder.mutation({
      query: (id) => ({
        url: `/settings/delete-coverage/${id}`,
        method: "DELETE",
      }),
    }),
  }),
  tagTypes: ["Coverage"],
});
export const {
  useCreateCoverageMutation,
  useGetAllCoveragesQuery,
  useGetCoverageByIdQuery,
  useUpdateCoverageMutation,
  useDeleteCoverageMutation,
} = coverageApi;
