// src/redux/apis/widgetApi.js
import { apiSlice } from '../apiSlice';

export const widgetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    submitWidgetForm: builder.mutation({
      query: (payload) => ({
        url: '/widget/submit',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const { useSubmitWidgetFormMutation } = widgetApi;
