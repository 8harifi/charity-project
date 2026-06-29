// Relative /api works when the SPA is served by Django (same origin).
// Override with VITE_API_BASE_URL for Vite dev or external hosting.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";
