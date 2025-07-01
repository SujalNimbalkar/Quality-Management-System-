// Script to assign tests to employees as per their role using competency_map_Sheet1.csv and employee_list.xlsx
// Place this file in backend/utils/assignTests.js

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");

const competencyMapPath = path.join(
  __dirname,
  "../../competency_map_Sheet1.csv"
);
const employeeListPath = path.join(
  __dirname,
  "../../excel_data/employee_list.xlsx"
);
const outputPath = path.join(
  __dirname,
  "../../excel_data/assigned_tests_new.csv"
);

function readCompetencyMap() {
  return new Promise((resolve) => {
    const results = [];
    fs.createReadStream(competencyMapPath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results));
  });
}

function readEmployeeList() {
  const workbook = xlsx.readFile(employeeListPath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  return data;
}

function getRoleTests(competencyMap) {
  const roleTests = {};
  const headers = Object.keys(competencyMap[0]).filter((h) => h !== "Role");
  competencyMap.forEach((row) => {
    const role = row["Role"];
    const tests = headers.filter(
      (h) => row[h] && row[h] !== "-" && row[h] !== ""
    );
    roleTests[role] = tests;
  });
  return roleTests;
}

async function assignTests() {
  const competencyMap = await readCompetencyMap();
  const employees = readEmployeeList();
  const roleTests = getRoleTests(competencyMap);

  const assignments = employees.map((emp) => {
    const role = emp.Role;
    const tests = roleTests[role] || [];
    return {
      EmployeeID: emp.EmployeeID || emp.ID || emp["Emp ID"] || "",
      Name: emp.Name || emp["Employee Name"] || "",
      Role: role,
      AssignedTests: tests.join("; "),
    };
  });

  const header = "EmployeeID,Name,Role,AssignedTests\n";
  const rows = assignments.map(
    (a) => `"${a.EmployeeID}","${a.Name}","${a.Role}","${a.AssignedTests}"`
  );
  fs.writeFileSync(outputPath, header + rows.join("\n"), "utf8");
  console.log("Assignment complete. Output:", outputPath);
}

if (require.main === module) {
  assignTests();
}
