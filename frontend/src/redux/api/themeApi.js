import { apiSlice } from "../slices/apiSlice";

export const themeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // In themeApi.js - REPLACE all endpoints with these corrected ones:
    fetchThemeSettings: builder.query({
      query: (companyId) => ({
        url: `/settings/get-theme/${companyId}`,
        method: "GET",
      }),
      providesTags: (result, error, companyId) => [
        { type: "Theme", id: companyId },
        "Theme",
      ],
    }),

    saveThemeSettings: builder.mutation({
      query: (data) => ({
        url: "/settings/save-theme",
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
        url: `/settings/theme-history/${companyId}`,
        method: "GET",
      }),
      providesTags: (result, error, companyId) => [
        { type: "Theme", id: companyId },
        "Theme",
      ],
    }),
    deleteThemeSettings: builder.mutation({
      query: ({ id }) => ({
        url: `/settings/delete-theme/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ThemeHistory', 'ThemeSettings'],
    }),
    
    applyThemeSettings: builder.mutation({
      query: ({ companyId, themeId }) => ({
        url: `/settings/apply-them/${companyId}/${themeId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { companyId }) => [
        { type: "Theme", id: companyId },
        "Theme",
      ],
    }),
    fetchCurrentTheme: builder.query({
      query: (companyId) => ({
        // use params style:
        url: `/settings/current-theme/${companyId}`,
        method: "GET",
      }),
      providesTags: ["Theme"],
    }),
  }),
});

export const {
  useFetchThemeSettingsQuery,
  useSaveThemeSettingsMutation,
  useFetchThemeHistoryQuery,
  useApplyThemeSettingsMutation,
  useDeleteThemeSettingsMutation,
  useFetchCurrentThemeQuery
} = themeApi;
