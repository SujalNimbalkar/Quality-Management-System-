// Express routes for test-related endpoints
const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");

// Get 15 random questions
router.get("/get-test/:employeeId", testController.getRandomQuestions);

// Get 15 random questions for a specific test
router.get(
  "/get-test/:employeeId/:testName",
  testController.getRandomQuestionsForTest
);

// Submit test result
router.post("/submit-result", testController.submitTestResult);

// Assign test to employee (log-style only)
router.post("/assign-test", testController.assignTest);

// Get assigned tests for an employee
router.get("/assigned-tests/:employeeId", testController.getAssignedTests);

// API to get test link for a test name
router.get("/test-link/:testName", testController.getTestLink);

// Get 15 random questions for a given skill and level
router.get("/get-test/:skill/:level", (req, res) => {
  const { skill, level } = req.params;
  const questions =
    require("../services/testService").getRandomQuestionsForSkillLevel(
      skill,
      level,
      15
    );
  res.json(questions);
});

module.exports = router;
