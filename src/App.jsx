import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import EmployeeDashboard from './components/EmployeeDashboard';
import Login from './components/Login';
import TestWindow from './components/TestWindow';
import SubmittedAnswers from './components/SubmittedAnswers';
import EmployeePerformance from './components/EmployeePerformance';
import AddEmployee from './components/AddEmployee';
import EditEmployee from './components/EditEmployee';
import AssignRetest from './components/AssignRetest';
import AddRole from './components/AddRole.jsx';
import AddSkill from './components/AddSkill.jsx';
import './App.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [user, setUser] = useState(null); // Firebase user
  const [employeeId, setEmployeeId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [employeeSkills, setEmployeeSkills] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [roleCompetencies, setRoleCompetencies] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [competencyMap, setCompetencyMap] = useState({ headers: [], data: [] });

  useEffect(() => {
    async function fetchData() {
      
      try {
        const compMapRes = await fetch(`${BACKEND}/api/competency_map`);
        setCompetencyMap(compMapRes.ok ? await compMapRes.json() : { headers: [], data: [] });
      } catch {
        setCompetencyMap({ headers: [], data: [] });
      }
    }
    fetchData();
  }, []);

  const handleLogin = async (firebaseUser) => {
    setUser(firebaseUser);
    const firebaseEmail = firebaseUser.email;
    const res = await fetch(`${BACKEND}/api/employee-id-by-email/${encodeURIComponent(firebaseEmail)}`);
    if (!res.ok) {
      alert("No matching employee found for your email.");
      setUser(null);
      return;
    }
    const { employee_id } = await res.json();
    setEmployeeId(employee_id);
    const infoRes = await fetch(`${BACKEND}/api/employee/${employee_id}`);
    let employeeInfo = null;
    let employeeRoles = [];
    let employeeSkills = [];
    if (infoRes.ok) {
      const infoData = await infoRes.json();
      // Normalize name field for frontend
      employeeInfo = {
        ...infoData,
        name: infoData.name || infoData.Employee || "N/A"
      };
      // Use employee_id to fetch roles and skills
      const rolesRes = await fetch(`${BACKEND}/api/employee/roles?id=${encodeURIComponent(employee_id)}`);
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        employeeRoles = rolesData.roles || [];
      }
      const skillsRes = await fetch(`${BACKEND}/api/employee/skills/${encodeURIComponent(employee_id)}`);
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        employeeSkills = skillsData.skills || [];
      }
    }
    setEmployeeInfo(employeeInfo);
    setEmployeeRoles(employeeRoles);
    setEmployeeSkills(employeeSkills);
  };

  // Redirect to login on refresh if not logged in
  useEffect(() => {
    if (!user) {
      window.history.replaceState({}, '', '/');
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !user ? (
              <Login onLogin={handleLogin} />
            ) : isAdmin ? null : (
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
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/edit-employee/:id" element={<EditEmployee />} />
        <Route path="/assign-retest/:id" element={<AssignRetest />} />
        <Route path="/add-role" element={<AddRole />} />
        <Route path="/add-skill" element={<AddSkill />} />
      </Routes>
    </Router>
  );
}

export default App;