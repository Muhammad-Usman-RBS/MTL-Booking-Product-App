import { useEffect } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useSelector, useDispatch } from "react-redux";
import { useFetchCurrentThemeQuery, useFetchThemeHistoryQuery } from "../redux/api/themeApi";
import { setSelectedThemeId, setThemeColors, selectBookmarkedThemes, selectThemeHistory, toggleBookmarkTheme, setThemeHistory } from "../redux/slices/themeSlice";

const applyThemeVars = (theme) => {
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme).forEach(([k, v]) =>
    root.style.setProperty(`--${k}`, v)
  );
};

const ThemeBootstrap = () => {
  const user = useSelector((s) => s.auth.user);
  const companyId = user?.companyId;
  const userRole = user?.role;
  const dispatch = useDispatch();

  const shouldFetchTheme =
    companyId && ["clientadmin", "driver", "customer"].includes(userRole);

  const { data: currentThemeRes } = useFetchCurrentThemeQuery(
    shouldFetchTheme ? companyId : skipToken
  );
  const { data: historyRes, isSuccess: hasHistory } = useFetchThemeHistoryQuery(
    shouldFetchTheme ? companyId : skipToken
  );
  useEffect(() => {
    if (hasHistory && Array.isArray(historyRes?.data)) {
      dispatch(setThemeHistory(historyRes.data));
    }
  }, [hasHistory, historyRes, dispatch]);

  useEffect(() => {
    const t = currentThemeRes?.theme;
    if (!t?.themeSettings) return;

    dispatch(setSelectedThemeId(t.isDefault ? null : t._id));
    dispatch(setThemeColors(t.themeSettings));
    applyThemeVars(t.themeSettings);
  }, [currentThemeRes, dispatch]);

  const existingBookmarks = useSelector(selectBookmarkedThemes);
  const history = useSelector(selectThemeHistory);

  useEffect(() => {
    if (!currentThemeRes?.theme) return;

    const defaultThemes = history.filter((theme) => theme.isDefault);

    if (existingBookmarks.length === 0 && defaultThemes.length > 0) {
      defaultThemes.slice(0, 3).forEach((theme) => {
        dispatch(
          toggleBookmarkTheme({
            _id: theme._id,
            themeSettings: theme.themeSettings,
            label: theme.name || "Default Theme",
          })
        );
      });
    }
  }, [currentThemeRes, dispatch, existingBookmarks, history]);

  return null;
};

export default ThemeBootstrap;
