import React, { ReactNode, createContext, useContext, useState } from "react";
import { Alert } from "react-native";
import { api, setAccessToken } from "../api/api";

type AuthUser = {
  id: number;
  email: string;
  nev: string;
  szerep?: string;
};

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const fetchUserProfile = async (token: string): Promise<AuthUser> => {
    try {
      const res = await api.get("/auth/profil", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profile = res.data?.user;
      if (!profile) {
        throw new Error("A profil valasz nem tartalmaz felhasznaloi adatokat.");
      }

      return {
        id: profile.id,
        email: profile.email,
        nev: profile.nev,
        szerep: profile.jogosultsag,
      };
    } catch (error) {
      console.error("Profile fetch failed", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, jelszo: password }, { withCredentials: true });
      const token = res.data.accessToken;

      setAccessToken(token);
      const userProfile = await fetchUserProfile(token);
      setUser(userProfile);
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "A bejelentkezes sikertelen volt. Kerd, probald meg ujra.";

      Alert.alert("Belepesi hiba", message);
      console.error("Login failed", error);
      return false;
    }
  };

  const logout = async () => {
    await api.post("/auth/logout", {}, { withCredentials: true });
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
