// Utility functions for importing/exporting CSV data to/from MongoDB
const xlsx = require("xlsx");
const Employee = require("../models/Employee");
const Skill = require("../models/Skill");
const CompetencyMap = require("../models/CompetencyMap");

// Export a MongoDB collection to CSV (returns CSV string)
async function exportCollectionToCsv(model) {
  const data = await model.find({}).lean();
  const sheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, sheet, "Sheet1");
  return xlsx.utils.sheet_to_csv(sheet);
}

// Import data from a CSV string to a MongoDB collection (overwrites collection)
async function importCsvToCollection(model, csvString) {
  const data = xlsx.utils.sheet_to_json(xlsx.utils.csv_to_sheet(csvString));
  await model.deleteMany({});
  await model.insertMany(data);
}

module.exports = {
  exportCollectionToCsv,
  importCsvToCollection,
};
