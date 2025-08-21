
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

function loadThemePreloadedState() {
  try {
    const raw = localStorage.getItem(THEME_PERSIST_KEY);
    if (!raw) return undefined;
    const saved = JSON.parse(raw);

    return {
      theme: {
        ...initialThemeState,
        ...saved,
        colors: { ...initialThemeState.colors, ...(saved?.colors || {}) },
        bookmarks: saved?.bookmarks || [], 
      },
    };
  } catch {
    return undefined;
  }
}

export const autoLoadDefaultThemes = (dispatch, history) => {
  try {
    const currentState = store.getState().theme;

    if (
      currentState.bookmarks.length === 0 &&
      Array.isArray(history) &&
      history.length > 0
    ) {
      const defaultThemes = history.filter((theme) => theme.isDefault);

      defaultThemes.slice(0, 3).forEach((theme) => {
        dispatch({
          type: "theme/toggleBookmarkTheme",
          payload: {
            _id: theme._id,
            themeSettings: theme.themeSettings,
            label: theme.name || "Default Theme",
          },
        });
      });
    }
  } catch (error) {
    console.warn("Failed to auto-load default themes:", error);
  }
};

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

const applyThemeVars = (colors) => {
  try {
    const root = document.documentElement;
    ["bg", "text", "primary", "hover", "active"].forEach((k) => {
      if (colors?.[k]) root.style.setProperty(`--${k}`, colors[k]);
    });
  } catch {}
};

applyThemeVars(store.getState().theme.colors);

let previousBookmarks = store.getState().theme.bookmarks;
store.subscribe(() => {
  try {
    const { theme } = store.getState();

    const currentBookmarks = theme.bookmarks;
    if (
      JSON.stringify(previousBookmarks) !== JSON.stringify(currentBookmarks)
    ) {
      previousBookmarks = currentBookmarks;
    }
    const toSave = {
      colors: theme.colors,
      bookmarks: theme.bookmarks,
      selectedThemeId: theme.selectedThemeId,
      hydrated: theme.hydrated,
    };
    localStorage.setItem(THEME_PERSIST_KEY, JSON.stringify(toSave));
    applyThemeVars(theme.colors);
  } catch {}
});

export default store;
