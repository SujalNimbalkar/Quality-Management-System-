// Basic Express server setup for Node.js backend
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Placeholder route
testData = [];

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Import and use modularized routes
const testRoutes = require("./routes/testRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const entityRoutes = require("./routes/entityRoutes");
const employeeRolesRoutes = require("./routes/employeeRoles");
const mcqRoutes = require("./routes/mcqRoutes");

app.use(testRoutes);
app.use(employeeRoutes);
app.use("/api", entityRoutes);
app.use("/api/employee", employeeRolesRoutes);
app.use("/api/mcq", mcqRoutes);
app.use("/api/performance", mcqRoutes);
// Serve static files from excel_data for JSON/CSV access
app.use("/excel_data", express.static(path.join(__dirname, "../excel_data")));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
