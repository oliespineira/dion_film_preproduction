import { useState } from "react";
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

export default function PhotoGallery({ photos, loading, uploading, scenes, onUpload, onDelete, canEdit = true }) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="photo-gallery-section">
      <div className="breakdown-toolbar">
        {canEdit && (
          <button className="add-btn character" onClick={() => setUploadOpen(true)} disabled={uploading}>
            <Plus size={15} /> {uploading ? "Subiendo…" : "Subir foto de referencia"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="board-empty">
          <Loader2 className="spin" size={20} />
          <p>Cargando fotos…</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="board-empty">
          <ImageIcon size={24} />
          <p>Todavía no hay fotos de referencia para este departamento.</p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((p) => (
            <div key={p.id} className="photo-card">
              <img src={p.url} alt={p.caption || "Foto de referencia"} />
              {p.caption && <p className="photo-caption">{p.caption}</p>}
              {canEdit && (
                <button className="photo-delete" onClick={() => onDelete(p)} aria-label="Eliminar foto">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {uploadOpen && (
        <PhotoUploadModal
          scenes={scenes}
          onClose={() => setUploadOpen(false)}
          onUpload={async (file, meta) => {
            await onUpload(file, meta);
            setUploadOpen(false);
          }}
        />
      )}
    </div>
  );
}

function PhotoUploadModal({ scenes, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [sceneId, setSceneId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setSaving(true);
    await onUpload(file, { caption, sceneId: sceneId || null });
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet small" onClick={(e) => e.stopPropagation()}>
        <h2>Subir foto de referencia</h2>

        <label className="field">
          <span>Imagen</span>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>

        <label className="field">
          <span>Pie de foto (opcional)</span>
          <input className="plain-input" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="p.ej. Lámpara del salón, escena 4" />
        </label>

        {scenes.length > 0 && (
          <label className="field">
            <span>Escena relacionada (opcional)</span>
            <select className="field-select" value={sceneId} onChange={(e) => setSceneId(e.target.value)}>
              <option value="">— Sin escena específica —</option>
              {scenes.map((s, i) => (
                <option key={s.id} value={s.id}>
                  {s.scene_number || i + 1} · {s.int_ext}/{s.day_night}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="modal-actions">
          <button className="btn-primary" disabled={!file || saving} onClick={handleUpload}>
            {saving ? "Subiendo…" : "Subir"}
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
