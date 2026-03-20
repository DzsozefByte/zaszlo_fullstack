import axios from "axios";

const buildFallbackBackendUrl = () => {
  const configuredWebUrl = process.env.EXPO_PUBLIC_WEBAPP_URL;

  if (configuredWebUrl) {
    try {
      const parsedWebUrl = new URL(configuredWebUrl);
      parsedWebUrl.port = "8080";
      return parsedWebUrl.toString().replace(/\/$/, "");
    } catch {
      // Hibas URL eseten visszaesunk a lokalis backend cimre.
    }
  }

  return "http://localhost:8080";
};

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL || buildFallbackBackendUrl(),
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh-token");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;

      try {
        await refreshToken();
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

async function refreshToken() {
  try {
    const response = await api.post("/auth/refresh-token", {}, { withCredentials: true });
    accessToken = response.data.accessToken;
    return accessToken;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Refresh token hiba:", err.response?.data || err.message);
    } else {
      console.error("Refresh token hiba:", err);
    }

    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch {
      // A sikertelen logout ne nyomja el az eredeti refresh hibat.
    }

    accessToken = null;
    throw err;
  }
}

export { api };
