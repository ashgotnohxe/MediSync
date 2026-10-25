import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | MediSync`;
    } else {
      document.title = "MediSync Hospital Portal";
    }
  }, [title]); // Runs again only when 'title' changes
}
