import { createSlice } from "@reduxjs/toolkit";

const getSystemTheme = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  return "light"; // Default theme
};

const initialState = {
  theme: getSystemTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
  },
});

export const { toggleTheme, setTheme, setSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;
