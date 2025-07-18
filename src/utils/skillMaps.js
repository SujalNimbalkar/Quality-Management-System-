const normalizeSkillName = (s) =>
  s
    .replace(/\r?\n|\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

// Deprecated: Use backend /api/skills instead for dynamic skills
// export const skillNameToCode = { ... }
// export const skillCodeToName = { ... }

export async function fetchSkills() {
  const res = await fetch("/api/skills");
  if (!res.ok) throw new Error("Failed to fetch skills");
  return await res.json();
}

export const normalizedSkillNameToCode = Object.fromEntries(
  Object.entries(skillNameToCode).map(([name, code]) => [
    normalizeSkillName(name),
    code,
  ])
);
