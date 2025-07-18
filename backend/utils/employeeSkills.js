// backend/utils/employeeSkills.js
// Script to output each employee's required skills and levels based on all their roles
// Now uses MongoDB models instead of JSON files

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./db");
const Employee = require("../models/Employee");
const CompetencyMap = require("../models/CompetencyMap");

async function getRoleSkills(competencyMaps) {
  const roleSkills = {};
  let skillList = new Set();
  competencyMaps.forEach((row) => {
    const role = row.role;
    const skills = row.skills || {};
    Object.keys(skills).forEach((k) => skillList.add(k));
    roleSkills[role] = skills;
  });
  return { roleSkills, skillList: Array.from(skillList) };
}

async function employeeSkills() {
  await connectDB();
  const competencyMaps = await CompetencyMap.find({});
  const employees = await Employee.find({});
  const { roleSkills, skillList } = await getRoleSkills(competencyMaps);

  const outputJson = [];

  employees.forEach((emp) => {
    const name = emp.Employee;
    const department = emp.Department || "";
    const roles = Array.isArray(emp.Roles) ? emp.Roles : [];
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

  console.log("Employee skill levels:", JSON.stringify(outputJson, null, 2));
  mongoose.connection.close();
  return outputJson;
}

if (require.main === module) {
  employeeSkills();
}
