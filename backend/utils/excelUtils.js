const Employee = require("../models/Employee");

// Load employees from MongoDB
async function loadEmployees() {
  return await Employee.find({});
}

module.exports = {
  loadEmployees,
};
