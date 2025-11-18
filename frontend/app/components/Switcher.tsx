"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function Switcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log(resolvedTheme);
    setMounted(true);
  }, []);

  if (!mounted) {
    // This prevents the mismatched "Light"/"Dark" text from being SSR-ed
    return (
      <button disabled style={{ minWidth: "60px" }}>
        ...
      </button>
    );
  }

  return (
    <div>
      {/*<button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {resolvedTheme === "dark" ? "Light" : "Dark"}
      </button>*/}
      {resolvedTheme === "dark" ? (
        <Sun size={22} onClick={() => setTheme("light")} />
      ) : (
        <Moon size={22} onClick={() => setTheme("dark")} />
      )}
    </div>
  );
}
