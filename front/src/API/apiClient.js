import axios from "axios";
import { API_BASE_URL } from "../Configs/apiBase";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const access = localStorage.getItem("access");
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // #region agent log
    if (String(response.config?.url || "").includes("admin")) {
      fetch("http://127.0.0.1:7338/ingest/fd34130a-6dd2-4769-91ac-074406a65388", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "09c3fc" },
        body: JSON.stringify({
          sessionId: "09c3fc",
          location: "apiClient.js:response",
          message: "admin API success",
          data: {
            url: response.config?.url,
            status: response.status,
            baseURL: response.config?.baseURL,
          },
          timestamp: Date.now(),
          hypothesisId: "A",
        }),
      }).catch(() => {});
    }
    // #endregion
    return response;
  },
  (error) => {
    // #region agent log
    fetch("http://127.0.0.1:7338/ingest/fd34130a-6dd2-4769-91ac-074406a65388", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "09c3fc" },
      body: JSON.stringify({
        sessionId: "09c3fc",
        location: "apiClient.js:error",
        message: "API request failed",
        data: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          status: error.response?.status,
          code: error.code,
          origin: window.location.origin,
        },
        timestamp: Date.now(),
        hypothesisId: "A",
      }),
    }).catch(() => {});
    // #endregion
    return Promise.reject(error);
  }
);

export default apiClient;
