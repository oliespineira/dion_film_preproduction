import { useRef, useState } from "react";
import { Trash2, RotateCcw, RotateCw, Upload, X } from "lucide-react";
import FixtureIcon from "./FixtureIcon";
import { FIXTURE_TYPES, blankFixture } from "../utils/helpers";

export default function LightingDiagramEditor({ plan, onClose, onSave, saving }) {
  const isNew = !plan?.id;
  const [fixtures, setFixtures] = useState(plan?.diagram_data || []);
  const [backgroundUrl, setBackgroundUrl] = useState(plan?.backgroundUrl || "");
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [caption, setCaption] = useState(plan?.caption || "");
  const [selectedId, setSelectedId] = useState(null);
  const containerRef = useRef(null);
  const dragInfo = useRef(null);

  function addFixture(type) {
    const f = blankFixture(type);
    setFixtures((prev) => [...prev, f]);
    setSelectedId(f.id);
  }

  function updateFixture(id, patch) {
    setFixtures((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function deleteFixture(id) {
    setFixtures((prev) => prev.filter((f) => f.id !== id));
    setSelectedId(null);
  }

  function handlePointerDownFixture(e, fixture) {
    e.stopPropagation();
    setSelectedId(fixture.id);
    containerRef.current.setPointerCapture?.(e.pointerId);
    dragInfo.current = { id: fixture.id, pointerId: e.pointerId };
  }

  function handleContainerPointerMove(e) {
    if (!dragInfo.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    updateFixture(dragInfo.current.id, { x, y });
  }

  function handleContainerPointerUp() {
    dragInfo.current = null;
  }

  function handleBackgroundFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackgroundFile(file);
    setBackgroundUrl(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function handleSave() {
    const result = await onSave({ backgroundFile, diagramData: fixtures, caption });
    if (result) onClose();
  }

  const selected = fixtures.find((f) => f.id === selectedId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet wide diagram-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-tag">{isNew ? "NUEVO DIAGRAMA DE LUCES" : "EDITAR DIAGRAMA"}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="fixture-palette">
          {FIXTURE_TYPES.map((f) => (
            <button key={f.key} className="palette-btn" onClick={() => addFixture(f.key)} title={`Añadir ${f.label}`}>
              <FixtureIcon type={f.key} rotation={0} />
              <span>{f.label}</span>
            </button>
          ))}
          <label className="palette-btn palette-upload">
            <Upload size={18} />
            <span>{backgroundUrl ? "Cambiar plano" : "Subir plano del local"}</span>
            <input type="file" accept="image/*" onChange={handleBackgroundFile} />
          </label>
        </div>

        <div
          ref={containerRef}
          className="diagram-canvas"
          style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : undefined}
          onPointerMove={handleContainerPointerMove}
          onPointerUp={handleContainerPointerUp}
          onPointerDown={() => setSelectedId(null)}
        >
          {fixtures.map((f) => (
            <div
              key={f.id}
              className={f.id === selectedId ? "fixture-token selected" : "fixture-token"}
              style={{ left: f.x + "%", top: f.y + "%" }}
              onPointerDown={(e) => handlePointerDownFixture(e, f)}
            >
              <FixtureIcon type={f.type} rotation={f.rotation} />
              {f.label && <span className="fixture-label">{f.label}</span>}
            </div>
          ))}
        </div>

        {selected && (
          <div className="fixture-inspector">
            <span className="muted-note">{FIXTURE_TYPES.find((f) => f.key === selected.type)?.label}</span>
            <button className="icon-btn" onClick={() => updateFixture(selected.id, { rotation: selected.rotation - 15 })} aria-label="Rotar izquierda">
              <RotateCcw size={15} />
            </button>
            <button className="icon-btn" onClick={() => updateFixture(selected.id, { rotation: selected.rotation + 15 })} aria-label="Rotar derecha">
              <RotateCw size={15} />
            </button>
            <input
              className="plain-input fixture-label-input"
              value={selected.label}
              onChange={(e) => updateFixture(selected.id, { label: e.target.value })}
              placeholder="Etiqueta (p.ej. luz clave, Marta)"
            />
            <button className="icon-btn" onClick={() => deleteFixture(selected.id)} aria-label="Eliminar foco">
              <Trash2 size={15} />
            </button>
          </div>
        )}

        <label className="field" style={{ marginTop: 12 }}>
          <span>Notas</span>
          <input className="plain-input" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="p.ej. Setup A - escena de día" />
        </label>

        <div className="modal-actions">
          <button className="btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? "Guardando…" : "Guardar diagrama"}
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
