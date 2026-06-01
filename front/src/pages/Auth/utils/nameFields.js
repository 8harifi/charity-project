/** Split "نام نام خانوادگی" into first/last for draft restore. */
export function joinFullName(first, last) {
  return [first, last].filter(Boolean).join(" ").trim();
}

export function splitFullName(full) {
  const p = (full || "").trim().split(/\s+/);
  if (!p.length) return ["", ""];
  if (p.length === 1) return [p[0], ""];
  return [p.slice(0, -1).join(" "), p[p.length - 1]];
}
