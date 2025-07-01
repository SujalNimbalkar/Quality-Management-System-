// backend/controllers/testController.js
const testService = require("../services/testService");

exports.getRandomQuestions = (req, res) => {
  const questions = testService.getRandomQuestions();
  res.json(questions);
};

exports.getRandomQuestionsForTest = (req, res) => {
  const { testName } = req.params;
  const questions = testService.getRandomQuestionsForTest(testName);
  res.json(questions);
};

exports.submitTestResult = (req, res) => {
  const { employeeId, testId, answers } = req.body;
  testService.submitTestResult(employeeId, testId, answers);
  res.json({ success: true });
};

exports.assignTest = (req, res) => {
  const { adminId, employeeId, testName } = req.body;
  try {
    testService.assignTest(adminId, employeeId, testName);
    res.json({ message: "Test assigned successfully" });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

exports.getAssignedTests = (req, res) => {
  const employeeId = req.params.employeeId;
  const assigned = testService.getAssignedTests(employeeId);
  res.json({ employeeId, assignedTests: assigned });
};

exports.getTestLink = (req, res) => {
  const { testName } = req.params;
  const link = testService.getTestLink(testName);
  res.json({ testName, link });
};
