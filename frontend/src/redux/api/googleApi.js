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

    // Google GET API KEY
    getMapKey: builder.query({
      query: () => ({
        url: "/google/map-key",
        method: "GET",
      }),
    }),

    // Postcode Suggestions
    searchPostcodeSuggestions: builder.query({
      query: (input) => ({
        url: "/google/postcode-suggestions",
        method: "GET",
        params: { input },
      }),
    }),

    // ✅ NEWLY ADDED: Geocode API
    geocode: builder.query({
      query: (address) => ({
        url: "/google/geocode",
        method: "GET",
        params: { address },
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
  useGetMapKeyQuery,
  useSearchPostcodeSuggestionsQuery,
  useLazySearchPostcodeSuggestionsQuery,
  useGeocodeQuery,
  useLazyGeocodeQuery,
} = googleApi;
