import { PanelsTopLeft, Table2 } from "lucide-react";

export default function ViewSwitcher({ view, setView }) {
  return (
    <div className="view-switcher">
      <button className={view === "board" ? "view-btn active" : "view-btn"} onClick={() => setView("board")}>
        <PanelsTopLeft size={14} /> Tablero
      </button>
      <button className={view === "breakdown" ? "view-btn active" : "view-btn"} onClick={() => setView("breakdown")}>
        <Table2 size={14} /> Desglose
      </button>
    </div>
  );
}
