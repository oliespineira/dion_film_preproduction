import { useState } from "react";
import { X } from "lucide-react";

export default function ScheduleSlotModal({ slot, scenes, onClose, onSave, onDelete, readOnly = false }) {
  const isNew = !slot.id;
  const [form, setForm] = useState(slot);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  const canSave = !!form.scene_id;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-tag">PLANIFICAR ESCENA</span>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <label className="field">
          <span>Escena</span>
          <select className="field-select" value={form.scene_id || ""} onChange={(e) => update("scene_id", e.target.value)}>
            <option value="">Selecciona una escena…</option>
            {scenes.map((s, i) => (
              <option key={s.id} value={s.id}>
                {(s.scene_number || i + 1) + " · " + s.int_ext + "/" + s.day_night + (s.description ? " · " + s.description.slice(0, 40) : "")}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Hora prevista</span>
          <input value={form.scheduled_time} onChange={(e) => update("scheduled_time", e.target.value)} placeholder="09:30" />
        </label>

        <label className="field">
          <span>Notas (cambios de vestuario, maquillaje, escenografía…)</span>
          <textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </label>

        <div className="modal-actions">
          {readOnly ? (
            <span className="muted-note">Solo lectura.</span>
          ) : (
            <>
              <button className="btn-primary" disabled={!canSave || saving} onClick={handleSave}>
                {saving ? "Guardando…" : "Guardar"}
              </button>
              {!isNew && !confirmDelete && (
                <button className="link-danger" onClick={() => setConfirmDelete(true)}>
                  Quitar del horario
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
