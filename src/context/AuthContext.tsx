import React, { createContext, useContext, useMemo } from "react";

interface AuthState {
  isAuthenticated: boolean;
}

const defaultState: AuthState = { isAuthenticated: true };

const AuthContext = createContext<AuthState>(defaultState);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const value = useMemo(() => defaultState, []);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  return ctx ?? defaultState;
}
