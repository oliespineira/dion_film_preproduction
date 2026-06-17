import { User, MapPin } from "lucide-react";
import { rotationFor } from "../utils/helpers";

export default function Card({ card, type, onOpen }) {
  const { deg, lift } = rotationFor(card.id);
  return (
    <button
      className={`card ${type}`}
      style={{ transform: `rotate(${deg}deg) translateY(${lift}px)` }}
      onClick={() => onOpen(card, type)}
    >
      <span className="pin" />
      <span className="card-icon">{type === "character" ? <User size={14} /> : <MapPin size={14} />}</span>
      <h3>{card.name || "Sin nombre"}</h3>
      {type === "character" ? (
        <>
          <p className="oneliner">{card.one_liner}</p>
          <p className="preview">{card.psychological || card.physical}</p>
        </>
      ) : (
        <p className="preview">{card.atmosphere || card.physical}</p>
      )}
    </button>
  );
}
