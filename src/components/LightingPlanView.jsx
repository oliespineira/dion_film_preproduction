import { useState } from "react";
import { Plus, PenTool, LayoutGrid, Trash2, Loader2, Lightbulb } from "lucide-react";
import DrawingCanvasModal from "./DrawingCanvasModal";
import LightingDiagramEditor from "./LightingDiagramEditor";

export default function LightingPlanView({
  scenes,
  selectedSceneId,
  onSelectScene,
  plans,
  loading,
  saving,
  onCreateImagePlan,
  onCreateDiagramPlan,
  onUpdateDiagramPlan,
  onDeletePlan,
  canEdit = true,
}) {
  const [drawOpen, setDrawOpen] = useState(false);
  const [diagramTarget, setDiagramTarget] = useState(null); // null = closed, {} = new, plan = edit

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) onCreateImagePlan(file);
    e.target.value = "";
  }

  return (
    <div className="breakdown-section">
      <div className="shot-scene-picker">
        <label className="field-inline">
          <span>Escena</span>
          <select className="field-select" value={selectedSceneId || ""} onChange={(e) => onSelectScene(e.target.value)}>
            <option value="">Selecciona una escena…</option>
            {scenes.map((s, i) => (
              <option key={s.id} value={s.id}>
                {(s.scene_number || i + 1) + " · " + s.int_ext + "/" + s.day_night + (s.description ? " · " + s.description.slice(0, 40) : "")}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!selectedSceneId ? (
        <div className="board-empty">
          <p>Elige una escena para ver o crear su planta de luces.</p>
        </div>
      ) : (
        <>
          <div className="breakdown-toolbar">
            {canEdit && (
              <>
                <label className="add-btn character file-upload-btn">
                  <Plus size={15} /> Subir imagen
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                </label>
                <button className="add-btn location" onClick={() => setDrawOpen(true)}>
                  <PenTool size={15} /> Dibujar a mano
                </button>
                <button className="add-btn" style={{ background: "#cfe0d6" }} onClick={() => setDiagramTarget({})}>
                  <LayoutGrid size={15} /> Nuevo diagrama
                </button>
              </>
            )}
          </div>

          {loading ? (
            <div className="board-empty">
              <Loader2 className="spin" size={20} />
            </div>
          ) : plans.length === 0 ? (
            <div className="board-empty">
              <Lightbulb size={24} />
              <p>Esta escena todavía no tiene planta de luces.</p>
            </div>
          ) : (
            <div className="photo-grid">
              {plans.map((p) => (
                <div key={p.id} className="photo-card lighting-card" onClick={() => canEdit && p.kind === "diagram" && setDiagramTarget(p)}>
                  {p.kind === "image" ? (
                    <img src={p.url} alt={p.caption || "Planta de luces"} />
                  ) : (
                    <div className="diagram-thumb" style={p.backgroundUrl ? { backgroundImage: `url(${p.backgroundUrl})` } : undefined}>
                      <LayoutGrid size={22} />
                      <span>{(p.diagram_data || []).length} elementos</span>
                    </div>
                  )}
                  {p.caption && <p className="photo-caption">{p.caption}</p>}
                  {canEdit && (
                    <button
                      className="photo-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlan(p);
                      }}
                      aria-label="Eliminar plano"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {drawOpen && (
        <DrawingCanvasModal
          onClose={() => setDrawOpen(false)}
          onSave={async (blob) => {
            await onCreateImagePlan(blob);
            setDrawOpen(false);
          }}
        />
      )}

      {diagramTarget && (
        <LightingDiagramEditor
          plan={diagramTarget.id ? diagramTarget : null}
          saving={saving}
          onClose={() => setDiagramTarget(null)}
          onSave={(payload) => (diagramTarget.id ? onUpdateDiagramPlan(diagramTarget.id, payload) : onCreateDiagramPlan(payload))}
        />
      )}
    </div>
  );
}
