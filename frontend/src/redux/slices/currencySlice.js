import { createSlice } from '@reduxjs/toolkit';
import currencyOptions from "../../constants/constantscomponents/currencyOptions"

const initialState = {
  currency: "GBP",  
  symbol: "£",
  isLoading: false,
  error: null,
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      const selectedCurrency = action.payload;
      const selectedOption = currencyOptions.find(option => option.value === selectedCurrency);
      
      if (selectedOption) {
        state.currency = selectedCurrency;
        state.symbol = selectedOption.symbol; // Store the symbol
        state.error = null;
      }
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
