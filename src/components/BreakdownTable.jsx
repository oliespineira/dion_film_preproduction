import { Plus, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { stripeClassFor } from "../utils/helpers";

function truncate(text, n = 40) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n - 1) + "…" : text;
}

export default function BreakdownTable({ scenes, loading, characters, locations, onOpen, onAdd, onReorder, canEdit = true }) {
  function locationLabel(scene) {
    if (scene.location_id) {
      const loc = locations.find((l) => l.id === scene.location_id);
      if (loc) return loc.name;
    }
    return scene.location_name || "—";
  }
  function castLabel(scene) {
    const names = (scene.character_ids || [])
      .map((id) => characters.find((c) => c.id === id)?.name)
      .filter(Boolean);
    return names.length ? names.join(", ") : "—";
  }

  return (
    <div className="breakdown-section">
      <div className="breakdown-toolbar">
        {canEdit && (
          <button className="add-btn character" onClick={onAdd}>
            <Plus size={15} /> Nueva escena
          </button>
        )}
      </div>

      <div className="breakdown-wrap">
        {loading ? (
          <div className="board-empty">
            <Loader2 className="spin" size={22} />
            <p>Cargando desglose…</p>
          </div>
        ) : scenes.length === 0 ? (
          <div className="board-empty">
            <p>Todavía no hay escenas en el desglose.</p>
          </div>
        ) : (
          <table className="breakdown">
            <thead>
              <tr>
                <th className="scene-stripe-head"></th>
                <th>Nº</th>
                <th>Cab.</th>
                <th>Descripción</th>
                <th>Localización</th>
                <th><span className="dept-dot dot-cast" />Actores</th>
                <th><span className="dept-dot dot-extras" />Extras</th>
                <th>Vestuario</th>
                <th>Maquillaje / Peluq.</th>
                <th>Escenografía</th>
                <th><span className="dept-dot dot-props" />Atrezo</th>
                <th><span className="dept-dot dot-vehicles" />Vehículos</th>
                <th><span className="dept-dot dot-vehicles" />Animales / Niños</th>
                <th>Páginas</th>
                <th>Octavos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scenes.map((scene, i) => (
                <tr key={scene.id} onClick={() => onOpen(scene)}>
                  <td className="scene-stripe">
                    <span className={stripeClassFor(scene.int_ext, scene.day_night)} />
                  </td>
                  <td className="scene-num">{scene.scene_number || i + 1}</td>
                  <td>
                    {scene.int_ext}/{scene.day_night === "DÍA" ? "DÍA" : "NOCHE"}
                  </td>
                  <td className="cell-wrap">{truncate(scene.description, 60)}</td>
                  <td>{locationLabel(scene)}</td>
                  <td className="cell-wrap">{truncate(castLabel(scene), 40)}</td>
                  <td>{scene.has_extras ? "Sí" : "No"}</td>
                  <td className="cell-wrap">{truncate(scene.wardrobe, 30)}</td>
                  <td className="cell-wrap">{truncate(scene.makeup_hair, 30)}</td>
                  <td className="cell-wrap">{truncate(scene.set_design, 30)}</td>
                  <td className="cell-wrap">{truncate(scene.props, 30)}</td>
                  <td className="cell-wrap">{truncate(scene.vehicles, 24)}</td>
                  <td className="cell-wrap">{truncate(scene.animals_children, 24)}</td>
                  <td>{scene.page_range}</td>
                  <td>{scene.eighths || ""}</td>
                  <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                    {canEdit && (
                      <>
                        <button className="icon-btn" onClick={() => onReorder(scene.id, "up")} aria-label="Subir escena">
                          <ChevronUp size={14} />
                        </button>
                        <button className="icon-btn" onClick={() => onReorder(scene.id, "down")} aria-label="Bajar escena">
                          <ChevronDown size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
