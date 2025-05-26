import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanies(state, action) {
      state.list = action.payload;
    },
  },
});

export const { setCompanies } = companySlice.actions;
export default companySlice.reducer;
