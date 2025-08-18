// import { configureStore } from "@reduxjs/toolkit";
// import { apiSlice } from "./slices/apiSlice";
// import authReducer from "./slices/authSlice";
// import companyReducer from "./slices/companySlice";
// import timezoneReducer from "./slices/timezoneSlice";
// import currencyReducer from "./slices/currencySlice";
// import themeReducer from "./slices/themeSlice";

// export const store = configureStore({
//   reducer: {
//     [apiSlice.reducerPath]: apiSlice.reducer,
//     auth: authReducer,
//     company: companyReducer,
//     timezone: timezoneReducer, // Add timezone reducer
//     currency: currencyReducer, // Add currency reducer
//     theme: themeReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(apiSlice.middleware),
// });

// redux/store.js (or wherever you configure the store)
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import authReducer from "./slices/authSlice";
import companyReducer from "./slices/companySlice";
import timezoneReducer from "./slices/timezoneSlice";
import currencyReducer from "./slices/currencySlice";
import themeReducer, { initialThemeState } from "./slices/themeSlice";

const THEME_PERSIST_KEY = "theme:persist";

// read from localStorage and build a partial preloadedState
function loadThemePreloadedState() {
  try {
    const raw = localStorage.getItem(THEME_PERSIST_KEY);
    if (!raw) return undefined;
    const saved = JSON.parse(raw);

    // Defensive merge: keep defaults for missing keys
    return {
      theme: {
        ...initialThemeState,
        ...saved,
        colors: { ...initialThemeState.colors, ...(saved?.colors || {}) },
      },
    };
  } catch {
    return undefined;
  }
}

// create the store with preloadedState for only the theme slice
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    company: companyReducer,
    timezone: timezoneReducer,
    currency: currencyReducer,
    theme: themeReducer,
  },
  preloadedState: loadThemePreloadedState(),
  middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
});

// persist the slice + re-apply CSS vars on every change
const applyThemeVars = (colors) => {
  try {
    const root = document.documentElement;
    ["bg", "text", "primary", "hover", "active"].forEach((k) => {
      if (colors?.[k]) root.style.setProperty(`--${k}`, colors[k]);
    });
  } catch {}
};

// Apply once on boot (covers initial paint)
applyThemeVars(store.getState().theme.colors);

// Subscribe to keep storage and CSS in sync
store.subscribe(() => {
  try {
    const { theme } = store.getState();
    // only store what you need
    const toSave = {
      colors: theme.colors,
      bookmarks: theme.bookmarks,
      selectedThemeId: theme.selectedThemeId,
    };
    localStorage.setItem(THEME_PERSIST_KEY, JSON.stringify(toSave));
    applyThemeVars(theme.colors);
  } catch {}
});

export default store;
