
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("heartcare-theme") === "dark";
  });

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem("heartcare-theme", theme);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((previousMode) => !previousMode);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-toggle-icon">
        {darkMode ? <Sun size={19} /> : <Moon size={19} />}
      </span>

      <span>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}

export default ThemeToggle;
