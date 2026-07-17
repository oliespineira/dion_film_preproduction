import { useState } from "react";
import { Film } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ResetPasswordScreen() {
  const { updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) setError(error.message);
    // On success, passwordRecovery clears automatically and App.jsx
    // switches back to the normal board.
  }

  return (
    <div className="app-shell">
      <div className="auth-screen">
        <div className="brand">
          <Film size={22} />
          <span>TABLERO DE PREPRODUCCIÓN</span>
        </div>
        <form className="modal-sheet auth-sheet" onSubmit={handleSubmit}>
          <h2>Elige una nueva contraseña</h2>
          <label className="field">
            <span>Nueva contraseña</span>
            <input
              type="password"
              required
              minLength={6}
              className="plain-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Repite la contraseña</span>
            <input
              type="password"
              required
              minLength={6}
              className="plain-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <div className="modal-actions">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Un momento…" : "Guardar contraseña"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => signOut()}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
