import React, { useState } from 'react';

const EmployeeLogin = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState(''); // New password state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!employeeId) return setError("Please enter Employee ID");
    if (!password) return setError("Please enter Password");
    setError("");
    setLoading(true);
    try {
      // Use POST for login with password
      const res = await fetch(`http://localhost:5000/employee-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password })
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Invalid password");
        } else if (res.status === 404) {
          throw new Error("Employee not found");
        } else {
          throw new Error("Backend is currently unavailable. Please try again later.");
        }
      }
      const data = await res.json();
      let requiredTests = [];
      if (!data.isAdmin) {
        if (employeeId === "26") {
          const testsRes = await fetch(`http://localhost:5000/employee/26/tests`);
          const testsData = await testsRes.json();
          requiredTests = testsData.tests || [];
        } else {
          const testsRes = await fetch(`http://localhost:5000/employee/${employeeId}/required-tests`);
          const testsData = await testsRes.json();
          requiredTests = testsData.tests || [];
        }
      }
      // Fetch employee info (name and department/designation)
      const infoRes = await fetch(`http://localhost:5000/employee/${employeeId}`);
      let employeeInfo = null;
      let employeeRoles = [];
      let employeeSkills = [];
      if (infoRes.ok) {
        const infoData = await infoRes.json();
        employeeInfo = infoData;
        // Fetch roles by name (using new API)
        if (infoData.name) {
          const rolesRes = await fetch(`http://localhost:5000/api/employee/roles?name=${encodeURIComponent(infoData.name)}`);
          if (rolesRes.ok) {
            const rolesData = await rolesRes.json();
            employeeRoles = rolesData.roles || [];
            // Fetch all skills for these roles from the JSON file
            const skillsRes = await fetch('http://localhost:5000/excel_data/employee_skills_levels.json');
            if (skillsRes.ok) {
              const allSkills = await skillsRes.json();
              const userSkills = allSkills.find(e => e.Employee === infoData.name);
              employeeSkills = userSkills ? userSkills.Skills : [];
            }
          }
        }
      }
      setLoading(false);
      // Pass all info to parent
      onLogin({
        employeeId,
        isAdmin: data.isAdmin,
        requiredTests,
        employeeInfo,
        employeeRoles,
        employeeSkills
      });
    } catch (e) {
      setLoading(false);
      setError(e.message);
    }
  };

  return (
    <div>
      <h2>Employee Login</h2>
      <input
        type="text"
        placeholder="Enter Employee ID"
        value={employeeId}
        onChange={e => setEmployeeId(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleLogin} disabled={loading}>Login</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      {loading && <div style={{color:'lightblue'}}>Loading...</div>}
    </div>
  );
};

export default EmployeeLogin;
