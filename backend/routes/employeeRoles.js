// backend/routes/employeeRoles.js
const express = require("express");
const Employee = require("../models/Employee");

const router = express.Router();

/**
 * GET /api/employee/roles
 * Query params: id (employee_id) or name (employee name)
 * Returns: { employee_id, name, department, roles: [] }
 */
router.get("/roles", async (req, res) => {
  const { name, id } = req.query;
  if (!name && !id) {
    return res.status(400).json({ error: "Missing employee name or id" });
  }

  try {
    let emp = null;
    if (id) {
      emp = await Employee.findOne({
        $or: [{ employee_id: id }, { employee_id: Number(id) }],
      });
    } else if (name) {
      emp = await Employee.findOne({
        $or: [
          { Employee: { $regex: new RegExp(`^${name.trim()}$`, "i") } },
          { name: { $regex: new RegExp(`^${name.trim()}$`, "i") } },
        ],
      });
    }

    if (!emp) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const employee_id = emp.employee_id || null;
    const employeeName = emp.Employee || emp.name || "N/A";
    const department =
      emp.Department || emp.department || emp.designation || null;
    const roles = Array.isArray(emp.Roles) ? emp.Roles : [];

    return res.json({
      employee_id,
      name: employeeName,
      department,
      roles,
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to load employees" });
  }
});

/**
 * GET /api/employee/skills/:id
 * Returns: { employee_id, name, department, skills: [] }
 */
router.get("/skills/:id", async (req, res) => {
  const employeeId = req.params.id;
  try {
    const emp = await Employee.findOne({
      $or: [{ employee_id: employeeId }, { employee_id: Number(employeeId) }],
    });
    if (!emp) {
      return res.status(404).json({ error: "Employee not found" });
    }
    return res.json({
      employee_id: emp.employee_id || null,
      name: emp.Employee || emp.name || null,
      department: emp.Department || emp.department || emp.designation || null,
      skills: emp.Skills || [],
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to load employees" });
  }
});

module.exports = router;
