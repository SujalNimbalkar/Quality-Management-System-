// backend/routes/employeeRoles.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const router = express.Router();
const employeeListPath = path.join(__dirname, "../../employee - Sheet1.csv");

// GET /api/employee/roles?name=EmployeeName
router.get("/roles", (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: "Missing employee name" });

  const results = [];
  fs.createReadStream(employeeListPath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      const emp = results.find(
        (e) =>
          (e.Employee || "").trim().toLowerCase() === name.trim().toLowerCase()
      );
      if (!emp) return res.status(404).json({ error: "Employee not found" });
      const roles = [emp.Role1, emp.Role2, emp.Role3]
        .map((r) => (r ? r.trim() : ""))
        .filter((r) => r);
      res.json({
        name: emp.Employee,
        department: emp["Department/ Designation"] || "",
        roles,
      });
    });
});

module.exports = router;
