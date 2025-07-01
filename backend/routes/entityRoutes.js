// Generic CRUD routes for all core entities
const express = require("express");
const router = express.Router();
const { readCsv, writeCsv } = require("../utils/csvUtils");

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
