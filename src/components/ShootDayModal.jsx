import { useState } from "react";
import { X } from "lucide-react";

export default function ShootDayModal({ day, onClose, onSave, onDelete, readOnly = false }) {
  const isNew = !day.id;
  const [form, setForm] = useState(day);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, day_date: form.day_date || null };
    await onSave(payload);
    setSaving(false);
  }

  const canSave = form.day_label && form.day_label.trim().length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-tag">DÍA DE RODAJE</span>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <label className="field">
          <span>Etiqueta del día</span>
          <input autoFocus value={form.day_label} onChange={(e) => update("day_label", e.target.value)} placeholder="Día 1, Día de exteriores…" />
        </label>

        <div className="scene-grid">
          <label className="field">
            <span>Fecha</span>
            <input type="date" value={form.day_date || ""} onChange={(e) => update("day_date", e.target.value)} />
          </label>
          <label className="field">
            <span>Citación general</span>
            <input value={form.general_call_time} onChange={(e) => update("general_call_time", e.target.value)} placeholder="07:00" />
          </label>
        </div>

        <label className="field">
          <span>Localización principal del día</span>
          <input value={form.main_location} onChange={(e) => update("main_location", e.target.value)} />
        </label>

        <label className="field">
          <span>Notas</span>
          <textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </label>

        <div className="modal-actions">
          {readOnly ? (
            <span className="muted-note">Solo lectura — no puedes editar este día.</span>
          ) : (
            <>
              <button className="btn-primary" disabled={!canSave || saving} onClick={handleSave}>
                {saving ? "Guardando…" : "Guardar"}
              </button>
              {!isNew && !confirmDelete && (
                <button className="link-danger" onClick={() => setConfirmDelete(true)}>
                  Eliminar día
                </button>
              )}
              {confirmDelete && (
                <span className="confirm-inline">
                  ¿Seguro? Se borrará también su horario y citaciones.{" "}
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
