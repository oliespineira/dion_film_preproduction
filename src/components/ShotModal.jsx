import { useState } from "react";
import { X } from "lucide-react";
import { FRAMING_SCALE, ANGLE_OPTIONS, MOVEMENT_OPTIONS } from "../utils/helpers";

export default function ShotModal({ shot, onClose, onSave, onDelete }) {
  const isNew = !shot.id;
  const [form, setForm] = useState(shot);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, duration_seconds: form.duration_seconds === "" ? null : Number(form.duration_seconds) };
    await onSave(payload);
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-tag">FICHA DE PLANO</span>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="scene-grid">
          <label className="field">
            <span>Nº de plano</span>
            <input value={form.shot_number} onChange={(e) => update("shot_number", e.target.value)} placeholder="1, 2A…" />
          </label>
          <label className="field">
            <span>Duración estimada (segundos)</span>
            <input
              type="number"
              min="0"
              value={form.duration_seconds}
              onChange={(e) => update("duration_seconds", e.target.value)}
              placeholder="5"
            />
          </label>
        </div>

        <div className="scene-grid">
          <label className="field">
            <span>Encuadre</span>
            <input
              value={form.framing}
              onChange={(e) => update("framing", e.target.value)}
              placeholder="Plano Medio…"
              list="framing-options"
            />
            <datalist id="framing-options">
              {FRAMING_SCALE.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span>Angulación</span>
            <input value={form.angle} onChange={(e) => update("angle", e.target.value)} placeholder="Normal…" list="angle-options" />
            <datalist id="angle-options">
              {ANGLE_OPTIONS.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span>Movimiento de cámara</span>
            <input
              value={form.movement}
              onChange={(e) => update("movement", e.target.value)}
              placeholder="Fijo…"
              list="movement-options"
            />
            <datalist id="movement-options">
              {MOVEMENT_OPTIONS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </label>
        </div>

        <label className="field">
          <span>Objetivo / lente</span>
          <input value={form.lens} onChange={(e) => update("lens", e.target.value)} placeholder="50mm, gran angular, teleobjetivo…" />
        </label>

        <label className="field">
          <span>Acción, diálogo o elemento visual que cubre este plano</span>
          <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </label>

        <label className="field">
          <span>Notas</span>
          <textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </label>

        <div className="modal-actions">
          <button className="btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
          {!isNew && !confirmDelete && (
            <button className="link-danger" onClick={() => setConfirmDelete(true)}>
              Eliminar plano
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
