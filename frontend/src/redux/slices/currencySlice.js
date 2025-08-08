import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currency: "GBP",  
  isLoading: false,
  error: null,
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.currency = action.payload; 
      state.error = null;
      console.log('Currency updated in Redux:', action.payload);
    },
    setCurrencyLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setCurrencyError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    resetCurrencyState: () => {
      return initialState;
    },
  },
});

export const { 
  setCurrency, 
  setCurrencyLoading, 
  setCurrencyError, 
  resetCurrencyState 
} = currencySlice.actions;

export default currencySlice.reducer;
