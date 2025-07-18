// Generic CRUD routes for all core entities
const express = require("express");
const router = express.Router();
const { fetchRoleCompetencies, setRetestAllowed } = require("../utils/sheets");
const Skill = require("../models/Skill");
const CompetencyMap = require("../models/CompetencyMap");

// Endpoint to allow retest for an employee/skill/level
router.post("/retest-allow", async (req, res) => {
  const { employee_id, skill, level } = req.body;
  if (!employee_id || !skill || !level) {
    return res
      .status(400)
      .json({ error: "Missing employee_id, skill, or level" });
  }
  try {
    await setRetestAllowed(employee_id, skill, level);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Special route for role_competencies that fetches from Google Sheets
router.get("/role_competencies", async (req, res) => {
  try {
    const data = await fetchRoleCompetencies();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch role competencies" });
  }
});

// Test endpoint to verify Google Sheets integration
router.get("/test-role-competencies", async (req, res) => {
  try {
    const data = await fetchRoleCompetencies();
    res.json({
      success: true,
      count: data.length,
      sample: data.slice(0, 3),
      message: "Google Sheets integration is working",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Google Sheets integration failed",
    });
  }
});

// GET all skills
router.get("/skills", async (req, res) => {
  try {
    const skills = await Skill.find({});
    res.json(skills);
  } catch (e) {
    res.status(500).json({ error: "Failed to load skills" });
  }
});

// POST add new skill
router.post("/skills", async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Skill name is required." });
  }
  try {
    // Generate a new unique code (skXX)
    const skills = await Skill.find({});
    let maxNum = 0;
    skills.forEach((s) => {
      const match = String(s.code).match(/^sk(\d+)$/);
      if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
    });
    const newCode = `sk${String(maxNum + 1).padStart(2, "0")}`;
    const newSkill = await Skill.create({ name, code: newCode });
    res.json(newSkill);
  } catch (e) {
    res.status(500).json({ error: "Failed to save new skill." });
  }
});

// Add new role to competency map
router.post("/competency_map", async (req, res) => {
  const { Role, Skills } = req.body;
  if (!Role || !Skills || typeof Skills !== "object") {
    return res.status(400).json({ error: "Role and Skills are required." });
  }
  try {
    const newMap = await CompetencyMap.create({ role: Role, skills: Skills });
    res.json({ success: true, map: newMap });
  } catch (e) {
    res.status(500).json({ error: "Failed to update competency map" });
  }
});

// GET all unique roles from CompetencyMap for dropdowns
router.get("/roles", async (req, res) => {
  try {
    const roles = await CompetencyMap.distinct("role");
    res.json(roles.filter(Boolean));
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

module.exports = router;
