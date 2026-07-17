import { useState } from "react";
import { Film } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const { signIn, signUp, resetPasswordForEmail } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await resetPasswordForEmail(email);
      setLoading(false);
      if (error) setError(error.message);
      else setInfo("Te hemos enviado un correo con un enlace para restablecer tu contraseña.");
      return;
    }

    const action = mode === "signin" ? signIn(email, password) : signUp(email, password);
    const { error } = await action;
    setLoading(false);
    if (error) setError(error.message);
    else if (mode === "signup") setInfo("Cuenta creada. Revisa tu correo para confirmar el acceso.");
  }

  function switchMode(next) {
    setMode(next);
    setError("");
    setInfo("");
  }

  return (
    <div className="app-shell">
      <div className="auth-screen">
        <div className="brand">
          <Film size={22} />
          <span>TABLERO DE PREPRODUCCIÓN</span>
        </div>
        <form className="modal-sheet auth-sheet" onSubmit={handleSubmit}>
          <h2>{mode === "signin" ? "Entrar" : mode === "signup" ? "Crear cuenta" : "Restablecer contraseña"}</h2>
          <label className="field">
            <span>Correo</span>
            <input type="email" required className="plain-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {mode !== "forgot" && (
            <label className="field">
              <span>Contraseña</span>
              <input
                type="password"
                required
                minLength={6}
                className="plain-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}
          {mode === "signin" && (
            <button type="button" className="link-button" onClick={() => switchMode("forgot")}>
              ¿Olvidaste tu contraseña?
            </button>
          )}
          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}
          <div className="modal-actions">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading
                ? "Un momento…"
                : mode === "signin"
                ? "Entrar"
                : mode === "signup"
                ? "Crear cuenta"
                : "Enviar enlace"}
            </button>
            {mode === "forgot" ? (
              <button type="button" className="btn-secondary" onClick={() => switchMode("signin")}>
                Volver a entrar
              </button>
            ) : (
              <button type="button" className="btn-secondary" onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}>
                {mode === "signin" ? "Crear cuenta nueva" : "Ya tengo cuenta"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
