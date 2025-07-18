const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const connectDB = require("./utils/db");
const Employee = require("./models/Employee");
const Skill = require("./models/Skill");
const CompetencyMap = require("./models/CompetencyMap");

async function migrate() {
  await connectDB();

  // 1. Import Employees
  const employeesPath = path.join(
    __dirname,
    "../excel_data/employee_skills_levels.json"
  );
  const employeesData = JSON.parse(fs.readFileSync(employeesPath, "utf8"));
  await Employee.deleteMany({});
  await Employee.insertMany(employeesData);
  console.log(`Imported ${employeesData.length} employees.`);

  // 2. Import Skills
  const skillsPath = path.join(__dirname, "../excel_data/skills.json");
  const skillsData = JSON.parse(fs.readFileSync(skillsPath, "utf8"));
  await Skill.deleteMany({});
  await Skill.insertMany(skillsData);
  console.log(`Imported ${skillsData.length} skills.`);

  // 3. Import Competency Maps
  const competencyMapPath = path.join(
    __dirname,
    "../excel_data/competency_map_Sheet1.json"
  );
  const competencyMapData = JSON.parse(
    fs.readFileSync(competencyMapPath, "utf8")
  );
  // Transform to match schema: { role, skills }
  const competencyDocs = competencyMapData.map((entry) => ({
    role: entry.Role,
    skills: entry.Skills,
  }));
  await CompetencyMap.deleteMany({});
  await CompetencyMap.insertMany(competencyDocs);
  console.log(`Imported ${competencyDocs.length} competency maps.`);

  mongoose.connection.close();
  console.log("Migration complete. MongoDB connection closed.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  mongoose.connection.close();
});
