import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  timezone: "Europe/London",
};

const timezoneSlice = createSlice({
  name: 'timezone',
  initialState,
  reducers: {
    setTimezone: (state, action) => {
      state.timezone = action.payload;
    },
  },
});

export const { setTimezone } = timezoneSlice.actions;
export default timezoneSlice.reducer;
