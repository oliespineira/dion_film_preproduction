import { Pin, Loader2 } from "lucide-react";
import Card from "./Card";

export default function Board({ loading, characters, locations, filter, onOpen }) {
  const cards = [
    ...characters.map((c) => ({ type: "character", data: c })),
    ...locations.map((l) => ({ type: "location", data: l })),
  ].filter((c) => filter === "all" || c.type === filter);

  return (
    <div className="board">
      {loading ? (
        <div className="board-empty">
          <Loader2 className="spin" size={22} />
          <p>Cargando fichas…</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="board-empty">
          <Pin size={26} />
          <p>El corcho está vacío. Pincha tu primera ficha.</p>
        </div>
      ) : (
        cards.map(({ type, data }) => <Card key={data.id} card={data} type={type} onOpen={onOpen} />)
      )}
    </div>
  );
}