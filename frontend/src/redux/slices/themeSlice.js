import { createSlice } from "@reduxjs/toolkit";
const initialColors = {};
export const initialThemeState = {
  colors: initialColors,
  bookmarks: [],          
  history: [],            
  selectedThemeId: null,
  limitReached: false,
  hydrated: false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState: initialThemeState, 
  reducers: {
    setAppliedTheme(state, action) {
      const { themeSettings, themeId } = action.payload;
      state.colors = { ...state.colors, ...themeSettings };
      state.selectedThemeId = themeId;
      state.hydrated = true;
    },
    setThemeColors(state, action) {
      state.colors = { ...state.colors, ...action.payload };
      state.hydrated = true;
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
  toggleBookmarkTheme,
  removeBookmarkById,
  setAppliedTheme,
} = themeSlice.actions;

export const selectThemeColors = (s) => s.theme.colors;
export const selectThemeHistory = (s) => s.theme.history;
export const selectThemeLimitReached = (s) => s.theme.limitReached;
export const selectSelectedThemeId = (s) => s.theme.selectedThemeId;
export const selectBookmarkedThemes = (s) => s.theme.bookmarks;
export const selectThemeHydrated = (s) => s.theme.hydrated;
export default themeSlice.reducer;
