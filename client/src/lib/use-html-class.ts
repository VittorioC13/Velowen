import { useEffect } from "react";

// Adds a class to <html> while the calling page is mounted. The Studio pages use
// this to opt in to their full-screen canvas styles without leaking them into
// the scrolling marketing site.
export function useHtmlClass(className: string) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(className);
    return () => root.classList.remove(className);
  }, [className]);
}
