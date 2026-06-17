import { useState } from "react";

export default function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    await onCreate(name.trim());
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet small" onClick={(e) => e.stopPropagation()}>
        <h2>Nuevo proyecto</h2>
        <input
          autoFocus
          className="plain-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del corto, serie…"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        <div className="modal-actions">
          <button className="btn-primary" disabled={saving} onClick={handleCreate}>
            {saving ? "Creando…" : "Crear"}
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
