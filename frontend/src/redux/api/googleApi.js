import { apiSlice } from '../apiSlice';

export const googleApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        searchAirports: builder.query({
            query: (input) => ({
                url: "/google/search-airports",
                method: "GET",
                params: { input },
            }),
        }),
        searchLocations: builder.query({
            query: (input) => ({
                url: "/google/search-locations",
                method: "GET",
                params: { input },
            }),
        }),
    }),
    overrideExisting: false, // optional, but good to prevent warnings
});

export const {
    useSearchAirportsQuery,
    useSearchLocationsQuery,
    useLazySearchAirportsQuery,   // ✅ ADD THIS
    useLazySearchLocationsQuery,  // ✅ AND THIS
} = googleApi;
