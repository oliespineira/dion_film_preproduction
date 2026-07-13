import { useState } from "react";
import { X, Trash2, Mail } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "editor", label: "Editor — puede crear y editar todo" },
  { value: "viewer", label: "Solo lectura — puede ver pero no editar" },
];

function roleLabel(role) {
  if (role === "owner") return "Propietario";
  if (role === "editor") return "Editor";
  return "Solo lectura";
}

export default function ShareProjectModal({
  projectName,
  members,
  invites,
  isOwner,
  currentUserId,
  onClose,
  onInvite,
  onUpdateRole,
  onRemoveMember,
  onRevokeInvite,
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleInvite() {
    if (!email.trim()) return;
    setSending(true);
    setFeedback("");
    const result = await onInvite(email.trim(), role);
    setSending(false);
    if (result) {
      setFeedback(
        result.status === "added"
          ? `${result.email} ya tenía cuenta y se ha añadido al proyecto.`
          : `Invitación guardada para ${result.email} — se activará en cuanto se registre con ese correo.`
      );
      setEmail("");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-tag">COMPARTIR "{(projectName || "").toUpperCase()}"</span>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {isOwner && (
          <>
            <label className="field">
              <span>Invitar por correo</span>
              <div className="inline-row">
                <input
                  className="plain-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleInvite();
                  }}
                />
                <select className="field-select invite-role-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <div className="modal-actions invite-actions">
              <button className="btn-primary" disabled={!email.trim() || sending} onClick={handleInvite}>
                <Mail size={14} /> {sending ? "Enviando…" : "Invitar"}
              </button>
            </div>
            {feedback && <p className="muted-note">{feedback}</p>}
          </>
        )}

        <h3 className="section-title-inline">Miembros</h3>
        <ul className="member-list">
          {members.map((m) => (
            <li key={m.id} className="member-row">
              <span className="member-email">{m.email || m.user_id}</span>
              {isOwner && m.role !== "owner" ? (
                <select className="field-select member-role-select" value={m.role} onChange={(e) => onUpdateRole(m.user_id, e.target.value)}>
                  <option value="editor">Editor</option>
                  <option value="viewer">Solo lectura</option>
                </select>
              ) : (
                <span className="member-role-badge">{roleLabel(m.role)}</span>
              )}
              {isOwner && m.role !== "owner" && (
                <button className="icon-btn" onClick={() => onRemoveMember(m.id)} aria-label="Quitar miembro">
                  <Trash2 size={14} />
                </button>
              )}
              {!isOwner && m.user_id === currentUserId && (
                <button className="link-danger" onClick={() => onRemoveMember(m.id)}>
                  Salir
                </button>
              )}
            </li>
          ))}
        </ul>

        {invites.length > 0 && (
          <>
            <h3 className="section-title-inline">Invitaciones pendientes</h3>
            <ul className="member-list">
              {invites.map((inv) => (
                <li key={inv.id} className="member-row">
                  <span className="member-email">{inv.email}</span>
                  <span className="member-role-badge pending">Pendiente · {roleLabel(inv.role)}</span>
                  {isOwner && (
                    <button className="icon-btn" onClick={() => onRevokeInvite(inv.id)} aria-label="Revocar invitación">
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
