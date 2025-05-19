// redux/api/googleApi.js
import { apiSlice } from '../apiSlice';

export const googleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Autocomplete Places
    searchGooglePlaces: builder.query({
      query: (input) => ({
        url: "/google/autocomplete",
        method: "GET",
        params: { input },
      }),
    }),

    // Distance Matrix API
    getDistance: builder.query({
      query: ({ origin, destination }) => ({
        url: "/google/distance",
        method: "GET",
        params: { origin, destination },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useSearchGooglePlacesQuery,
  useLazySearchGooglePlacesQuery,
  useGetDistanceQuery,
  useLazyGetDistanceQuery,
} = googleApi;
