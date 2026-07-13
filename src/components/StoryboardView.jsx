import { useState } from "react";
import { Plus, PenTool, Trash2, ChevronUp, ChevronDown, Loader2, Image as ImageIcon } from "lucide-react";
import DrawingCanvasModal from "./DrawingCanvasModal";

export default function StoryboardView({
  scenes,
  selectedSceneId,
  onSelectScene,
  shots,
  loadingShots,
  selectedShotId,
  onSelectShot,
  frames,
  loadingFrames,
  uploadingFrame,
  onUploadFile,
  onUploadDrawing,
  onDeleteFrame,
  onReorderFrame,
  canEdit = true,
}) {
  const [drawOpen, setDrawOpen] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) onUploadFile(file);
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
          <p>Elige una escena para ver sus planos.</p>
        </div>
      ) : loadingShots ? (
        <div className="board-empty">
          <Loader2 className="spin" size={20} />
        </div>
      ) : shots.length === 0 ? (
        <div className="board-empty">
          <p>Esta escena no tiene planos todavía. Créalos en "Guion técnico".</p>
        </div>
      ) : (
        <>
          <div className="shot-scene-picker">
            <label className="field-inline">
              <span>Plano</span>
              <select className="field-select" value={selectedShotId || ""} onChange={(e) => onSelectShot(e.target.value)}>
                <option value="">Selecciona un plano…</option>
                {shots.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    {(s.shot_number || i + 1) + (s.framing ? " · " + s.framing : "") + (s.description ? " · " + s.description.slice(0, 40) : "")}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!selectedShotId ? (
            <div className="board-empty">
              <p>Elige un plano para ver o crear su storyboard.</p>
            </div>
          ) : (
            <>
              <div className="breakdown-toolbar">
                {canEdit && (
                  <>
                    <label className="add-btn character file-upload-btn">
                      <Plus size={15} /> {uploadingFrame ? "Subiendo…" : "Subir imagen"}
                      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploadingFrame} />
                    </label>
                    <button className="add-btn location" onClick={() => setDrawOpen(true)} disabled={uploadingFrame}>
                      <PenTool size={15} /> Dibujar
                    </button>
                  </>
                )}
              </div>

              {loadingFrames ? (
                <div className="board-empty">
                  <Loader2 className="spin" size={20} />
                </div>
              ) : frames.length === 0 ? (
                <div className="board-empty">
                  <ImageIcon size={24} />
                  <p>Este plano todavía no tiene storyboard.</p>
                </div>
              ) : (
                <div className="photo-grid">
                  {frames.map((f, i) => (
                    <div key={f.id} className="photo-card storyboard-card">
                      <img src={f.url} alt={f.caption || `Frame ${i + 1}`} />
                      <div className="storyboard-frame-actions">
                        {canEdit && (
                          <button className="icon-btn" onClick={() => onReorderFrame(f.id, "up")} aria-label="Mover antes">
                            <ChevronUp size={13} />
                          </button>
                        )}
                        <span className="frame-index">{i + 1}</span>
                        {canEdit && (
                          <button className="icon-btn" onClick={() => onReorderFrame(f.id, "down")} aria-label="Mover después">
                            <ChevronDown size={13} />
                          </button>
                        )}
                      </div>
                      {canEdit && (
                        <button className="photo-delete" onClick={() => onDeleteFrame(f)} aria-label="Eliminar frame">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {drawOpen && (
        <DrawingCanvasModal
          onClose={() => setDrawOpen(false)}
          onSave={async (blob) => {
            await onUploadDrawing(blob);
            setDrawOpen(false);
          }}
        />
      )}
    </div>
  );
}
