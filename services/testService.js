// backend/services/testService.js
const {
  loadQuestions,
  saveTestResult,
  logTestAssignment,
  getAssignedTestsForEmployee,
  loadTestLinks,
} = require("../utils/excelUtils");

function getRandomQuestions(count = 15) {
  const questions = loadQuestions();
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomQuestionsForTest(testName, count = 15) {
  const questions = loadQuestions().filter((q) => q.TestName === testName);
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomQuestionsForSkillLevel(skill, level, count = 15) {
  // Assumes loadQuestions() returns all questions with Skill and Level fields
  const questions = loadQuestions().filter(
    (q) => q.Skill === skill && q.Level === level
  );
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function submitTestResult(employeeId, testId, answers) {
  const timestamp = new Date().toISOString();
  answers.forEach((ans) => {
    saveTestResult({
      EmployeeID: employeeId,
      TestID: testId,
      QuestionID: ans.questionId,
      SelectedOption: ans.selectedOption,
      IsCorrect: ans.isCorrect,
      Timestamp: timestamp,
    });
  });
  return true;
}

function assignTest(adminId, employeeId, testName) {
  if (adminId !== "E1000") {
    throw new Error("Access denied: Only E1000 is admin");
  }
  logTestAssignment(employeeId, testName, adminId);
  return true;
}

function getAssignedTests(employeeId) {
  return getAssignedTestsForEmployee(employeeId);
}

function getTestLink(testName) {
  const links = loadTestLinks();
  return links[testName] || null;
}

module.exports = {
  getRandomQuestions,
  getRandomQuestionsForTest,
  getRandomQuestionsForSkillLevel, // export new function
  submitTestResult,
  assignTest,
  getAssignedTests,
  getTestLink,
};
