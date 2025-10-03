// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   user: JSON.parse(localStorage.getItem('user')) || null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setUser(state, action) {
//       state.user = action.payload;
//       localStorage.setItem('user', JSON.stringify(action.payload));
//     },
//     clearUser(state) {
//       state.user = null;
//       localStorage.removeItem('user');
//     },
//     updateUserPermissions(state, action) {
//       if (state.user) {
//         state.user.permissions = action.payload.permissions;
//         localStorage.setItem('user', JSON.stringify(state.user)); 
//       }
//     },
//   },
// });

// export const { setUser, clearUser , updateUserPermissions  } = authSlice.actions;
// export default authSlice.reducer;




import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // ✅ full user Redux state me hi rahega
  companyId: localStorage.getItem("companyId") || null, // ✅ sirf companyId persist karein
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      const userData = action.payload;
      state.user = userData;

      // ✅ Sirf companyId ko localStorage me rakho
      if (userData?.companyId) {
        localStorage.setItem("companyId", userData.companyId);
        state.companyId = userData.companyId;
      } else {
        localStorage.removeItem("companyId");
        state.companyId = null;
      }

      // 🧹 Purani user/token keys hata do agar pehle use hui thi
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    clearUser(state) {
      state.user = null;
      state.companyId = null;

      // 🧹 LocalStorage clean
      localStorage.removeItem("companyId");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    updateUserPermissions(state, action) {
      if (state.user) {
        state.user.permissions = action.payload.permissions;
        // ❌ localStorage me permissions save nahi karni — sirf Redux me update
      }
    },
  },
});

export const { setUser, clearUser, updateUserPermissions } = authSlice.actions;
export default authSlice.reducer;
