import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export function exportCallSheetPdf({ projectName, day, scheduleRows, callRows }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CITACIÓN DE RODAJE", marginX, y);

  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(projectName || "", 555 - marginX, y, { align: "right" });
  doc.setTextColor(0);
  y += 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(day.day_label || "Día de rodaje", marginX, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const headerLine = [
    day.day_date ? "Fecha: " + formatDate(day.day_date) : null,
    day.general_call_time ? "Citación general: " + day.general_call_time : null,
    day.main_location ? "Localización: " + day.main_location : null,
  ]
    .filter(Boolean)
    .join("    ·    ");
  if (headerLine) {
    doc.text(headerLine, marginX, y);
    y += 16;
  }
  if (day.notes) {
    const lines = doc.splitTextToSize(day.notes, 555 - marginX * 2);
    doc.text(lines, marginX, y);
    y += lines.length * 12 + 6;
  }

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("HORARIO DEL DÍA", marginX, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [["Hora", "Escena", "Notas"]],
    body: scheduleRows.length > 0 ? scheduleRows.map((r) => [r.time || "", r.scene || "", r.notes || ""]) : [["—", "Sin escenas planificadas", ""]],
    headStyles: { fillColor: [178, 58, 46], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 220 } },
  });

  y = doc.lastAutoTable.finalY + 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CITACIONES", marginX, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [["Hora", "Nombre", "Tipo", "Personaje", "Notas"]],
    body:
      callRows.length > 0
        ? callRows.map((r) => [r.time || "", r.name || "", r.role || "", r.character || "", r.notes || ""])
        : [["—", "Sin citaciones añadidas", "", "", ""]],
    headStyles: { fillColor: [178, 58, 46], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 110 }, 2: { cellWidth: 90 }, 3: { cellWidth: 90 } },
  });

  const fileSafeLabel = (day.day_label || "dia_de_rodaje").toLowerCase().replace(/[^a-z0-9]+/g, "_");
  doc.save(`citacion_${fileSafeLabel}.pdf`);
}
