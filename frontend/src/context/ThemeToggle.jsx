
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./useTheme";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="global-theme-toggle"
      onClick={toggleTheme}
    >
      {theme === "light" ? (
        <>
          <Moon size={19} />
          <span>Dark Mode</span>
        </>
      ) : (
        <>
          <Sun size={19} />
          <span>Light Mode</span>
        </>
      )}
    </button>
  );
}

export default ThemeToggle;
