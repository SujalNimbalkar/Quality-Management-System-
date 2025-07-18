// Basic Express server setup for Node.js backend
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT;
const connectDB = require("./utils/db");

app.use(cors());
app.use(express.json());

// Placeholder route
testData = [];

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Import and use modularized routes

const employeeRoutes = require("./routes/employeeRoutes");
const employeeRolesRoutes = require("./routes/employeeRoles");
const entityRoutes = require("./routes/entityRoutes");
const mcqRoutes = require("./routes/mcqRoutes");

// Commented out to avoid root-level route conflicts
app.use("/api/employee", employeeRolesRoutes); // Mount specific employee routes first
app.use("/api", employeeRoutes);
app.use("/api", entityRoutes);
app.use("/api/mcq", mcqRoutes);
app.use("/api/performance", mcqRoutes);
// Serve static files from excel_data for JSON/CSV access
// app.use("/excel_data", express.static(path.join(__dirname, "../excel_data")));

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
