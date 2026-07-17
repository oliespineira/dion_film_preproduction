import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // true while the user arrived via a "reset password" email link and
  // hasn't set a new password yet — the app shows ResetPasswordScreen
  // instead of the normal board until this clears.
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  function signUp(email, password) {
    return supabase.auth.signUp({ email, password });
  }
  function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  }
  function signOut() {
    return supabase.auth.signOut();
  }
  // Sends the "reset your password" email. redirectTo must be added to
  // Authentication > URL Configuration > Redirect URLs in the Supabase
  // dashboard, or the link will fail to log the user back in.
  function resetPasswordForEmail(email) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
  }
  // Sets a new password for the currently-authenticated session (used
  // both for the "forgot password" recovery flow and for a normal
  // "change my password" action from within the app).
  async function updatePassword(newPassword) {
    const result = await supabase.auth.updateUser({ password: newPassword });
    if (!result.error) setPasswordRecovery(false);
    return result;
  }

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    passwordRecovery,
    signUp,
    signIn,
    signOut,
    resetPasswordForEmail,
    updatePassword,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
