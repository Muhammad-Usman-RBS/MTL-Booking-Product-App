import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slices/apiSlice';
import authReducer from './slices/authSlice';
import companyReducer from './slices/companySlice';
import timezoneReducer from './slices/timezoneSlice'; 
import currencyReducer from './slices/currencySlice';  

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    company: companyReducer,
    timezone: timezoneReducer,  // Add timezone reducer
    currency: currencyReducer,  // Add currency reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
