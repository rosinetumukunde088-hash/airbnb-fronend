import { createContext, useState, type ReactNode } from "react";
import type { AuthState, AuthUser } from "../types";
import { authApi } from "../../../services/api";

interface AuthContextValue extends AuthState {
  token: string | null;
  loginWithToken: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateProfile: (payload: Partial<Pick<AuthUser, "name" | "username" | "phone" | "bio" | "avatar">>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("auth_user");
      // Only restore user if a real token exists alongside it
      if (storedToken && storedUser) return JSON.parse(storedUser) as AuthUser;
      return null;
    } catch { return null; }
  });

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );

  const loginWithToken = (authUser: AuthUser, jwt: string) => {
    setUser(authUser);
    setToken(jwt);
    localStorage.setItem("auth_user", JSON.stringify(authUser));
    localStorage.setItem("token", jwt);
  };

  const updateProfile = async (payload: Partial<Pick<AuthUser, "name" | "username" | "phone" | "bio" | "avatar">>) => {
    if (!user || !token) throw new Error("Not authenticated");
    const updated = await authApi.updateProfile(user.id, payload, token);
    const newUser: AuthUser = { ...user, ...payload, name: updated.name ?? user.name };
    setUser(newUser);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user && !!token, user, token, loginWithToken, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
