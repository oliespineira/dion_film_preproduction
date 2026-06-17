import { Plus, ChevronUp, ChevronDown, Pencil, Loader2, FileDown } from "lucide-react";
import { exportCallSheetPdf } from "../utils/exportCallSheetPdf";

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export default function CallSheetView({
  projectName,
  days,
  loadingDays,
  selectedDayId,
  onSelectDay,
  onNewDay,
  onEditDay,
  scenes,
  characters,
  scheduleSlots,
  callTimes,
  loadingSheet,
  onAddSlot,
  onEditSlot,
  onReorderSlot,
  onAddCallTime,
  onEditCallTime,
  onReorderCallTime,
}) {
  const activeDay = days.find((d) => d.id === selectedDayId);

  function sceneLabel(sceneId) {
    const idx = scenes.findIndex((s) => s.id === sceneId);
    if (idx === -1) return "(escena eliminada)";
    const s = scenes[idx];
    return (s.scene_number || idx + 1) + " · " + s.int_ext + "/" + s.day_night + (s.description ? " · " + s.description.slice(0, 40) : "");
  }
  function characterName(id) {
    return characters.find((c) => c.id === id)?.name;
  }

  function handleExportPdf() {
    exportCallSheetPdf({
      projectName,
      day: activeDay,
      scheduleRows: scheduleSlots.map((slot) => ({
        time: slot.scheduled_time,
        scene: sceneLabel(slot.scene_id),
        notes: slot.notes,
      })),
      callRows: callTimes.map((c) => ({
        time: c.call_time,
        name: c.person_name,
        role: c.role_type,
        character: characterName(c.character_id) || "",
        notes: c.notes,
      })),
    });
  }

  if (loadingDays) {
    return (
      <div className="breakdown-section">
        <div className="board-empty">
          <Loader2 className="spin" size={22} />
          <p>Cargando días de rodaje…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="breakdown-section">
      <div className="day-tabs">
        {days.map((d, i) => (
          <button key={d.id} className={d.id === selectedDayId ? "day-tab active" : "day-tab"} onClick={() => onSelectDay(d.id)}>
            {d.day_label || `Día ${i + 1}`}
          </button>
        ))}
        <button className="day-tab day-tab-add" onClick={onNewDay}>
          <Plus size={14} /> Nuevo día
        </button>
      </div>

      {!activeDay ? (
        <div className="board-empty">
          <p>{days.length === 0 ? "Todavía no hay días de rodaje. Crea el primero." : "Elige un día arriba."}</p>
        </div>
      ) : (
        <>
          <div className="day-header">
            <div className="day-header-info">
              <strong>{activeDay.day_label}</strong>
              {activeDay.day_date && <span> · {formatDate(activeDay.day_date)}</span>}
              {activeDay.general_call_time && <span> · Citación general {activeDay.general_call_time}</span>}
              {activeDay.main_location && <span> · {activeDay.main_location}</span>}
              {activeDay.notes && <div className="day-notes">{activeDay.notes}</div>}
            </div>
            <div className="day-header-actions">
              <button className="btn-secondary" onClick={handleExportPdf}>
                <FileDown size={14} /> Exportar PDF
              </button>
              <button className="icon-btn" onClick={() => onEditDay(activeDay)} aria-label="Editar día">
                <Pencil size={15} />
              </button>
            </div>
          </div>

          {loadingSheet ? (
            <div className="board-empty">
              <Loader2 className="spin" size={22} />
              <p>Cargando horario…</p>
            </div>
          ) : (
            <>
              <h3 className="section-title">Horario del día</h3>
              <div className="breakdown-toolbar">
                <button className="add-btn character" onClick={onAddSlot}>
                  <Plus size={15} /> Añadir escena al horario
                </button>
              </div>
              <div className="breakdown-wrap">
                {scheduleSlots.length === 0 ? (
                  <div className="board-empty">
                    <p>Todavía no hay escenas planificadas para este día.</p>
                  </div>
                ) : (
                  <table className="breakdown">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Escena</th>
                        <th>Notas</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleSlots.map((slot) => (
                        <tr key={slot.id} onClick={() => onEditSlot(slot)}>
                          <td className="scene-num">{slot.scheduled_time}</td>
                          <td>{sceneLabel(slot.scene_id)}</td>
                          <td className="cell-wrap">{slot.notes}</td>
                          <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="icon-btn" onClick={() => onReorderSlot(slot.id, "up")} aria-label="Subir">
                              <ChevronUp size={14} />
                            </button>
                            <button className="icon-btn" onClick={() => onReorderSlot(slot.id, "down")} aria-label="Bajar">
                              <ChevronDown size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <h3 className="section-title">Citaciones</h3>
              <div className="breakdown-toolbar">
                <button className="add-btn location" onClick={onAddCallTime}>
                  <Plus size={15} /> Añadir citación
                </button>
              </div>
              <div className="breakdown-wrap">
                {callTimes.length === 0 ? (
                  <div className="board-empty">
                    <p>Todavía no hay citaciones para este día.</p>
                  </div>
                ) : (
                  <table className="breakdown">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Personaje</th>
                        <th>Notas</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {callTimes.map((c) => (
                        <tr key={c.id} onClick={() => onEditCallTime(c)}>
                          <td className="scene-num">{c.call_time}</td>
                          <td>{c.person_name}</td>
                          <td>{c.role_type}</td>
                          <td>{characterName(c.character_id) || ""}</td>
                          <td className="cell-wrap">{c.notes}</td>
                          <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="icon-btn" onClick={() => onReorderCallTime(c.id, "up")} aria-label="Subir">
                              <ChevronUp size={14} />
                            </button>
                            <button className="icon-btn" onClick={() => onReorderCallTime(c.id, "down")} aria-label="Bajar">
                              <ChevronDown size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
