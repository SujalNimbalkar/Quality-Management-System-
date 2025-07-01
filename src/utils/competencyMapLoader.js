// Utility to load and parse the Competency Map CSV
export async function loadCompetencyMap(url) {
  const res = await fetch(url);
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  // Find the header row (starts with Role)
  const headerIdx = lines.findIndex((l) => l.startsWith("Role,"));
  if (headerIdx === -1) throw new Error("Header row not found");
  const headers = lines[headerIdx]
    .split(",")
    .map((h) => h.replace(/\r|\n|"/g, "").trim());
  const data = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const row = lines[i].split(",");
    if (!row[0] || row[0].startsWith("Proficiency")) break;
    const obj = {};
    headers.forEach(
      (h, idx) => (obj[h] = row[idx]?.replace(/\r|\n|"/g, "").trim())
    );
    data.push(obj);
  }
  return { headers, data };
}
