import { Loader2 } from "lucide-react";
import PhotoGallery from "./PhotoGallery";
import { DEPARTMENTS } from "../utils/helpers";

function sceneHeading(s, i) {
  return `${s.scene_number || i + 1} · ${s.int_ext}/${s.day_night}${s.description ? " · " + s.description.slice(0, 50) : ""}`;
}

export default function DepartmentDossierView({
  department,
  onSelectDepartment,
  scenes,
  shots,
  loadingShots,
  selectedSceneForShots,
  onSelectSceneForShots,
  onUpdateSceneField,
  photos,
  loadingPhotos,
  uploadingPhoto,
  onUploadPhoto,
  onDeletePhoto,
}) {
  const dept = DEPARTMENTS.find((d) => d.key === department) || DEPARTMENTS[0];

  return (
    <div className="breakdown-section">
      <div className="dept-chips">
        {DEPARTMENTS.map((d) => (
          <button
            key={d.key}
            className={d.key === department ? "dept-chip active" : "dept-chip"}
            style={{ "--dept-color": d.color }}
            onClick={() => onSelectDepartment(d.key)}
          >
            {d.key}
          </button>
        ))}
      </div>

      {scenes.length === 0 ? (
        <div className="board-empty">
          <p>Crea alguna escena en el Desglose primero — los dossiers se organizan escena por escena.</p>
        </div>
      ) : dept.kind === "scene-fields" ? (
        <SceneFieldsDossier dept={dept} scenes={scenes} onUpdateSceneField={onUpdateSceneField} />
      ) : (
        <PhotographyDossier
          scenes={scenes}
          shots={shots}
          loading={loadingShots}
          selectedSceneId={selectedSceneForShots}
          onSelectScene={onSelectSceneForShots}
        />
      )}

      <h3 className="section-title">Fotos de referencia — {department}</h3>
      <PhotoGallery
        photos={photos}
        loading={loadingPhotos}
        uploading={uploadingPhoto}
        scenes={scenes}
        onUpload={onUploadPhoto}
        onDelete={onDeletePhoto}
      />
    </div>
  );
}

function SceneFieldsDossier({ dept, scenes, onUpdateSceneField }) {
  return (
    <div className="breakdown-wrap dossier-wrap">
      {scenes.map((s, i) => (
        <div key={s.id} className="dossier-row">
          <div className="dossier-row-heading">{sceneHeading(s, i)}</div>
          {dept.fields.map(({ field, label }) => (
            <label key={field} className="field dossier-field">
              <span>{label}</span>
              <textarea
                rows={2}
                defaultValue={s[field] || ""}
                onBlur={(e) => {
                  if (e.target.value !== (s[field] || "")) onUpdateSceneField(s.id, field, e.target.value);
                }}
              />
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

function PhotographyDossier({ scenes, shots, loading, selectedSceneId, onSelectScene }) {
  return (
    <>
      <div className="shot-scene-picker">
        <label className="field-inline">
          <span>Escena</span>
          <select className="field-select" value={selectedSceneId || ""} onChange={(e) => onSelectScene(e.target.value)}>
            <option value="">Selecciona una escena…</option>
            {scenes.map((s, i) => (
              <option key={s.id} value={s.id}>
                {sceneHeading(s, i)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!selectedSceneId ? (
        <div className="board-empty">
          <p>Elige una escena para ver su lista de planos.</p>
        </div>
      ) : loading ? (
        <div className="board-empty">
          <Loader2 className="spin" size={20} />
          <p>Cargando planos…</p>
        </div>
      ) : shots.length === 0 ? (
        <div className="board-empty">
          <p>Esta escena no tiene planos todavía. Edítalos en "Guion técnico".</p>
        </div>
      ) : (
        <div className="breakdown-wrap">
          <table className="breakdown">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Encuadre</th>
                <th>Angulación</th>
                <th>Movimiento</th>
                <th>Objetivo</th>
                <th>Acción / diálogo</th>
              </tr>
            </thead>
            <tbody>
              {shots.map((shot, i) => (
                <tr key={shot.id}>
                  <td className="scene-num">{shot.shot_number || i + 1}</td>
                  <td>{shot.framing}</td>
                  <td>{shot.angle}</td>
                  <td>{shot.movement}</td>
                  <td>{shot.lens}</td>
                  <td className="cell-wrap">{shot.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
