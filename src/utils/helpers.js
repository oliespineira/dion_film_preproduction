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
