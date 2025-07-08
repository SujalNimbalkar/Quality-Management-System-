// Generic CSV utility functions for CRUD operations
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

function getCsvPath(filename) {
  return path.join(__dirname, "../../excel_data", filename);
}

function readCsv(filename) {
  const filePath = getCsvPath(filename);
  if (!fs.existsSync(filePath)) return [];
  const workbook = xlsx.readFile(filePath, { type: "file", raw: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet);
}

function writeCsv(filename, data) {
  const filePath = getCsvPath(filename);
  const sheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, sheet, "Sheet1");
  xlsx.writeFile(workbook, filePath, { bookType: "csv" });
}

module.exports = { readCsv, writeCsv };
