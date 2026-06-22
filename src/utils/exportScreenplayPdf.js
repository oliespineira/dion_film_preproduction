import { jsPDF } from "jspdf";

const PAGE_W = 595.28; // A4 in pt
const PAGE_H = 841.89;
const MARGIN_LEFT = 108; // 1.5in — leaves room for binding, as in standard screenplay format
const MARGIN_RIGHT = 72;
const MARGIN_TOP = 72;
const MARGIN_BOTTOM = 72;
const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT;
const FONT_SIZE = 12;
const LINE_HEIGHT = 14.4;

const INDENT = { scene_heading: 0, action: 0, character: 158, parenthetical: 113, dialogue: 65, transition: 290 };
const WIDTH = {
  scene_heading: CONTENT_W,
  action: CONTENT_W,
  character: CONTENT_W - 158,
  parenthetical: 180,
  dialogue: 252,
  transition: CONTENT_W - 290,
};
const STYLE = { scene_heading: "bold", action: "normal", character: "bold", parenthetical: "italic", dialogue: "normal", transition: "normal" };

function formatText(type, text) {
  if (type === "scene_heading" || type === "character" || type === "transition") return text.toUpperCase();
  return text;
}

export function exportScreenplayPdf({ projectName, label, elements }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // Title page
  doc.setFont("courier", "bold");
  doc.setFontSize(18);
  doc.text((projectName || "GUION").toUpperCase(), PAGE_W / 2, PAGE_H / 3, { align: "center" });
  doc.setFont("courier", "normal");
  doc.setFontSize(12);
  doc.text("Guion literario", PAGE_W / 2, PAGE_H / 3 + 26, { align: "center" });
  if (label) doc.text(label, PAGE_W / 2, PAGE_H / 3 + 46, { align: "center" });

  doc.addPage();
  let y = MARGIN_TOP;
  doc.setFontSize(FONT_SIZE);

  function ensureSpace(lines = 1) {
    if (y + lines * LINE_HEIGHT > PAGE_H - MARGIN_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP;
    }
  }

  const cleanElements = (elements || []).filter((el) => (el.text || "").trim() !== "");

  cleanElements.forEach((el, idx) => {
    const text = formatText(el.type, el.text);

    if (el.type === "scene_heading" && idx !== 0) {
      y += LINE_HEIGHT;
    }

    doc.setFont("courier", STYLE[el.type] || "normal");
    const x = MARGIN_LEFT + (INDENT[el.type] || 0);
    const maxWidth = WIDTH[el.type] || CONTENT_W;
    const display = el.type === "parenthetical" ? `(${text})` : text;
    const lines = doc.splitTextToSize(display, maxWidth);

    ensureSpace(lines.length);
    lines.forEach((line) => {
      if (el.type === "transition") {
        doc.text(line, MARGIN_LEFT + CONTENT_W, y, { align: "right" });
      } else {
        doc.text(line, x, y);
      }
      y += LINE_HEIGHT;
    });

    if (el.type === "dialogue") y += LINE_HEIGHT * 0.3;
  });

  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("courier", "normal");
    doc.setFontSize(12);
    doc.text(`${p - 1}.`, PAGE_W - MARGIN_RIGHT, 50, { align: "right" });
  }

  const fileSafe = (projectName || "guion").toLowerCase().replace(/[^a-z0-9]+/g, "_");
  doc.save(`guion_${fileSafe}.pdf`);
}
