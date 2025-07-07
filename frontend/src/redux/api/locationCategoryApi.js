import { apiSlice } from "../apiSlice";

export const locationCategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all categories
    fetchAllLocationCategories: builder.query({
      query: () => ({
        url: "/settings/get-all-location-category",
        method: "GET",
      }),
      providesTags: ["LocationCategories"],
    }),

    // Get category by ID
    getLocationCategoryById: builder.query({
      query: (id) => ({
        url: `/settings/get-location-category/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "LocationCategories", id }],
    }),

    // Create category
    createLocationCategory: builder.mutation({
      query: (payload) => ({
        url: "/settings/create-location-category",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["LocationCategories"],
    }),

    // Update category
    updateLocationCategory: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/settings/update-location-category/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["LocationCategories"],
    }),

    // Delete category
    deleteLocationCategory: builder.mutation({
      query: (id) => ({
        url: `/settings/delete-location-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LocationCategories"],
    }),
  }),
});

export const {
  useFetchAllLocationCategoriesQuery,
  useGetLocationCategoryByIdQuery,
  useCreateLocationCategoryMutation,
  useUpdateLocationCategoryMutation,
  useDeleteLocationCategoryMutation,
} = locationCategoryApi;
