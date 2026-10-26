import { useEffect } from "react";

// ==========================================================
// VIVA TOPIC: Custom Hook (useDocumentTitle)
// Rule 1: Must start with "use"
// Rule 2: Can call built-in React hooks (like useEffect)
// Purpose: Reusable logic to update browser tab title
// ==========================================================

export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | MediSync Hospital`;
    } else {
      document.title = "MediSync Hospital";
    }
  }, [title]); // Runs again only when 'title' changes
}
