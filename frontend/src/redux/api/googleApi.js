// redux/api/googleApi.js
import { apiSlice } from '../apiSlice';

export const googleApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        searchGooglePlaces: builder.query({
            query: (input) => ({
                url: "/google/autocomplete",
                method: "GET",
                params: { input },
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useSearchGooglePlacesQuery,
    useLazySearchGooglePlacesQuery,
} = googleApi;
