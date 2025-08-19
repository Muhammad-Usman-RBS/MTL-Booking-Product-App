import { apiSlice } from "../slices/apiSlice";

export const themeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // In themeApi.js - REPLACE all endpoints with these corrected ones:
    fetchThemeSettings: builder.query({
      query: (companyId) => ({
        url: `/settings/${companyId}`,
        method: "GET",
      }),
      providesTags: (result, error, companyId) => [
        { type: "Theme", id: companyId },
        "Theme",
      ],
    }),

    saveThemeSettings: builder.mutation({
      query: (data) => ({
        url: "/settings/save",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { companyId }) => [
        { type: "Theme", id: companyId },
        "Theme",
      ],
    }),

    resetThemeSettings: builder.mutation({
      query: (data) => ({
        url: "/settings/reset",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { companyId }) => [
        { type: "Theme", id: companyId },
        "Theme",
      ],
    }),
    fetchThemeHistory: builder.query({
      query: (companyId) => ({
        url: `/settings/${companyId}/history`,
        method: "GET",
      }),
      providesTags: (result, error, companyId) => [
        { type: "Theme", id: companyId },
        "Theme",
      ],
    }),
    deleteThemeSettings: builder.mutation({
      query: ({ id }) => ({
        url: `/settings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ThemeHistory', 'ThemeSettings'],
    })
  }),
});

export const {
  useFetchThemeSettingsQuery,
  useFetchAllThemeSettingsQuery,
  useSaveThemeSettingsMutation,
  useResetThemeSettingsMutation,
  useLazyFetchThemeSettingsQuery,
  useLazyFetchAllThemeSettingsQuery,
  useFetchThemeHistoryQuery,
  useDeleteThemeSettingsMutation,
} = themeApi;
