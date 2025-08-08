import { apiSlice } from "../slices/apiSlice";

export const themeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        
        // GET /theme/:companyId - Fetch theme settings for a specific company
        fetchThemeSettings: builder.query({
            query: (companyId) => ({
                url: `/settings/${companyId}`,
                method: "GET",
            }),
            providesTags: (result, error, companyId) => [
                { type: "Theme", id: companyId },
                "Theme"
            ],
        }),

        // GET /theme - Fetch all theme settings (Admin only)
        fetchAllThemeSettings: builder.query({
            query: () => ({
                url: "/settings",
                method: "GET",
            }),
            providesTags: ["Theme"],
        }),

        // POST /theme/save - Save or update theme settings
        saveThemeSettings: builder.mutation({
            query: (data) => ({
                url: "/settings/save",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { companyId }) => [
                { type: "Theme", id: companyId },
                "Theme"
            ],
        }),

        // POST /theme/reset - Reset theme to default settings
        resetThemeSettings: builder.mutation({
            query: (data) => ({
                url: "/settings/reset",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { companyId }) => [
                { type: "Theme", id: companyId },
                "Theme"
            ],
        }),

        // DELETE /theme/:companyId - Delete theme settings (will fallback to default)
        deleteThemeSettings: builder.mutation({
            query: (companyId) => ({
                url: `/settings/${companyId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, companyId) => [
                { type: "Theme", id: companyId },
                "Theme"
            ],
        }),

    }),
});

export const {
    useFetchThemeSettingsQuery,
    useFetchAllThemeSettingsQuery,
    useSaveThemeSettingsMutation,
    useResetThemeSettingsMutation,
    useDeleteThemeSettingsMutation,
    
    // Lazy queries for conditional fetching
    useLazyFetchThemeSettingsQuery,
    useLazyFetchAllThemeSettingsQuery,
} = themeApi;