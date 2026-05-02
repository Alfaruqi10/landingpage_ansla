const themeScript = `
  (() => {
    try {
      const storageKey = "ansla-theme";
      const storedTheme = window.localStorage.getItem(storageKey);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme =
        storedTheme === "dark" || storedTheme === "light"
          ? storedTheme
          : prefersDark
            ? "dark"
            : "light";

      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.dataset.theme = theme;
    } catch (error) {
      document.documentElement.classList.remove("dark");
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
