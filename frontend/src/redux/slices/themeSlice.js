// redux/slices/themeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialColors = {
  bg: "#ffffff",
  text: "#000000",
  primary: "#1e90ff",
  hover: "#ff6347",
  active: "#32cd32",
};

// ⬇️ export so the store can merge persisted state safely
export const initialThemeState = {
  colors: initialColors,
  bookmarks: [],          // up to 3 pinned themes for navbar
  history: [],            // last 5 from server
  selectedThemeId: null,
  limitReached: false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState: initialThemeState, // ⬅️ use it here
  reducers: {
    setThemeColors(state, action) {
      state.colors = { ...state.colors, ...action.payload };
    },
    setThemeHistory(state, action) {
      state.history = action.payload || [];
      state.limitReached = state.history.length >= 5;
    },
    setSelectedThemeId(state, action) {
      state.selectedThemeId = action.payload;
    },
    setLimitReached(state, action) {
      state.limitReached = !!action.payload;
    },
    resetThemeState(state) {
      // reset everything (also clears bookmarks)
      Object.assign(state, initialThemeState);
    },
    toggleBookmarkTheme(state, action) {
      const { _id, themeSettings, label } = action.payload;
      const idx = state.bookmarks.findIndex((t) => t._id === _id);
      if (idx !== -1) {
        state.bookmarks.splice(idx, 1);
        return;
      }
      if (state.bookmarks.length >= 3) return;
      state.bookmarks.push({ _id, themeSettings, label: label || "" });
    },
    removeBookmarkById(state, action) {
      state.bookmarks = state.bookmarks.filter((t) => t._id !== action.payload);
    },
  },
});

export const {
  setThemeColors,
  setThemeHistory,
  setSelectedThemeId,
  setLimitReached,
  resetThemeState,
  toggleBookmarkTheme,
  removeBookmarkById,
} = themeSlice.actions;

export const selectThemeColors = (s) => s.theme.colors;
export const selectThemeHistory = (s) => s.theme.history;
export const selectThemeLimitReached = (s) => s.theme.limitReached;
export const selectSelectedThemeId = (s) => s.theme.selectedThemeId;
export const selectBookmarkedThemes = (s) => s.theme.bookmarks;

export default themeSlice.reducer;
