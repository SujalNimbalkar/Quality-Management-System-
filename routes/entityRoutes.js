// Generic CRUD routes for all core entities
const express = require("express");
const router = express.Router();
const { readCsv, writeCsv } = require("../utils/csvUtils");
const { fetchRoleCompetencies } = require("../utils/sheets");

const entityFiles = {
  employees: "employees.csv",
  roles: "roles.csv",
  competencies: "competencies.csv",
  employee_roles: "employee_roles.csv",
  role_competencies: "role_competencies.csv",
  employee_competencies: "employee_competencies.csv",
  assessments: "assessments.csv",
  employee_assessment_results: "employee_assessment_results.csv",
  qualifications: "qualifications.csv",
};

// Special route for role_competencies that fetches from Google Sheets
router.get("/role_competencies", async (req, res) => {
  try {
    const data = await fetchRoleCompetencies();
    res.json(data);
  } catch (error) {
    console.error("Error fetching role competencies:", error);
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
    console.error("Error testing role competencies:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Google Sheets integration failed",
    });
  }
});

// Generic GET all
router.get("/:entity", (req, res) => {
  const file = entityFiles[req.params.entity];
  if (!file) return res.status(404).json({ error: "Entity not found" });
  const data = readCsv(file);
  res.json(data);
});

// Generic POST (add new)
router.post("/:entity", (req, res) => {
  const file = entityFiles[req.params.entity];
  if (!file) return res.status(404).json({ error: "Entity not found" });
  const data = readCsv(file);
  data.push(req.body);
  writeCsv(file, data);
  res.json({ success: true });
});

// Generic PUT (update by id)
router.put("/:entity/:id", (req, res) => {
  const file = entityFiles[req.params.entity];
  if (!file) return res.status(404).json({ error: "Entity not found" });
  let data = readCsv(file);
  const idx = data.findIndex((row) => String(row.id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Record not found" });
  data[idx] = { ...data[idx], ...req.body };
  writeCsv(file, data);
  res.json({ success: true });
});

// Generic DELETE (by id)
router.delete("/:entity/:id", (req, res) => {
  const file = entityFiles[req.params.entity];
  if (!file) return res.status(404).json({ error: "Entity not found" });
  let data = readCsv(file);
  data = data.filter((row) => String(row.id) !== req.params.id);
  writeCsv(file, data);
  res.json({ success: true });
});

module.exports = router;
