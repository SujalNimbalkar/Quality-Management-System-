// Add QuestionID column if not present, and fill with Skill_id_Level_id_Question_number for each row
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { parse } = require("json2csv");

const inputPath = path.join(__dirname, "../../excel_data/questions.csv");
const outputPath = path.join(
  __dirname,
  "../../excel_data/questions_with_id.csv"
);

const rows = [];
fs.createReadStream(inputPath)
  .pipe(csv())
  .on("data", (row) => {
    row.QuestionID = `${row.Skill_id}_${row.Level_id}_${row.Question_number}`;
    rows.push(row);
  })
  .on("end", () => {
    const fields = Object.keys(rows[0]);
    const csvData = parse(rows, { fields });
    fs.writeFileSync(outputPath, csvData, "utf8");
    console.log(
      "questions_with_id.csv generated with unique QuestionID for all rows."
    );
  });
