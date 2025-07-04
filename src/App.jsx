import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeDashboard from './components/EmployeeDashboard';
import AssignTest from './components/AssignTest';
import QuestionCard from './components/QuestionCard';
import ResultTable from './components/ResultTable';
import EntityTable from './components/EntityTable';
import { loadCSV } from './utils/csvLoader';
import { loadCompetencyMap } from './utils/competencyMapLoader';
import Login from './components/Login';
import TestWindow from './components/TestWindow';
import SubmittedAnswers from './components/SubmittedAnswers';
import EmployeePerformance from './components/EmployeePerformance';
import './App.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [user, setUser] = useState(null); // Firebase user
  const [employeeId, setEmployeeId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [testAssigned, setTestAssigned] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [requiredTests, setRequiredTests] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [employeeSkills, setEmployeeSkills] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [roleCompetencies, setRoleCompetencies] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [competencyMap, setCompetencyMap] = useState({ headers: [], data: [] });

  useEffect(() => {
    async function fetchCSVs() {
      const [rolesData, compData] = await Promise.all([
        loadCSV('/excel_data/roles.csv'),
        loadCSV('/excel_data/competencies.csv'),
      ]);
      setRoles(rolesData);
      setCompetencies(compData);
      
      // Fetch role competencies from Google Sheets API
      try {
        const roleCompResponse = await fetch(`${BACKEND}/api/role_competencies`);
        if (roleCompResponse.ok) {
          const roleCompData = await roleCompResponse.json();
          setRoleCompetencies(roleCompData);
        } else {
          console.error('Failed to fetch role competencies from API');
          // Fallback to CSV if API fails
          const roleCompData = await loadCSV('/excel_data/role_competencies.csv');
          setRoleCompetencies(roleCompData);
        }
      } catch (error) {
        console.error('Error fetching role competencies:', error);
        // Fallback to CSV if API fails
        const roleCompData = await loadCSV('/excel_data/role_competencies.csv');
        setRoleCompetencies(roleCompData);
      }
      
      const compMap = await loadCompetencyMap('/241119%20Competency%20map%20v0.7.csv');
      setCompetencyMap(compMap);
    }
    fetchCSVs();
  }, []);

  const handleLogin = async (firebaseUser) => {
    setUser(firebaseUser);
    const firebaseEmail = firebaseUser.email;
    const res = await fetch(`${BACKEND}/employee-id-by-email/${encodeURIComponent(firebaseEmail)}`);
    if (!res.ok) {
      alert("No matching employee found for your email.");
      setUser(null);
      return;
    }
    const { employee_id } = await res.json();
    setEmployeeId(employee_id);
    setIsAdmin(employee_id === "E1000");
    const infoRes = await fetch(`${BACKEND}/employee/${employee_id}`);
    let employeeInfo = null;
    let employeeRoles = [];
    let employeeSkills = [];
    if (infoRes.ok) {
      const infoData = await infoRes.json();
      employeeInfo = infoData;
      if (infoData.name) {
        const rolesRes = await fetch(`${BACKEND}/api/employee/roles?name=${encodeURIComponent(infoData.name)}`);
        if (rolesRes.ok) {
          const rolesData = await rolesRes.json();
          employeeRoles = rolesData.roles || [];
          const skillsRes = await fetch(`${BACKEND}/excel_data/employee_skills_levels.json`);
          if (skillsRes.ok) {
            const allSkills = await skillsRes.json();
            const userSkills = allSkills.find(e => e.Employee === infoData.name);
            employeeSkills = userSkills ? userSkills.Skills : [];
          }
        }
      }
    }
    setEmployeeInfo(employeeInfo);
    setEmployeeRoles(employeeRoles);
    setEmployeeSkills(employeeSkills);
    setRequiredTests([]);
  };

  // Optionally, handleAssign, handleAnswer, handleSubmit, etc. can be defined here if needed for admin/test logic

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !user ? (
              <Login onLogin={handleLogin} />
            ) : isAdmin ? (
              <AssignTest onAssign={() => {}} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user && !isAdmin ? (
              <EmployeeDashboard
                employeeId={employeeId}
                employeeInfo={employeeInfo}
                employeeRoles={employeeRoles}
                employeeSkills={employeeSkills}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                roles={roles}
                roleCompetencies={roleCompetencies}
                competencies={competencies}
                competencyMap={competencyMap}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/test" element={<TestWindow />} />
        <Route path="/submitted-answers" element={<SubmittedAnswers />} />

        <Route path="/performance" element={<EmployeePerformance competencyMap={competencyMap} />} />

        {/* Add more admin/entity routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;