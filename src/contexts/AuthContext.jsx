import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getValidSession, loadSession, saveSession, signIn, signOut } from "../api/auth-Supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());

  const login = useCallback(async ({ email, password, remember }) => {
    const newSession = await signIn({ email, password });
    saveSession(newSession, remember);
    setSession(newSession);
    return newSession.user;
  }, []);

  const logout = useCallback(async () => {
    const old = session;
    saveSession(null);
    setSession(null);
    await signOut(old);
  }, [session]);

  
  const getSession = useCallback(async () => {
    try {
      const valid = await getValidSession(session);
      if (valid !== session) setSession(valid);
      return valid;
    } catch (err) {
      saveSession(null);
      setSession(null);
      throw err;
    }
  }, [session]);

  const value = useMemo(
    () => ({ user: session?.user ?? null, isLoggedIn: Boolean(session), login, logout, getSession }),
    [session, login, logout, getSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
