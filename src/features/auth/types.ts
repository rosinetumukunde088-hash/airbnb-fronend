export type UserRole = "GUEST" | "HOST" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  username?: string;
  phone?: string;
  bio?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
}
