const express = require("express");
const router = express.Router();
const {
  getRandomQuestions,
  fetchSubmittedAnswers,
  fetchJoinedSubmissions,
  getSheetsClient,
  appendSubmissionRows,
  gradeAnswers,
  appendScoreLogRow,
} = require("../utils/sheets");
const { google } = require("googleapis");
const SCORE_LOG_SHEET_ID = process.env.GOOGLE_SCORE_LOG_ID;

// GET /api/mcq/questions?skill_id=sk01&level=2&count=15
router.get("/questions", async (req, res) => {
  try {
    const { skill_id, level, count } = req.query;

    // Set Cache-Control headers to prevent caching
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    // Use getRandomQuestions directly from sheets.js
    const result = await getRandomQuestions(
      skill_id,
      level,
      Number(count) || 10
    );

    res.json({ questions: result });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/mcq/submitted-answers
router.get("/submitted-answers", async (req, res) => {
  try {
    const submissions = await fetchJoinedSubmissions();
    res.json({ submissions });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/mcq/submit-answers
router.post("/submit-answers", async (req, res) => {
  try {
    const { submissions } = req.body; // submissions is an array of 10 answers
    await appendSubmissionRows(submissions); // Only one call per test

    // Grade answers
    const grading = await gradeAnswers(
      submissions.map((sub) => ({
        _id: sub.question_id,
        selected: sub.selected_letter,
      }))
    );

    // Log score
    const first = submissions[0];
    let status;
    // const levelStr = String(first.level);
    const levelStr = String(first.level).trim();
    console.log("DEBUG: levelStr =", levelStr, "percent =", grading.percent);
    if (levelStr === "2") {
      if (grading.percent >= 80) status = "Eligible for L3";
      else if (grading.percent >= 60) status = "Pass";
      else status = "Fail";
    } else if (levelStr === "3") {
      status = grading.percent <= 80 ? "Fail" : "Pass";
    } else if (levelStr === "4") {
      status = grading.percent >= 60 ? "Pass" : "Fail";
    }

    await appendScoreLogRow({
      employee_id: first.employee_id,
      employee_name: first.employee_name,
      employee_position: first.employee_position,
      skill: first.skill,
      level: first.level,
      score: grading.score,
      max_score: grading.max_score,
      percent: grading.percent,
      status,
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /employee_assessment_results/all
router.get("/employee_assessment_results/all", async (req, res) => {
  try {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SCORE_LOG_SHEET_ID,
      range: "Sheet1!A2:J", // Adjust range as needed
    });
    const rows = response.data.values || [];
    const results = rows.map((row) => ({
      timestamp: row[0],
      employee_id: row[1],
      employee_name: row[2],
      employee_position: row[3],
      skill: row[4],
      level: row[5],
      score: row[6],
      max_score: row[7],
      percent: row[8],
      status: row[9],
    }));
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

module.exports = router;
