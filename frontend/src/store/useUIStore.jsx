import { create } from "zustand";

const defaultTheme =
  typeof window !== "undefined"
    ? localStorage.getItem("app-theme") || "theme-dark-1"
    : "theme-dark-1";

if (typeof window !== "undefined") {
  document.body.className = "";
  document.body.classList.add(defaultTheme);
}

const useUIStore = create((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  theme: defaultTheme,

  setTheme: (theme) => {
    document.body.className = "";
    document.body.classList.add(theme);
    localStorage.setItem("app-theme", theme);
    set({ theme });
  },
}));

export default useUIStore;
