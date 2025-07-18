const { google } = require("googleapis");
const dotenv = require("dotenv");
dotenv.config();
const Skill = require("../models/Skill");

// Helper to load skills mapping from MongoDB
async function getSkillMappings() {
  const skills = await Skill.find({});
  const skillNameToCode = Object.fromEntries(
    skills.map((s) => [s.name, s.code])
  );
  const skillCodeToName = Object.fromEntries(
    skills.map((s) => [s.code, s.name])
  );
  return { skillNameToCode, skillCodeToName };
}

const KEYFILEPATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  JSON.parse(process.env.GOOGLE_CREDENTIALS);
// console.log("Using KEYFILEPATH:", KEYFILEPATH); // Added log
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
// console.log("Using SPREADSHEET_ID:", SPREADSHEET_ID); // Added log
const SUBMISSION_SHEET_ID = process.env.GOOGLE_SUBMITTED_ID;
// console.log("Using SUBMISSION_SHEET_ID:", SUBMISSION_SHEET_ID);
const SCORE_LOG_SHEET_ID = process.env.GOOGLE_SCORE_LOG_ID;
// console.log("Using SCORE_LOG_SHEET_ID:", SCORE_LOG_SHEET_ID);
// const ROLE_COMPETENCIES_SHEET_ID =
//   process.env.GOOGLE_ROLE_COMPETENCIES_SHEET_ID;
// console.log("Using ROLE_COMPETENCIES_SHEET_ID:", ROLE_COMPETENCIES_SHEET_ID);

// Auth helper
async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });
  return sheets;
}

// Fetch all questions from Google Sheet
async function fetchQuestionsFromSheet() {
  const sheets = await getSheetsClient();
  // Adjust the range as per your columns and sheet name
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A2:J", // <--- Use your actual sheet name!
  });
  const rows = response.data.values;
  console.log("Raw rows from sheet:", rows); // Added log
  if (!rows || rows.length === 0) return [];
  // Map each row to a question object
  return rows.map((row) => ({
    _id: row[0],
    skill_id: row[1],
    difficulty: row[2],
    question_number: row[3],
    question_text: row[4],
    options: [row[5], row[6], row[7], row[8]],
    correct_option: row[9],
  }));
}

// Get N random questions for skill and level
async function getRandomQuestions(skill_id, level, count = 10) {
  let difficulty = String(level) === "4" ? "advance" : "basic";
  const allQuestions = await fetchQuestionsFromSheet();
  console.log("Requested skill_id:", skill_id, "difficulty:", difficulty);
  if (allQuestions.length > 0) {
    console.log("First row:", allQuestions[0]);
  }
  const filtered = allQuestions.filter(
    (q) =>
      q.skill_id &&
      q.difficulty &&
      q.skill_id.trim().toLowerCase() === skill_id.trim().toLowerCase() &&
      q.difficulty.trim().toLowerCase() === difficulty
  );
  console.log("Found", filtered.length, "matching questions");
  // Shuffle and take count
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  // Do not send correct_option to frontend!
  return shuffled.slice(0, count).map(({ correct_option, ...rest }) => rest);
}

// Grade answers
async function gradeAnswers(submittedAnswers) {
  const allQuestions = await fetchQuestionsFromSheet();
  let score = 0,
    max_score = submittedAnswers.length;
  const results = submittedAnswers.map((ans) => {
    const question = allQuestions.find((q) => q._id === ans._id);
    const correct = question ? question.correct_option : null;
    const isCorrect = String(ans.selected) === String(correct);
    if (isCorrect) score++;
    return {
      _id: ans._id,
      correct,
      your_answer: ans.selected,
      isCorrect,
    };
  });
  return {
    score,
    max_score,
    percent: Math.round((score / max_score) * 100),
    results,
  };
}

async function fetchSubmittedAnswers() {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SUBMISSION_SHEET_ID,
    range: "Sheet1!A2:BY", // Adjusted to include status_flag (BY)
  });
  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];
  // Columns: 0:timestamp, 1:employee_id, 2:employee_name, 3:employee_position, 4:skill, 5:level, 76:status_flag
  return rows.map((row) => ({
    timestamp: row[0],
    employee_id: row[1],
    employee_name: row[2],
    employee_position: row[3],
    skill: row[4],
    level: row[5],
    status_flag: row[76] || "", // Add status_flag (BY/76)
  }));
}

// Fetch all questions from Sheet1 (main questions sheet)
async function fetchAllQuestions() {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A2:J", // Adjust as needed
  });
  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];
  return rows.map((row) => ({
    question_id: row[0],
    skill_id: row[1],
    difficulty: row[2],
    question_number: row[3],
    question_text: row[4],
    options: [row[5], row[6], row[7], row[8]],
    correct_option: row[9],
  }));
}

// Join submissions with questions and map submitted answer to A/B/C/D
async function fetchJoinedSubmissions() {
  const submissions = await fetchSubmittedAnswers();
  // Map skill code to name for each submission
  const { skillNameToCode } = await getSkillMappings();
  return submissions.map((sub) => {
    let skillName = sub.skill;
    // If skill is a code, map to name
    if (skillNameToCode && skillNameToCode[sub.skill]) {
      skillName = skillNameToCode[sub.skill];
    }
    // If skillName is still empty, fallback to skill code
    if (!skillName) skillName = sub.skill;
    // Always return both code and name for clarity
    return {
      ...sub,
      skill_code: sub.skill,
      skill: skillName,
      level: sub.level,
      employee_id: sub.employee_id,
    };
  });
}

// Write submissions to answers file
async function appendSubmissionRows(submissions) {
  const sheets = await getSheetsClient();
  const first = submissions[0];
  let row = [
    new Date().toISOString(),
    first.employee_id || "",
    first.employee_name || "",
    first.employee_position || "",
    first.skill,
    first.level,
  ];
  submissions.forEach((sub) => {
    row.push(
      sub.question_id,
      sub.question_text,
      sub.options[0],
      sub.options[1],
      sub.options[2],
      sub.options[3],
      sub.selected_letter
    );
  });
  // Pad with blanks if fewer than 10 questions
  for (let i = submissions.length; i < 10; i++) {
    row.push("", "", "", "", "", "", "");
  }
  // Ensure row is at least 77 columns (BY = 76, 0-based)
  while (row.length < 77) {
    row.push("");
  }
  // Set status_flag in BY (index 76)
  row[76] = "submitted";
  await sheets.spreadsheets.values.append({
    spreadsheetId: SUBMISSION_SHEET_ID,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    resource: { values: [row] },
  });
}

// Add a new function to set retest_allowed for latest submission
async function setRetestAllowed(employee_id, skill, level) {
  // Import skillNameToCode mapping
  const { skillNameToCode } = await getSkillMappings();

  // Normalize skill: if it's a name, map to code
  let skillCode = skill;
  if (skillNameToCode[skill]) {
    skillCode = skillNameToCode[skill];
  }

  const sheets = await getSheetsClient();
  // Read all rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SUBMISSION_SHEET_ID,
    range: "Sheet1!A2:BY",
  });
  const rows = response.data.values || [];
  // Find the latest matching row
  let latestIdx = -1;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (
      String(rows[i][1]) === String(employee_id) &&
      String(rows[i][4]) === String(skillCode) &&
      String(rows[i][5]) === String(level)
    ) {
      latestIdx = i;
      break;
    }
  }
  if (latestIdx === -1) throw new Error("No matching submission found");

  // Check current status_flag
  const STATUS_COL_IDX = 76;
  const currentStatus = rows[latestIdx][STATUS_COL_IDX] || "";

  let newStatus = "";
  if (currentStatus === "submitted") {
    newStatus = "retest_1";
  } else if (/^retest_(\d+)$/.test(currentStatus)) {
    const match = currentStatus.match(/^retest_(\d+)$/);
    const count = parseInt(match[1], 10) + 1;
    newStatus = `retest_${count}`;
  } else {
    throw new Error(
      `Cannot allow retest. Current status is "${currentStatus}". Only "submitted" or "retest_N" status can be changed to next retest.`
    );
  }

  // Update status_flag in BY column (index 76)
  while (rows[latestIdx].length <= STATUS_COL_IDX) {
    rows[latestIdx].push("");
  }
  rows[latestIdx][STATUS_COL_IDX] = newStatus;

  // Write all rows back (excluding header)
  await sheets.spreadsheets.values.update({
    spreadsheetId: SUBMISSION_SHEET_ID,
    range: `Sheet1!A2:BY`,
    valueInputOption: "USER_ENTERED",
    resource: { values: rows },
  });
  return true;
}

// Write a row to the score log sheet
async function appendScoreLogRow({
  employee_id,
  employee_name,
  employee_position,
  skill,
  level,
  score,
  max_score,
  percent,
  status,
}) {
  const sheets = await getSheetsClient();
  const row = [
    new Date().toISOString(),
    employee_id || "",
    employee_name || "",
    employee_position || "",
    skill || "",
    level || "",
    score || "",
    max_score || "",
    percent || "",
    status || "",
    // StrLevel || "",
  ];
  console.log("Appending to score log:", row); // Debug log
  await sheets.spreadsheets.values.append({
    spreadsheetId: SCORE_LOG_SHEET_ID,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    resource: { values: [row] },
  });
}

// Fetch role competencies from Google Sheet (Sheet2)
// async function fetchRoleCompetencies() {
//   const sheets = await getSheetsClient();
//   const response = await sheets.spreadsheets.values.get({
//     spreadsheetId: ROLE_COMPETENCIES_SHEET_ID,
//     range: "role_competencies!A2:D", // Adjust range as needed for role_competencies data
//   });
//   const rows = response.data.values;
//   if (!rows || rows.length === 0) return [];

//   // Map each row to a role competency object
//   return rows.map((row) => ({
//     id: row[0],
//     role_id: row[1],
//     competency_id: row[2],
//     proficiency_required: row[3],
//   }));
// }

module.exports = {
  getRandomQuestions,
  gradeAnswers,
  fetchSubmittedAnswers,
  fetchJoinedSubmissions,
  appendSubmissionRows,
  getSheetsClient,
  appendScoreLogRow,
  // fetchRoleCompetencies,
  setRetestAllowed,
};
