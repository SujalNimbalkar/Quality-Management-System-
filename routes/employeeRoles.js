// backend/routes/employeeRoles.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const router = express.Router();
const employeeListPath = path.join(__dirname, "../../employee - Sheet1.csv");

// GET /api/employee/roles?employeeId=EmployeeId
router.get("/roles", async (req, res) => {
  const employeeId = req.query.employeeId;
  if (!employeeId) return res.status(400).json({ error: "Missing employeeId" });
  try {
    // Load employee_skills_levels.json
    const employeeSkills = require("../../excel_data/employee_skills_levels.json");
    const emp = employeeSkills.find(
      (e) => String(e.employee_id) === String(employeeId)
    );
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    res.json({ roles: emp.Roles || [], name: emp.Employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
