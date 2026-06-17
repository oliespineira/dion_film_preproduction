import { Pin, Loader2 } from "lucide-react";
import Card from "./Card";

export default function Board({ loading, characters, locations, filter, onOpen }) {
  const cards = [
    ...characters.map((c) => ({ ...c, _type: "character" })),
    ...locations.map((l) => ({ ...l, _type: "location" })),
  ].filter((c) => filter === "all" || c._type === filter);

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
        cards.map((card) => <Card key={card.id} card={card} type={card._type} onOpen={onOpen} />)
      )}
    </div>
  );
}
