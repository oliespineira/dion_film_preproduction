import { PanelsTopLeft, Table2, Clapperboard, CalendarClock, FolderOpen, FileText, PenTool } from "lucide-react";

export default function ViewSwitcher({ view, setView }) {
  return (
    <div className="view-switcher">
      <button className={view === "writing" ? "view-btn active" : "view-btn"} onClick={() => setView("writing")}>
        <FileText size={14} /> Guion
      </button>
      <button className={view === "board" ? "view-btn active" : "view-btn"} onClick={() => setView("board")}>
        <PanelsTopLeft size={14} /> Tablero
      </button>
      <button className={view === "breakdown" ? "view-btn active" : "view-btn"} onClick={() => setView("breakdown")}>
        <Table2 size={14} /> Desglose
      </button>
      <button className={view === "shotlist" ? "view-btn active" : "view-btn"} onClick={() => setView("shotlist")}>
        <Clapperboard size={14} /> Guion técnico
      </button>
      <button className={view === "storyboard" ? "view-btn active" : "view-btn"} onClick={() => setView("storyboard")}>
        <PenTool size={14} /> Storyboard
      </button>
      <button className={view === "callsheet" ? "view-btn active" : "view-btn"} onClick={() => setView("callsheet")}>
        <CalendarClock size={14} /> Citaciones
      </button>
      <button className={view === "departments" ? "view-btn active" : "view-btn"} onClick={() => setView("departments")}>
        <FolderOpen size={14} /> Dossiers
      </button>
    </div>
  );
}
