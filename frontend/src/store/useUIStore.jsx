import { create } from "zustand";

const defaultTheme = "theme-dark-1";

// Apply default theme when app loads (just once)
if (typeof window !== "undefined") {
  document.body.classList.add(defaultTheme);
}

const useUIStore = create((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  theme: defaultTheme,

  setTheme: (theme) => {
    document.body.className = ""; // Clear all previous theme classes
    document.body.classList.add(theme); // Apply selected theme
    set({ theme });
  },
}));

export default useUIStore;
