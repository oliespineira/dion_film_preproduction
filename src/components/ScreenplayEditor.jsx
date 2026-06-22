import { useState, useRef } from "react";
import { Save, Trash2, Loader2 } from "lucide-react";
import { ELEMENT_LABELS, NEXT_TYPE_ON_ENTER, nextElementType, blankElement } from "../utils/helpers";

function formatDateTime(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  );
}

export default function ScreenplayEditor({ drafts, loading, characters, onCreateDraft, onDeleteDraft }) {
  const [selectedId, setSelectedId] = useState(null);
  const [elements, setElements] = useState([blankElement("scene_heading")]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const textareaRefs = useRef([]);

  const selected = drafts.find((d) => d.id === selectedId);

  function loadDraft(draft) {
    setSelectedId(draft.id);
    setElements(draft.elements && draft.elements.length > 0 ? draft.elements : [blankElement("scene_heading")]);
  }

  function startNew() {
    setSelectedId(null);
    setElements([blankElement("scene_heading")]);
  }

  function updateElement(idx, patch) {
    setElements((prev) => prev.map((el, i) => (i === idx ? { ...el, ...patch } : el)));
  }

  function focusBlock(idx, atEnd = true) {
    requestAnimationFrame(() => {
      const ta = textareaRefs.current[idx];
      if (ta) {
        ta.focus();
        if (atEnd) {
          const len = ta.value.length;
          ta.setSelectionRange(len, len);
        }
      }
    });
  }

  function handleKeyDown(e, idx) {
    const el = elements[idx];

    if (e.key === "Tab") {
      e.preventDefault();
      const dir = e.shiftKey ? -1 : 1;
      updateElement(idx, { type: nextElementType(el.type, dir) });
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const nextType = NEXT_TYPE_ON_ENTER[el.type] || "action";
      const newEl = blankElement(nextType);
      setElements((prev) => {
        const next = [...prev];
        next.splice(idx + 1, 0, newEl);
        return next;
      });
      setFocusedIndex(idx + 1);
      focusBlock(idx + 1, false);
      return;
    }

    if (e.key === "Backspace" && el.text === "" && elements.length > 1) {
      e.preventDefault();
      setElements((prev) => prev.filter((_, i) => i !== idx));
      const prevIdx = Math.max(0, idx - 1);
      setFocusedIndex(prevIdx);
      focusBlock(prevIdx, true);
    }
  }

  function autoGrow(e) {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }

  function insertToken(idx, token) {
    const current = elements[idx].text || "";
    const sep = current && !current.endsWith(" ") ? " " : "";
    updateElement(idx, { text: current + sep + token });
    focusBlock(idx, true);
  }

  function setCharacterName(idx, name) {
    updateElement(idx, { text: name.toUpperCase() });
    focusBlock(idx, true);
  }

  async function handleSave() {
    const cleaned = elements.filter((el) => el.text.trim() !== "");
    if (cleaned.length === 0) return;
    setSaving(true);
    const label = `Borrador ${drafts.length + 1}`;
    const created = await onCreateDraft(elements, label);
    setSaving(false);
    if (created) setSelectedId(created.id);
  }

  const focusedType = elements[focusedIndex]?.type;

  return (
    <div className="writing-layout">
      <div className="draft-sidebar">
        <button className="btn-secondary draft-new-btn" onClick={startNew}>
          + Nuevo borrador
        </button>
        {loading ? (
          <div className="board-empty">
            <Loader2 className="spin" size={18} />
          </div>
        ) : drafts.length === 0 ? (
          <p className="muted-note">Todavía no hay borradores de guion.</p>
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
        <div className="screenplay-hint-bar">
          {focusedType === "scene_heading" && (
            <>
              <button onClick={() => insertToken(focusedIndex, "INT.")}>INT.</button>
              <button onClick={() => insertToken(focusedIndex, "EXT.")}>EXT.</button>
              <button onClick={() => insertToken(focusedIndex, "- DÍA")}>- DÍA</button>
              <button onClick={() => insertToken(focusedIndex, "- NOCHE")}>- NOCHE</button>
            </>
          )}
          {focusedType === "character" && characters.length > 0 && (
            <>
              {characters.map((c) => (
                <button key={c.id} onClick={() => setCharacterName(focusedIndex, c.name || "")}>
                  {c.name}
                </button>
              ))}
            </>
          )}
          {!focusedType && null}
          <span className="screenplay-hint-text">
            Enter: nuevo bloque (adivina el siguiente tipo) · Mayús+Enter: salto de línea · Tab/Mayús+Tab: cambiar tipo de bloque · Backspace en bloque vacío: lo borra · En encabezados de escena y personajes aparecen aquí botones rápidos
          </span>
        </div>

        <div className="screenplay-page">
          {elements.map((el, idx) => (
            <div key={el.id} className={`screenplay-block-row ${el.type}`}>
              <textarea
                ref={(node) => (textareaRefs.current[idx] = node)}
                className={`screenplay-block ${el.type}`}
                value={el.text}
                rows={1}
                onFocus={() => setFocusedIndex(idx)}
                onInput={autoGrow}
                onChange={(e) => {
                  const v = ["scene_heading", "character", "transition"].includes(el.type) ? e.target.value.toUpperCase() : e.target.value;
                  updateElement(idx, { text: v });
                }}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                placeholder={ELEMENT_LABELS[el.type]}
              />
            </div>
          ))}
        </div>

        <div className="writing-toolbar">
          {selected && (
            <span className="muted-note">Editando una copia de "{selected.label}" — al guardar se crea un borrador nuevo.</span>
          )}
          <button className="btn-primary" disabled={saving} onClick={handleSave}>
            <Save size={14} /> {saving ? "Guardando…" : "Guardar como nuevo borrador"}
          </button>
        </div>
      </div>
    </div>
  );
}
