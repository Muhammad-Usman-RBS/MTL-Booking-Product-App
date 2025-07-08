import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearUser(state) {
      state.user = null;
      localStorage.removeItem('user');
    },
    updateUserPermissions(state, action) {
      if (state.user) {
        state.user.permissions = action.payload.permissions;
        localStorage.setItem('user', JSON.stringify(state.user)); 
      }
    },
  },
});

export const { setUser, clearUser , updateUserPermissions  } = authSlice.actions;
export default authSlice.reducer;
