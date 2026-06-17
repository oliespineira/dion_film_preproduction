import { Plus } from "lucide-react";

export default function ProjectTabs({ projects, activeId, onSelect, onNew }) {
  return (
    <nav className="project-tabs">
      {projects.map((p) => (
        <button key={p.id} className={`tab ${p.id === activeId ? "active" : ""}`} onClick={() => onSelect(p.id)}>
          {p.name}
        </button>
      ))}
      <button className="tab tab-add" onClick={onNew}>
        <Plus size={14} /> Nuevo proyecto
      </button>
    </nav>
  );
}
