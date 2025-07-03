const normalizeSkillName = (s) =>
  s
    .replace(/\r?\n|\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

export const skillNameToCode = {
  "5S": "sk01",
  Safety: "sk02",
  "Basics of Electronics": "sk03",
  "Basics of Quality": "sk04",
  "SMT Electronics Assembly": "sk05",
  "Manual Electronics Assembly": "sk06",
  "Mechanical Assembly": "sk07",
  "Testing - Electrical/ Electronic Parts": "sk08",
  "Testing - PCBA": "sk09",
  "Dimensional inspection (gauges)": "sk10",
  "Dimensional inspection (instruments)": "sk11",
  "Laser Printing": "sk12",
  "Wire Cutting-Stripping": "sk13",
  "Wire Crimping": "sk14",
  Packing: "sk15",
  "Leadership & Team Management": "sk16",
  "Communication & Interpersonal Skill": "sk17",
  "Problem Solving & Critical Thinking": "sk18",
  "Planning & Time Management": "sk19",
  "IATF 16949/ISO 9001:2015 QMS Awareness": "sk20",
  "Material Planning & Inventory Control": "sk21",
  "Supply Chain Management": "sk22",
  "Data Analytics and Reporting": "sk23",
  "MS Excel": "sk24",
  SPC: "sk25",
  MSA: "sk26",
  "4M Change": "sk27",
  FMEA: "sk28",
  "Abnormality Handling": "sk29",
  "PPAP & APQP": "sk30",
  Kaizen: "sk31",
  "Poka Yoke": "sk32",
  "7 QC Tools": "sk33",
  "Compliance & Ethical Responsibility": "sk34",
  "Internal Auditor Certification*": "sk35",
  FIFO: "sk36",
  "Rework on electronic parts": "sk37",
  "Sampling and inspection": "sk38",
};

export const skillCodeToName = Object.fromEntries(
  Object.entries(skillNameToCode).map(([name, code]) => [code, name])
);

export const normalizedSkillNameToCode = Object.fromEntries(
  Object.entries(skillNameToCode).map(([name, code]) => [
    normalizeSkillName(name),
    code,
  ])
);
