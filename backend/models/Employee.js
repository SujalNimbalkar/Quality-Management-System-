const mongoose = require("mongoose");

const SkillLevelSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    level: { type: String, required: true },
  },
  { _id: false }
);

const EmployeeSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    unique: true,
  },
  Employee: { type: String, required: true },
  Department: { type: String },
  Roles: [{ type: String }],
  Skills: [SkillLevelSchema],
  email: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
