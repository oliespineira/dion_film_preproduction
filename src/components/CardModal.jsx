import { useState } from "react";
import { X } from "lucide-react";

export default function CardModal({ type, card, onClose, onSave, onDelete, readOnly = false }) {
  const isNew = !card.id;
  const [form, setForm] = useState(card);
  const [traitInput, setTraitInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  function addTrait() {
    const t = traitInput.trim();
    if (!t) return;
    setForm((prev) => ({ ...prev, traits: [...(prev.traits || []), t] }));
    setTraitInput("");
  }
  function removeTrait(i) {
    setForm((prev) => ({ ...prev, traits: prev.traits.filter((_, idx) => idx !== i) }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  const canSave = form.name && form.name.trim().length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-sheet ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-tag">{type === "character" ? "FICHA DE PERSONAJE" : "FICHA DE LOCALIZACIÓN"}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <label className="field">
          <span>Nombre</span>
          <input
            autoFocus={!readOnly}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={type === "character" ? "Nombre del personaje" : "Nombre del lugar"}
            disabled={readOnly}
          />
        </label>

        {type === "character" ? (
          <>
            <label className="field">
              <span>Una línea (rol en la trama)</span>
              <input
                value={form.one_liner || ""}
                onChange={(e) => update("one_liner", e.target.value)}
                placeholder="p.ej. el mejor amigo que esconde un secreto"
                disabled={readOnly}
              />
            </label>
            <label className="field">
              <span>Descripción física</span>
              <textarea
                rows={2}
                value={form.physical || ""}
                onChange={(e) => update("physical", e.target.value)}
                disabled={readOnly}
              />
            </label>
            <label className="field">
              <span>Descripción psicológica</span>
              <textarea
                rows={2}
                value={form.psychological || ""}
                onChange={(e) => update("psychological", e.target.value)}
                placeholder="cómo habla, cómo se comporta…"
                disabled={readOnly}
              />
            </label>
            <label className="field">
              <span>Historia / trasfondo</span>
              <textarea
                rows={3}
                value={form.background || ""}
                onChange={(e) => update("background", e.target.value)}
                disabled={readOnly}
              />
            </label>
            <div className="field">
              <span>Rasgos clave</span>
              {!readOnly && (
                <div className="trait-input-row">
                  <input
                    value={traitInput}
                    onChange={(e) => setTraitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTrait();
                      }
                    }}
                    placeholder="p.ej. miedo a las alturas, fuma a escondidas…"
                  />
                  <button type="button" onClick={addTrait}>
                    Añadir
                  </button>
                </div>
              )}
              <div className="trait-tags">
                {(form.traits || []).map((t, i) => (
                  <span key={i} className="trait-tag">
                    {t}
                    {!readOnly && (
                      <button onClick={() => removeTrait(i)} aria-label="Quitar rasgo">
                        <X size={11} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <label className="field">
              <span>Descripción física</span>
              <textarea
                rows={3}
                value={form.physical || ""}
                onChange={(e) => update("physical", e.target.value)}
                disabled={readOnly}
              />
            </label>
            <label className="field">
              <span>Historia</span>
              <textarea
                rows={2}
                value={form.history || ""}
                onChange={(e) => update("history", e.target.value)}
                disabled={readOnly}
              />
            </label>
            <label className="field">
              <span>Ambiente</span>
              <textarea
                rows={2}
                value={form.atmosphere || ""}
                onChange={(e) => update("atmosphere", e.target.value)}
                disabled={readOnly}
              />
            </label>
          </>
        )}

        <div className="modal-actions">
          {!readOnly && (
            <button className="btn-primary" disabled={!canSave || saving} onClick={handleSave}>
              {saving ? "Guardando…" : "Guardar"}
            </button>
          )}
          {!readOnly && !isNew && !confirmDelete && (
            <button className="link-danger" onClick={() => setConfirmDelete(true)}>
              Eliminar ficha
            </button>
          )}
          {!readOnly && confirmDelete && (
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