import { useState } from "react";
import { X } from "lucide-react";
import { ROLE_TYPES } from "../utils/helpers";

export default function CallTimeModal({ callTime, characters, onClose, onSave, onDelete }) {
  const isNew = !callTime.id;
  const [form, setForm] = useState(callTime);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, character_id: form.character_id || null };
    await onSave(payload);
    setSaving(false);
  }

  const canSave = form.person_name && form.person_name.trim().length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-tag">CITACIÓN</span>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <label className="field">
          <span>Nombre</span>
          <input autoFocus value={form.person_name} onChange={(e) => update("person_name", e.target.value)} placeholder="Nombre de la persona" />
        </label>

        <div className="field">
          <span>Tipo</span>
          <div className="toggle-group">
            {ROLE_TYPES.map((r) => (
              <button key={r} className={form.role_type === r ? "toggle-btn active" : "toggle-btn"} onClick={() => update("role_type", r)}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {form.role_type === "Actor" && (
          <label className="field">
            <span>Personaje que interpreta (opcional)</span>
            <select className="field-select" value={form.character_id || ""} onChange={(e) => update("character_id", e.target.value)}>
              <option value="">— Sin especificar —</option>
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || "Sin nombre"}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="field">
          <span>Hora de citación</span>
          <input value={form.call_time} onChange={(e) => update("call_time", e.target.value)} placeholder="07:30" />
        </label>

        <label className="field">
          <span>Notas</span>
          <textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </label>

        <div className="modal-actions">
          <button className="btn-primary" disabled={!canSave || saving} onClick={handleSave}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
          {!isNew && !confirmDelete && (
            <button className="link-danger" onClick={() => setConfirmDelete(true)}>
              Eliminar citación
            </button>
          )}
          {confirmDelete && (
            <span className="confirm-inline">
              ¿Seguro?{" "}
              <button className="link-danger" onClick={onDelete}>
                Sí
              </button>{" "}
              <button onClick={() => setConfirmDelete(false)}>No</button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
