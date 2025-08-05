import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  timezone: null,
};

const bookingSettingSlice = createSlice({
  name: "bookingSetting",
  initialState,
  reducers: {
    setTimezone: (state, action) => {
      state.timezone = action.payload;
    },
  },
});

export const { setTimezone } = bookingSettingSlice.actions;
export default bookingSettingSlice.reducer;
