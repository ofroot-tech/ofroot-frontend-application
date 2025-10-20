"use client";

import { useEffect } from "react";

/**
 * useUnsavedChangesPrompt
 * Shows a native browser confirmation dialog when the user tries to close/refresh the tab
 * while there are unsaved changes. In App Router, we can't easily intercept internal route
 * changes without patching Link, so this focuses on unload/navigation away.
 */
export function useUnsavedChangesPrompt(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: BeforeUnloadEvent) => {
      // Standard prompt text is ignored by modern browsers, but setting returnValue triggers the dialog.
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [enabled]);
}
