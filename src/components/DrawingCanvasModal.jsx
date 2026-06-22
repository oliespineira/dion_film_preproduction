import { useRef, useState, useEffect } from "react";
import { X, Undo2, Trash2 } from "lucide-react";

const COLORS = ["#1a1a1a", "#b23a2e", "#3a6ea5", "#3a8a55"];
const SIZES = [2, 5, 10];

export default function DrawingCanvasModal({ onClose, onSave }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const history = useRef([]);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [eraser, setEraser] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function pushHistory() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (history.current.length > 30) history.current.shift();
  }

  function handlePointerDown(e) {
    canvasRef.current.setPointerCapture(e.pointerId);
    pushHistory();
    drawing.current = true;
    lastPoint.current = getPos(e);
  }

  function handlePointerMove(e) {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.strokeStyle = eraser ? "#ffffff" : color;
    ctx.lineWidth = eraser ? size * 3 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPoint.current = pos;
  }

  function handlePointerUp() {
    drawing.current = false;
  }

  function handleUndo() {
    const last = history.current.pop();
    if (last) canvasRef.current.getContext("2d").putImageData(last, 0, 0);
  }

  function handleClear() {
    pushHistory();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function handleSave() {
    setSaving(true);
    canvasRef.current.toBlob((blob) => {
      onSave(blob).finally(() => setSaving(false));
    }, "image/png");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-tag">DIBUJAR PLANO</span>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="canvas-toolbar">
          {COLORS.map((c) => (
            <button
              key={c}
              className={!eraser && color === c ? "color-swatch active" : "color-swatch"}
              style={{ background: c }}
              onClick={() => {
                setColor(c);
                setEraser(false);
              }}
              aria-label={`Color ${c}`}
            />
          ))}
          {SIZES.map((s) => (
            <button key={s} className={size === s ? "size-btn active" : "size-btn"} onClick={() => setSize(s)} aria-label={`Grosor ${s}`}>
              <span style={{ width: s + 2, height: s + 2 }} />
            </button>
          ))}
          <button className={eraser ? "tool-btn active" : "tool-btn"} onClick={() => setEraser(!eraser)}>
            Goma
          </button>
          <button className="tool-btn" onClick={handleUndo} aria-label="Deshacer">
            <Undo2 size={14} />
          </button>
          <button className="tool-btn" onClick={handleClear} aria-label="Borrar todo">
            <Trash2 size={14} />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="drawing-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        <div className="modal-actions">
          <button className="btn-primary" disabled={saving} onClick={handleSave}>
            {saving ? "Guardando…" : "Guardar dibujo"}
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
