import { Film, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header({ subtitle }) {
  const { user, signOut } = useAuth();
  return (
    <header className="header-bar">
      <div className="brand">
        <Film size={20} />
        <span>TABLERO DE PREPRODUCCIÓN</span>
      </div>
      <div className="header-right">
        {subtitle && <div className="subtitle">{subtitle}</div>}
        {user && (
          <button className="link-danger" onClick={signOut}>
            <LogOut size={13} /> Salir ({user.email})
          </button>
        )}
      </div>
    </header>
  );
}
