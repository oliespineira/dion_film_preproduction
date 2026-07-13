import { useState } from "react";
import { Save, Trash2, Loader2 } from "lucide-react";

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) + " · " + d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export default function SynopsisEditor({ drafts, loading, onCreateDraft, onDeleteDraft, canEdit = true }) {
  const [selectedId, setSelectedId] = useState(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const selected = drafts.find((d) => d.id === selectedId);

  function loadDraft(draft) {
    setSelectedId(draft.id);
    setText(draft.content || "");
  }

  function startNew() {
    setSelectedId(null);
    setText("");
  }

  async function handleSave() {
    if (!text.trim()) return;
    setSaving(true);
    const label = `Borrador ${drafts.length + 1}`;
    const created = await onCreateDraft(text, label);
    setSaving(false);
    if (created) setSelectedId(created.id);
  }

  return (
    <div className="writing-layout">
      <div className="draft-sidebar">
        {canEdit && (
          <button className="btn-secondary draft-new-btn" onClick={startNew}>
            + Nuevo borrador
          </button>
        )}
        {loading ? (
          <div className="board-empty">
            <Loader2 className="spin" size={18} />
          </div>
        ) : drafts.length === 0 ? (
          <p className="muted-note">Todavía no hay borradores de sinopsis.</p>
        ) : (
          <ul className="draft-list">
            {drafts.map((d) => (
              <li key={d.id} className={d.id === selectedId ? "draft-item active" : "draft-item"}>
                <button onClick={() => loadDraft(d)}>
                  <strong>{d.label || "Borrador"}</strong>
                  <span>{formatDateTime(d.created_at)}</span>
                </button>
                <button className="draft-delete" onClick={() => onDeleteDraft(d.id)} aria-label="Eliminar borrador">
                  <Trash2 size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="writing-main">
        <textarea
          className="synopsis-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!canEdit}
          placeholder="Escribe aquí la sinopsis: resumen de la historia, principio y final, lo esencial del conflicto…"
        />
        <div className="writing-toolbar">
          {selected && <span className="muted-note">Editando una copia de "{selected.label}" — al guardar se crea un borrador nuevo, no se sobrescribe.</span>}
          {canEdit && (
            <button className="btn-primary" disabled={!text.trim() || saving} onClick={handleSave}>
              <Save size={14} /> {saving ? "Guardando…" : "Guardar como nuevo borrador"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
