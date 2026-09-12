// Deterministic, name-derived gradient so server icons get some visual
// weight without needing uploaded server art.
export function gradientFor(name) {
  let hash = 0;
  for (const ch of name || "") hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return `linear-gradient(135deg, hsl(${hash} 62% 42%), hsl(${(hash + 45) % 360} 55% 24%))`;
}

export function initials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
