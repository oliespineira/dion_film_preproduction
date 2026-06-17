import { PanelsTopLeft, Table2, Clapperboard } from "lucide-react";

export default function ViewSwitcher({ view, setView }) {
  return (
    <div className="view-switcher">
      <button className={view === "board" ? "view-btn active" : "view-btn"} onClick={() => setView("board")}>
        <PanelsTopLeft size={14} /> Tablero
      </button>
      <button className={view === "breakdown" ? "view-btn active" : "view-btn"} onClick={() => setView("breakdown")}>
        <Table2 size={14} /> Desglose
      </button>
      <button className={view === "shotlist" ? "view-btn active" : "view-btn"} onClick={() => setView("shotlist")}>
        <Clapperboard size={14} /> Guion técnico
      </button>
    </div>
  );
}
