// backend/utils/employeeSkills.js
// Script to output each employee's required skills and levels based on all their roles
// Output: excel_data/employee_skills_levels.csv

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");

const competencyMapPath = path.join(
  __dirname,
  "../../competency_map_Sheet1.csv"
);
const employeeListPath = path.join(__dirname, "../../employee - Sheet1.csv");
const outputPath = path.join(
  __dirname,
  "../../excel_data/employee_skills_levels.csv"
);

function readCompetencyMap() {
  return new Promise((resolve) => {
    const results = [];
    fs.createReadStream(competencyMapPath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results));
  });
}

function readEmployeeList() {
  return new Promise((resolve) => {
    const results = [];
    fs.createReadStream(employeeListPath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results));
  });
}

function getRoleSkills(competencyMap) {
  const roleSkills = {};
  const headers = Object.keys(competencyMap[0]).filter((h) => h !== "Role");
  competencyMap.forEach((row) => {
    const role = row["Role"];
    const skills = {};
    headers.forEach((h) => {
      if (row[h] && row[h] !== "-" && row[h] !== "") {
        skills[h] = row[h];
      }
    });
    roleSkills[role] = skills;
  });
  return { roleSkills, skillList: headers };
}

async function employeeSkills() {
  const competencyMap = await readCompetencyMap();
  const employees = await readEmployeeList();
  const { roleSkills, skillList } = getRoleSkills(competencyMap);

  const outputRows = [];
  const outputJson = [];
  // Header: Employee,Department,Role1,Role2,Role3,Skill,Level
  outputRows.push(
    [
      "Employee",
      "Department",
      "Role1",
      "Role2",
      "Role3",
      "Skill",
      "Level",
    ].join(",")
  );

  employees.forEach((emp) => {
    const name = emp.Employee;
    const department = emp["Department/ Designation"] || "";
    // Normalize and filter roles
    const roles = [emp.Role1, emp.Role2, emp.Role3]
      .map((r) => (r ? r.trim() : ""))
      .filter((r) => r);
    // Combine skills from all roles, take max level if skill appears in multiple roles
    const skillLevels = {};
    roles.forEach((role) => {
      const skills = roleSkills[role] || {};
      Object.entries(skills).forEach(([skill, level]) => {
        if (!skillLevels[skill] || Number(level) > Number(skillLevels[skill])) {
          skillLevels[skill] = level;
        }
      });
    });
    // Output one row per skill (CSV)
    Object.entries(skillLevels).forEach(([skill, level]) => {
      outputRows.push(
        [
          `"${name}"`,
          `"${department}"`,
          `"${emp.Role1 || ""}"`,
          `"${emp.Role2 || ""}"`,
          `"${emp.Role3 || ""}"`,
          `"${skill}"`,
          `"${level}"`,
        ].join(",")
      );
    });
    // Output JSON for frontend/API
    outputJson.push({
      Employee: name,
      Department: department,
      Roles: roles,
      Skills: Object.entries(skillLevels).map(([skill, level]) => ({
        skill,
        level,
      })),
    });
  });

  fs.writeFileSync(outputPath, outputRows.join("\n"), "utf8");
  fs.writeFileSync(
    outputPath.replace(".csv", ".json"),
    JSON.stringify(outputJson, null, 2),
    "utf8"
  );
  console.log(
    "Employee skill levels exported to",
    outputPath,
    "and JSON for API/frontend use."
  );
}

if (require.main === module) {
  employeeSkills();
}
