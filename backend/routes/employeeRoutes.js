// // Express routes for employee-related endpoints
// const express = require("express");
// const router = express.Router();
// const { loadEmployees } = require("../utils/excelUtils");
// const { readCsv } = require("../utils/csvUtils");

// // API to fetch all employees
// router.get("/employees", (req, res) => {
//   try {
//     // Use employees.csv instead of employee_list.xlsx
//     const employees = readCsv("employees.csv");
//     res.json(employees);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch employees" });
//   }
// });

// // API to get employee_id by email
// router.get("/employee-id-by-email/:email", (req, res) => {
//   const email = req.params.email?.toLowerCase();
//   const mapping = readCsv("employee_emails.csv");
//   const entry = mapping.find((m) => (m.email || "").toLowerCase() === email);
//   if (!entry) return res.status(404).json({ message: "Employee not found" });
//   res.json({ employee_id: entry.employee_id });
// });

// // API to check if an employee exists (for login validation)
// router.get("/employee-exists/:employeeId", (req, res) => {
//   const employeeId = req.params.employeeId;
//   // Use employees.csv for login validation
//   const employees = readCsv("employees.csv");
//   console.log("[DEBUG] Checking login for employeeId:", employeeId);
//   console.log(
//     "[DEBUG] Employees loaded:",
//     employees.map((e) => e.employee_id)
//   );
//   const employee = employees.find(
//     (emp) => String(emp.employee_id) === String(employeeId)
//   );
//   if (!employee) {
//     console.log("[DEBUG] Employee not found for id:", employeeId);
//     return res.status(404).json({ message: "Employee not found" });
//   }
//   const isAdminFlag = employeeId === "E1000";
//   res.json({ isAdmin: isAdminFlag });
// });

// // API to get all required tests for an employee (by employeeId)
// router.get("/employee/:employeeId/required-tests", (req, res) => {
//   const employeeId = String(req.params.employeeId);
//   // 1. Get all roles for this employee
//   const employeeRoles = readCsv("employee_roles.csv").filter(
//     (er) => String(er.employee_id) === employeeId
//   );
//   const roleIds = employeeRoles.map((er) => String(er.role_id));
//   // 2. For each role, get required competencies
//   const roleCompetencies = readCsv("role_competencies.csv").filter((rc) =>
//     roleIds.includes(String(rc.role_id))
//   );
//   const competencyIds = roleCompetencies.map((rc) => String(rc.competency_id));
//   // 3. For each competency, get required tests
//   const assessments = readCsv("assessments.csv").filter((a) =>
//     competencyIds.includes(String(a.competency_id))
//   );
//   const testNames = [
//     ...new Set(assessments.map((a) => a.test_name).filter(Boolean)),
//   ];
//   // 4. For each test, get the link (if available)
//   const testLinks = readCsv("test_links.csv");
//   const tests = testNames.map((name) => {
//     const linkObj = testLinks.find((tl) => tl.TestName === name);
//     return { testName: name, testLink: linkObj ? linkObj.TestLink : null };
//   });
//   res.json({ tests });
// });

// // API to get all unique tests for employee 26 (Quality Manager + Internal Auditor, no repeats)
// router.get("/employee/26/tests", (req, res) => {
//   try {
//     const employeeId = "26";
//     // Get all roles for employee 26
//     const employeeRoles = readCsv("employee_roles.csv").filter(
//       (er) => String(er.employee_id) === employeeId
//     );
//     // For this employee, get role_ids (should be [21, 5])
//     const roleIds = employeeRoles.map((er) => String(er.role_id));
//     // For both roles, get all required competencies
//     const roleCompetencies = readCsv("role_competencies.csv").filter((rc) =>
//       roleIds.includes(String(rc.role_id))
//     );
//     const competencyIds = roleCompetencies.map((rc) =>
//       String(rc.competency_id)
//     );
//     // For all competencies, get all required tests
//     const assessments = readCsv("assessments.csv").filter((a) =>
//       competencyIds.includes(String(a.competency_id))
//     );
//     // Remove duplicate test names
//     const testNames = [
//       ...new Set(assessments.map((a) => a.test_name).filter(Boolean)),
//     ];
//     // For each test, get the link (if available)
//     const testLinks = readCsv("test_links.csv");
//     const tests = testNames.map((name) => {
//       const linkObj = testLinks.find((tl) => tl.TestName === name);
//       return { testName: name, testLink: linkObj ? linkObj.TestLink : null };
//     });
//     res.json({ tests });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch tests for employee 26" });
//   }
// });

// // API to get employee details (name and department/designation) by employeeId
// router.get("/employee/:employeeId", (req, res) => {
//   const employeeId = req.params.employeeId;
//   let employees = [];
//   try {
//     employees = readCsv("employees.csv");
//   } catch (e) {
//     return res
//       .status(500)
//       .json({ message: "employees.csv not found or unreadable" });
//   }
//   let employee = employees.find(
//     (emp) => String(emp.employee_id) === String(employeeId)
//   );
//   if (!employee) {
//     return res.status(404).json({ message: "Employee not found" });
//   }
//   const name =
//     employee.Employee || employee.name || employee.employee_name || null;
//   const department =
//     employee["Department/ Designation"] ||
//     employee.department ||
//     employee.designation ||
//     null;
//   res.json({ name, department });
// });

// module.exports = router;

// Express routes for employee-related endpoints
const express = require("express");
const router = express.Router();
const { loadEmployees } = require("../utils/excelUtils");
const { readCsv } = require("../utils/csvUtils");
const { fetchRoleCompetencies } = require("../utils/sheets");

// API to fetch all employees
router.get("/employees", (req, res) => {
  try {
    // Use employees.csv instead of employee_list.xlsx
    const employees = readCsv("employees.csv");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

// API to get employee_id by email
router.get("/employee-id-by-email/:email", (req, res) => {
  const email = decodeURIComponent(req.params.email || "").toLowerCase();
  // employee_emails.csv should be in excel_data and have columns: employee_id,email
  const mapping = readCsv("employee_emails.csv");
  const entry = mapping.find((m) => (m.email || "").toLowerCase() === email);
  if (!entry) return res.status(404).json({ message: "Employee not found" });
  res.json({ employee_id: entry.employee_id });
});

// API to check if an employee exists (for login validation)
router.get("/employee-exists/:employeeId", (req, res) => {
  const employeeId = req.params.employeeId;
  // Use employees.csv for login validation
  const employees = readCsv("employees.csv");
  console.log("[DEBUG] Checking login for employeeId:", employeeId);
  console.log(
    "[DEBUG] Employees loaded:",
    employees.map((e) => e.employee_id)
  );
  const employee = employees.find(
    (emp) => String(emp.employee_id) === String(employeeId)
  );
  if (!employee) {
    console.log("[DEBUG] Employee not found for id:", employeeId);
    return res.status(404).json({ message: "Employee not found" });
  }
  const isAdminFlag = employeeId === "E1000";
  res.json({ isAdmin: isAdminFlag });
});

// API to get all required tests for an employee (by employeeId)
router.get("/employee/:employeeId/required-tests", async (req, res) => {
  try {
    const employeeId = String(req.params.employeeId);
    // 1. Get all roles for this employee
    const employeeRoles = readCsv("employee_roles.csv").filter(
      (er) => String(er.employee_id) === employeeId
    );
    const roleIds = employeeRoles.map((er) => String(er.role_id));
    // 2. For each role, get required competencies from Google Sheets
    const roleCompetencies = await fetchRoleCompetencies();
    const filteredRoleCompetencies = roleCompetencies.filter((rc) =>
      roleIds.includes(String(rc.role_id))
    );
    const competencyIds = filteredRoleCompetencies.map((rc) =>
      String(rc.competency_id)
    );
    // 3. For each competency, get required tests
    const assessments = readCsv("assessments.csv").filter((a) =>
      competencyIds.includes(String(a.competency_id))
    );
    const testNames = [
      ...new Set(assessments.map((a) => a.test_name).filter(Boolean)),
    ];
    // 4. For each test, get the link (if available)
    const testLinks = readCsv("test_links.csv");
    const tests = testNames.map((name) => {
      const linkObj = testLinks.find((tl) => tl.TestName === name);
      return { testName: name, testLink: linkObj ? linkObj.TestLink : null };
    });
    res.json({ tests });
  } catch (error) {
    console.error("Error fetching required tests:", error);
    res.status(500).json({ message: "Failed to fetch required tests" });
  }
});

// API to get all unique tests for employee 26 (Quality Manager + Internal Auditor, no repeats)
router.get("/employee/26/tests", async (req, res) => {
  try {
    const employeeId = "26";
    // Get all roles for employee 26
    const employeeRoles = readCsv("employee_roles.csv").filter(
      (er) => String(er.employee_id) === employeeId
    );
    // For this employee, get role_ids (should be [21, 5])
    const roleIds = employeeRoles.map((er) => String(er.role_id));
    // For both roles, get all required competencies from Google Sheets
    const roleCompetencies = await fetchRoleCompetencies();
    const filteredRoleCompetencies = roleCompetencies.filter((rc) =>
      roleIds.includes(String(rc.role_id))
    );
    const competencyIds = filteredRoleCompetencies.map((rc) =>
      String(rc.competency_id)
    );
    // For all competencies, get all required tests
    const assessments = readCsv("assessments.csv").filter((a) =>
      competencyIds.includes(String(a.competency_id))
    );
    // Remove duplicate test names
    const testNames = [
      ...new Set(assessments.map((a) => a.test_name).filter(Boolean)),
    ];
    // For each test, get the link (if available)
    const testLinks = readCsv("test_links.csv");
    const tests = testNames.map((name) => {
      const linkObj = testLinks.find((tl) => tl.TestName === name);
      return { testName: name, testLink: linkObj ? linkObj.TestLink : null };
    });
    res.json({ tests });
  } catch (error) {
    console.error("Error fetching tests for employee 26:", error);
    res.status(500).json({ message: "Failed to fetch tests for employee 26" });
  }
});

// API to get employee details (name and department/designation) by employeeId
router.get("/employee/:employeeId", (req, res) => {
  const employeeId = req.params.employeeId;
  let employees = [];
  try {
    employees = readCsv("employees.csv");
  } catch (e) {
    return res
      .status(500)
      .json({ message: "employees.csv not found or unreadable" });
  }
  let employee = employees.find(
    (emp) => String(emp.employee_id) === String(employeeId)
  );
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }
  const name =
    employee.Employee || employee.name || employee.employee_name || null;
  const department =
    employee["Department/ Designation"] ||
    employee.department ||
    employee.designation ||
    null;
  res.json({ name, department });
});

module.exports = router;
