
import { useEffect, useState } from "react";
import ThemeContext from "./ThemeContext";

function ThemeProvider({ children }) {
  // Load saved theme
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("heartcare-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  // Load saved language
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("hc-language") || "English";
  });

  // Load saved text size
  const [fontSize, setFontSize] = useState(() => {
    const savedSize = localStorage.getItem("hc-font-size");

    const validSizes = ["small", "normal", "large", "extra-large"];

    return validSizes.includes(savedSize) ? savedSize : "normal";
  });

  // Apply and save theme globally
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("heartcare-theme", theme);
  }, [theme]);

  // Apply and save language globally
  useEffect(() => {
    const root = document.documentElement;

    const languageCodes = {
      English: "en",
      Hindi: "hi",
      Bengali: "bn"
    };

    root.lang = languageCodes[language] || "en";
    root.dataset.hcLanguage = language;

    localStorage.setItem("hc-language", language);
  }, [language]);

  // Apply and save text size globally
  useEffect(() => {
    const root = document.documentElement;

    root.dataset.hcFontSize = fontSize;

    localStorage.setItem("hc-font-size", fontSize);
  }, [fontSize]);

  // Toggle light and dark mode
  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  };

  // All globally available settings
  const value = {
    theme,
    setTheme,
    toggleTheme,

    language,
    setLanguage,

    fontSize,
    setFontSize,

    // Alternative name for easier use
    textSize: fontSize,
    setTextSize: setFontSize
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
