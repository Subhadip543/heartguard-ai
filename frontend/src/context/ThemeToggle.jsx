
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./useTheme";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="global-theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <>
          <Moon size={18} />
          <span className="global-theme-label">Dark Mode</span>
        </>
      ) : (
        <>
          <Sun size={18} />
          <span className="global-theme-label">Light Mode</span>
        </>
      )}
    </button>
  );
}

export default ThemeToggle;
