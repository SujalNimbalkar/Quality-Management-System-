// Express routes for employee-related endpoints
const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const CompetencyMap = require("../models/CompetencyMap");

// GET all employees (full objects)
router.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find({ employee_id: { $exists: true } });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

// GET employee by id
router.get("/employee/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const emp = await Employee.findOne({
      $or: [{ employee_id: id }, { employee_id: Number(id) }],
    });
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    res.json(emp);
  } catch (e) {
    res.status(500).json({ message: "Failed to load employees" });
  }
});

// GET employee by email
router.get("/employee-by-email/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email || "").toLowerCase();
  try {
    const emp = await Employee.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    res.json(emp);
  } catch (e) {
    res.status(500).json({ message: "Failed to load employees" });
  }
});

// GET all emails
router.get("/employee-emails", async (req, res) => {
  try {
    const employees = await Employee.find({
      email: { $exists: true, $ne: null },
    });
    res.json(employees);
  } catch (e) {
    res.status(500).json({ message: "Failed to load employees" });
  }
});

// GET all skills for all employees
router.get("/employee-skills", async (req, res) => {
  try {
    const employees = await Employee.find(
      { employee_id: { $exists: true } },
      { employee_id: 1, Skills: 1 }
    );
    const allSkills = employees.map((e) => ({
      employee_id: e.employee_id,
      skills: e.Skills,
    }));
    res.json(allSkills);
  } catch (e) {
    res.status(500).json({ message: "Failed to load employees" });
  }
});

// GET skills for a specific employee
router.get("/employee/:id/skills", async (req, res) => {
  const id = req.params.id;
  try {
    const emp = await Employee.findOne({
      $or: [{ employee_id: id }, { employee_id: Number(id) }],
    });
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    res.json({ employee_id: emp.employee_id, skills: emp.Skills || [] });
  } catch (e) {
    res.status(500).json({ message: "Failed to load employees" });
  }
});

// GET competency map
router.get("/competency_map", async (req, res) => {
  try {
    const maps = await CompetencyMap.find({});
    res.json(maps);
  } catch (e) {
    res.status(500).json({ error: "Failed to load competency map" });
  }
});

// GET employee_id by email (for login)
router.get("/employee-id-by-email/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email || "").toLowerCase();
  try {
    const emp = await Employee.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    res.json({ employee_id: emp.employee_id });
  } catch (e) {
    res.status(500).json({ message: "Failed to load employees" });
  }
});

// GET all employee skills levels (raw JSON)
router.get("/employee_skills_levels", async (req, res) => {
  try {
    const employees = await Employee.find({});
    res.json(employees);
  } catch (e) {
    res.status(500).json({ error: "Failed to load employee skills levels" });
  }
});

// POST add new employee
router.post("/employee_skills_levels", async (req, res) => {
  try {
    // Find max employee_id
    const lastEmp = await Employee.findOne({}).sort({ employee_id: -1 });
    let maxId = 0;
    if (lastEmp && !isNaN(Number(lastEmp.employee_id))) {
      maxId = Number(lastEmp.employee_id);
    }
    const newEmployee = { ...req.body, employee_id: String(maxId + 1) };
    const created = await Employee.create(newEmployee);
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: "Failed to save new employee." });
  }
});

// PUT update employee roles
router.put("/employee/:id", async (req, res) => {
  const id = req.params.id;
  const { Roles, Employee: empName, name, email, Skills } = req.body;
  if (!Array.isArray(Roles)) {
    return res.status(400).json({ message: "Roles must be an array" });
  }
  try {
    const update = { Roles };
    if (typeof empName === "string" && empName.trim()) {
      update.Employee = empName.trim();
    }
    if (typeof email === "string" && email.trim()) {
      update.email = email.trim();
    }
    if (Array.isArray(Skills)) {
      update.Skills = Skills;
    }
    const updated = await Employee.findOneAndUpdate(
      { $or: [{ employee_id: id }, { employee_id: Number(id) }] },
      { $set: update },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee updated", employee: updated });
  } catch (e) {
    res.status(500).json({ message: "Failed to save employee data" });
  }
});

// DELETE employee by id
router.delete("/employee/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const removed = await Employee.findOneAndDelete({
      $or: [{ employee_id: id }, { employee_id: Number(id) }],
    });
    if (!removed)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted", employee: removed });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete employee" });
  }
});

module.exports = router;
