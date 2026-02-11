/* api.js
 Access token memóriában → header-be teszi minden kérésnél.
 Refresh token HttpOnly cookie-ban → a @react-native-cookies/cookies könyvtár 
 vagy a withCredentials: true biztosítja, hogy a /refresh hívásoknál automatikusan elküldődjön.
 Interceptor automatikusan frissíti az access tokent, ha 401 jön.
 Logout törli az access tokent és a cookie-t a szerver oldalon.
*/
// npm install @react-native-cookies/cookies axios

import axios from "axios";
// csak az install kell !! az import nem
//import { Cookies } from "@react-native-cookies/cookies";

let accessToken = null;

// ------------------- Access token kezelése -------------------
export function setAccessToken(token) {
  accessToken = token;
}

// ------------------- Axios instance -------------------
const api = axios.create({
  baseURL:  process.env.EXPO_PUBLIC_BACKEND_URL, //'http:10.210.71.116:8080', "http://192.168.1.65:8080/"
  withCredentials: true, // cookie-k kezelése
  timeout: 5000,
});

// Request interceptor – hozzáadja az access token-t
api.interceptors.request.use(
  async (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – ha 401, próbáljuk refresh-elni
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ------------------- Refresh token -------------------
async function refreshToken() {
  try {
    // fetch vagy axios POST /refresh, a cookie automatikusan elküldődik
    const response = await api.post("/auth/refresh", {}, { withCredentials: true });

    // új access token memóriába
    accessToken = response.data.accessToken;
    console.log("Access token frissítve:", accessToken);
    return accessToken;
  } catch (err) {
    console.error("Refresh token hiba:", err.response?.data || err.message);

    // logout a szerver oldalon, mert refresh token lejárt
    await api.post("/auth/logout", {}, { withCredentials: true });
    accessToken = null;
    throw err;
  }
}

export { api };
