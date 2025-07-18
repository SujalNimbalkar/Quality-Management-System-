const mongoose = require("mongoose");

const CompetencyMapSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },
  skills: { type: Map, of: mongoose.Schema.Types.Mixed, required: true },
});

module.exports = mongoose.model("CompetencyMap", CompetencyMapSchema);
