import { User, MapPin } from "lucide-react";

export default function Toolbar({ filter, setFilter, onAddCharacter, onAddLocation, onDeleteProject, saved, canEdit = true, isOwner = true }) {
  return (
    <div className="toolbar">
      <div className="filters">
        <button className={filter === "all" ? "chip active" : "chip"} onClick={() => setFilter("all")}>
          Todos
        </button>
        <button className={filter === "character" ? "chip active" : "chip"} onClick={() => setFilter("character")}>
          Personajes
        </button>
        <button className={filter === "location" ? "chip active" : "chip"} onClick={() => setFilter("location")}>
          Localizaciones
        </button>
      </div>
      {canEdit && (
        <div className="add-buttons">
          <button className="add-btn character" onClick={onAddCharacter}>
            <User size={15} /> Personaje
          </button>
          <button className="add-btn location" onClick={onAddLocation}>
            <MapPin size={15} /> Localización
          </button>
        </div>
      )}
      <div className="proj-actions">
        {saved && <span className="saved-pill">Guardado ✓</span>}
        {isOwner && (
          <button className="link-danger" onClick={onDeleteProject}>
            Eliminar proyecto
          </button>
        )}
      </div>
    </div>
  );
}
