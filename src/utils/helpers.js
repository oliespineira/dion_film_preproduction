export function rotationFor(id) {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 1000;
  return { deg: (hash % 7) - 3, lift: (hash % 5) - 2 };
}

export function blankCharacter() {
  return { name: "", one_liner: "", physical: "", psychological: "", background: "", traits: [] };
}

export function blankLocation() {
  return { name: "", physical: "", history: "", atmosphere: "" };
}

// Classic strip-board color code: Day/Ext = yellow, Day/Int = white,
// Night/Int = blue, Night/Ext = green.
export function stripeClassFor(intExt, dayNight) {
  if (dayNight === "DÍA" && intExt === "EXT") return "stripe-day-ext";
  if (dayNight === "DÍA" && intExt === "INT") return "stripe-day-int";
  if (dayNight === "NOCHE" && intExt === "INT") return "stripe-night-int";
  return "stripe-night-ext";
}

export function blankScene() {
  return {
    scene_number: "",
    int_ext: "INT",
    day_night: "DÍA",
    location_id: null,
    location_name: "",
    description: "",
    page_range: "",
    eighths: "",
    character_ids: [],
    has_extras: false,
    extras_notes: "",
    wardrobe: "",
    makeup_hair: "",
    set_design: "",
    props: "",
    vehicles: "",
    animals_children: "",
  };
}

// Standard Spanish shot-size scale, widest to closest.
export const FRAMING_SCALE = [
  "Gran Plano General",
  "Plano General",
  "Plano Entero",
  "Plano Americano",
  "Plano Medio",
  "Primer Plano",
  "Primerísimo Primer Plano",
  "Plano Detalle",
];

export const ANGLE_OPTIONS = ["Normal", "Picado", "Contrapicado", "Cenital", "Nadir", "Inclinado (Dutch)"];

export const MOVEMENT_OPTIONS = [
  "Fijo",
  "Panorámica horizontal",
  "Panorámica vertical",
  "Travelling",
  "Grúa",
  "Steadicam",
  "Zoom in",
  "Zoom out",
  "Dolly",
];

export function framingIndex(value) {
  if (!value) return -1;
  const idx = FRAMING_SCALE.findIndex((f) => f.toLowerCase() === value.trim().toLowerCase());
  return idx;
}

export function blankShot() {
  return {
    shot_number: "",
    framing: "",
    angle: "",
    movement: "",
    lens: "",
    description: "",
    duration_seconds: "",
    notes: "",
  };
}

export function blankShootDay() {
  return {
    day_label: "",
    day_date: "",
    general_call_time: "",
    main_location: "",
    notes: "",
  };
}

export function blankScheduleSlot() {
  return { scene_id: "", scheduled_time: "", notes: "" };
}

export const ROLE_TYPES = ["Actor", "Equipo técnico", "Equipo artístico"];

export function blankCallTime() {
  return { person_name: "", role_type: "Actor", character_id: "", call_time: "", notes: "" };
}

export const DEPARTMENTS = [
  { key: "Arte", color: "#8e5ea8", kind: "scene-fields", fields: [{ field: "set_design", label: "Escenografía" }, { field: "props", label: "Atrezo" }] },
  { key: "Vestuario", color: "#b5651d", kind: "scene-fields", fields: [{ field: "wardrobe", label: "Vestuario" }] },
  { key: "Maquillaje", color: "#d77a9e", kind: "scene-fields", fields: [{ field: "makeup_hair", label: "Maquillaje y peluquería" }] },
  { key: "Fotografía", color: "#4a7fb5", kind: "shots" },
  { key: "Sonido", color: "#4a9d6b", kind: "scene-fields", fields: [{ field: "sound_notes", label: "Necesidades de sonido" }] },
  { key: "Producción", color: "#6b6b6b", kind: "scene-fields", fields: [{ field: "production_notes", label: "Notas de producción" }] },
  { key: "Dirección", color: "#b23a2e", kind: "scene-fields", fields: [{ field: "director_notes", label: "Notas de dirección" }] },
];

// ---------- screenplay editor ----------

export const ELEMENT_TYPES = ["scene_heading", "action", "character", "parenthetical", "dialogue", "transition"];

export const ELEMENT_LABELS = {
  scene_heading: "Encabezado de escena",
  action: "Acción",
  character: "Personaje",
  parenthetical: "Acotación",
  dialogue: "Diálogo",
  transition: "Transición",
};

export const NEXT_TYPE_ON_ENTER = {
  scene_heading: "action",
  action: "action",
  character: "dialogue",
  parenthetical: "dialogue",
  dialogue: "character",
  transition: "scene_heading",
};

export function nextElementType(type, direction = 1) {
  const idx = ELEMENT_TYPES.indexOf(type);
  const len = ELEMENT_TYPES.length;
  return ELEMENT_TYPES[(idx + direction + len) % len];
}

export function blankElement(type = "action", text = "") {
  return { id: crypto.randomUUID ? crypto.randomUUID() : "el-" + Math.random().toString(36).slice(2), type, text };
}