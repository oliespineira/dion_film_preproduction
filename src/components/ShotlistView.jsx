import { Plus, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import FramingScale from "./FramingScale";

function truncate(text, n = 50) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n - 1) + "…" : text;
}

export default function ShotlistView({ scenes, selectedSceneId, onSelectScene, shots, loading, onOpen, onAdd, onReorder }) {
  if (scenes.length === 0) {
    return (
      <div className="breakdown-section">
        <div className="board-empty">
          <p>Primero crea alguna escena en la pestaña "Desglose" — el guion técnico se organiza por escena.</p>
        </div>
      </div>
    );
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
                {(s.scene_number || i + 1) + " · " + s.int_ext + "/" + s.day_night + (s.description ? " · " + truncate(s.description, 40) : "")}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!selectedSceneId ? (
        <div className="board-empty">
          <p>Elige una escena arriba para ver o crear su lista de planos.</p>
        </div>
      ) : (
        <>
          <div className="breakdown-toolbar">
            <button className="add-btn character" onClick={onAdd}>
              <Plus size={15} /> Nuevo plano
            </button>
          </div>

          <div className="breakdown-wrap">
            {loading ? (
              <div className="board-empty">
                <Loader2 className="spin" size={22} />
                <p>Cargando planos…</p>
              </div>
            ) : shots.length === 0 ? (
              <div className="board-empty">
                <p>Esta escena todavía no tiene planos.</p>
              </div>
            ) : (
              <table className="breakdown shotlist">
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Encuadre</th>
                    <th>Angulación</th>
                    <th>Movimiento</th>
                    <th>Objetivo</th>
                    <th>Acción / diálogo</th>
                    <th>Dur.</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {shots.map((shot, i) => (
                    <tr key={shot.id} onClick={() => onOpen(shot)}>
                      <td className="scene-num">{shot.shot_number || i + 1}</td>
                      <td>
                        <FramingScale value={shot.framing} />
                      </td>
                      <td>{shot.angle}</td>
                      <td>{shot.movement}</td>
                      <td>{shot.lens}</td>
                      <td className="cell-wrap">{truncate(shot.description, 70)}</td>
                      <td>{shot.duration_seconds ? shot.duration_seconds + "s" : ""}</td>
                      <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                        <button className="icon-btn" onClick={() => onReorder(shot.id, "up")} aria-label="Subir plano">
                          <ChevronUp size={14} />
                        </button>
                        <button className="icon-btn" onClick={() => onReorder(shot.id, "down")} aria-label="Bajar plano">
                          <ChevronDown size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
