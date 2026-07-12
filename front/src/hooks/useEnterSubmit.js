import { useCallback } from "react";

/**
 * Triggers handler when Enter is pressed inside a form-like container.
 * Skips textarea fields so multi-line input is not interrupted.
 */
export function useEnterSubmit(handler, { enabled = true } = {}) {
  return useCallback(
    (e) => {
      if (!enabled || e.key !== "Enter") return;
      if (e.target.tagName === "TEXTAREA") return;
      if (e.nativeEvent?.isComposing) return;
      e.preventDefault();
      handler();
    },
    [handler, enabled]
  );
}
