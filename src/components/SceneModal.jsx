import { useState } from "react";
import { X } from "lucide-react";

export default function SceneModal({ scene, characters, locations, onClose, onSave, onDelete, readOnly = false }) {
  const isNew = !scene.id;
  const [form, setForm] = useState(scene);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customLocation, setCustomLocation] = useState(!scene.location_id && !!scene.location_name);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  function toggleCharacter(id) {
    setForm((prev) => {
      const ids = prev.character_ids || [];
      return { ...prev, character_ids: ids.includes(id) ? ids.filter((c) => c !== id) : [...ids, id] };
    });
  }

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, eighths: form.eighths === "" ? 0 : Number(form.eighths) };
    if (customLocation) payload.location_id = null;
    else payload.location_name = "";
    await onSave(payload);
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-tag">FICHA DE ESCENA</span>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="scene-grid">
          <label className="field">
            <span>Nº de escena</span>
            <input value={form.scene_number} onChange={(e) => update("scene_number", e.target.value)} placeholder="12, 12A…" />
          </label>

          <div className="field">
            <span>Interior / Exterior</span>
            <div className="toggle-group">
              <button className={form.int_ext === "INT" ? "toggle-btn active" : "toggle-btn"} onClick={() => update("int_ext", "INT")}>
                INT
              </button>
              <button className={form.int_ext === "EXT" ? "toggle-btn active" : "toggle-btn"} onClick={() => update("int_ext", "EXT")}>
                EXT
              </button>
            </div>
          </div>

          <div className="field">
            <span>Día / Noche</span>
            <div className="toggle-group">
              <button className={form.day_night === "DÍA" ? "toggle-btn active" : "toggle-btn"} onClick={() => update("day_night", "DÍA")}>
                DÍA
              </button>
              <button className={form.day_night === "NOCHE" ? "toggle-btn active" : "toggle-btn"} onClick={() => update("day_night", "NOCHE")}>
                NOCHE
              </button>
            </div>
          </div>
        </div>

        <label className="field">
          <span>Descripción breve</span>
          <textarea rows={2} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </label>

        <div className="field">
          <span>Localización</span>
          {!customLocation ? (
            <select
              className="field-select"
              value={form.location_id || ""}
              onChange={(e) => {
                if (e.target.value === "__custom__") {
                  setCustomLocation(true);
                  update("location_id", null);
                } else {
                  update("location_id", e.target.value || null);
                }
              }}
            >
              <option value="">Selecciona una localización…</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
              <option value="__custom__">Otra (escribir nombre)…</option>
            </select>
          ) : (
            <div className="inline-row">
              <input
                value={form.location_name}
                onChange={(e) => update("location_name", e.target.value)}
                placeholder="Nombre de la localización"
              />
              <button type="button" className="btn-secondary" onClick={() => setCustomLocation(false)}>
                Elegir de la lista
              </button>
            </div>
          )}
        </div>

        <div className="scene-grid">
          <label className="field">
            <span>Páginas de guion</span>
            <input value={form.page_range} onChange={(e) => update("page_range", e.target.value)} placeholder="12-13" />
          </label>
          <label className="field">
            <span>Octavos</span>
            <input
              type="number"
              step="0.125"
              value={form.eighths}
              onChange={(e) => update("eighths", e.target.value)}
              placeholder="1.625"
            />
          </label>
          <label className="field checkbox-field">
            <span>¿Hay extras?</span>
            <input type="checkbox" checked={!!form.has_extras} onChange={(e) => update("has_extras", e.target.checked)} />
          </label>
        </div>

        {form.has_extras && (
          <label className="field">
            <span>Notas de extras</span>
            <input value={form.extras_notes} onChange={(e) => update("extras_notes", e.target.value)} />
          </label>
        )}

        <div className="field">
          <span>Actores presentes</span>
          <div className="char-select">
            {characters.length === 0 && <span className="muted-note">Todavía no hay personajes creados en el tablero.</span>}
            {characters.map((c) => (
              <button
                key={c.id}
                type="button"
                className={(form.character_ids || []).includes(c.id) ? "char-chip active" : "char-chip"}
                onClick={() => toggleCharacter(c.id)}
              >
                {c.name || "Sin nombre"}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span>Vestuario</span>
          <textarea rows={2} value={form.wardrobe} onChange={(e) => update("wardrobe", e.target.value)} />
        </label>
        <label className="field">
          <span>Maquillaje y peluquería</span>
          <textarea rows={2} value={form.makeup_hair} onChange={(e) => update("makeup_hair", e.target.value)} />
        </label>
        <label className="field">
          <span>Escenografía</span>
          <textarea rows={2} value={form.set_design} onChange={(e) => update("set_design", e.target.value)} />
        </label>
        <label className="field">
          <span>Atrezo</span>
          <textarea rows={2} value={form.props} onChange={(e) => update("props", e.target.value)} />
        </label>
        <label className="field">
          <span>Vehículos (normales o especiales)</span>
          <textarea rows={2} value={form.vehicles} onChange={(e) => update("vehicles", e.target.value)} />
        </label>
        <label className="field">
          <span>Animales o niños</span>
          <textarea rows={2} value={form.animals_children} onChange={(e) => update("animals_children", e.target.value)} />
        </label>

        <div className="modal-actions">
          {readOnly ? (
            <span className="muted-note">Solo lectura — no puedes editar esta escena.</span>
          ) : (
            <>
              <button className="btn-primary" disabled={saving} onClick={handleSave}>
                {saving ? "Guardando…" : "Guardar"}
              </button>
              {!isNew && !confirmDelete && (
                <button className="link-danger" onClick={() => setConfirmDelete(true)}>
                  Eliminar escena
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
