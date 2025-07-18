import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './EmployeeDashboard.css';
const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const EmployeeDashboard = ({
  employeeId,
  employeeInfo,
  employeeRoles,
  employeeSkills,
  selectedRole,
  setSelectedRole,
  roles,
  roleCompetencies,
  competencies,
  competencyMap
}) => {
  // Minimal state for test click tracking
  const [testClickCounts, setTestClickCounts] = useState({});
  const [submittedTests, setSubmittedTests] = useState([]);
  const [skillNameToCode, setSkillNameToCode] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to root if not loaded with required state
  useEffect(() => {
    if (!employeeInfo && !employeeId) {
      navigate('/', { replace: true });
    }
  }, [employeeInfo, employeeId, navigate]);

  useEffect(() => {
    fetch(`${BACKEND}/api/skills`)
      .then(res => res.json())
      .then(skills => setSkillNameToCode(Object.fromEntries(skills.map(s => [s.name, s.code]))));
  }, []);

  useEffect(() => {
    // Fetch submitted tests for this employee
    if (!employeeId) return;
    fetch(`${BACKEND}/api/mcq/submitted-answers`)
      .then(res => res.json())
      .then(data => {
        const empId = employeeId;
        // Only consider latest status_flag for each skill-level
        const latest = {};
        (data.submissions || []).forEach(sub => {
          if (String(sub.employee_id) !== String(empId)) return;
          const skillLevel = `${sub.skill}-${sub.level}`;
          // Use status_flag (not status), fallback to 'submitted' if missing
          const statusFlag = sub.status_flag || sub.status || '';
          latest[skillLevel] = statusFlag;
        });
        setSubmittedTests(Object.entries(latest)
          .filter(([_, statusFlag]) => statusFlag.toLowerCase() === 'submitted' || statusFlag.toLowerCase() === 'retested')
          .map(([k]) => k));
      });
  }, [employeeId, location.key]);

  const handleTestClick = (idx, skill, level) => {
    setTestClickCounts((prev) => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));
    navigate('/test', { state: { skill, level, employeeInfo, employeeRoles, employeeId, fromDashboard: true } });
  };

  // Filter skills by selected role using competencyMap if available
  let filteredSkills = employeeSkills;
  if (selectedRole && competencyMap && competencyMap.data && competencyMap.headers) {
    const row = competencyMap.data.find(r => r.Role && r.Role.trim().toLowerCase() === selectedRole.trim().toLowerCase());
    if (row) {
      const requiredSkills = competencyMap.headers.filter(h => h !== 'Role' && row[h] && !isNaN(Number(row[h])));
      filteredSkills = employeeSkills.filter(s => requiredSkills.includes(s.skill));
      if (filteredSkills.length < requiredSkills.length) {
        const missing = requiredSkills.filter(skill => !filteredSkills.some(s => s.skill === skill));
        filteredSkills = filteredSkills.concat(missing.map(skill => ({ skill, level: row[skill] })));
      }
    } else {
      filteredSkills = [];
    }
  }

  // Superuser logic: employee_id 1,2,3,24
  const isSuperUser = [1, 2, 3, 24].includes(Number(employeeId));

  return (
    <div className="employee-dashboard-root">
      <div className="employee-dashboard-card">
        <h2 className="employee-dashboard-title">Welcome!</h2>
        
        <div className="employee-dashboard-row">
          <div className="employee-dashboard-label">Name:</div>
          <div className="employee-dashboard-value">{employeeInfo?.name || 'N/A'}</div>
        </div>
        <div className="employee-dashboard-row">
          <div className="employee-dashboard-label">Designations/Roles:</div>
          <div className="employee-dashboard-value">
            {employeeRoles && employeeRoles.length > 0 ? (
              employeeRoles.length === 1 ? (
                <span>{employeeRoles[0]}</span>
              ) : (
                <ul className="employee-dashboard-list">
                  {employeeRoles.map((role, idx) => (
                    <li key={idx}>{role}</li>
                  ))}
                </ul>
              )
            ) : (
              <span>{employeeInfo?.department || 'N/A'}</span>
            )}
          </div>
        </div>
        <div className="employee-dashboard-skills-section">
          <strong>Required Skills/Tests{selectedRole ? ` for ${selectedRole}` : ''}:</strong>
          <ul className="employee-dashboard-skills-list">
            {filteredSkills && filteredSkills.length > 0 ? (
              filteredSkills.map((s, idx) => {
                const skillCode = skillNameToCode[s.skill] || s.skill;
                const skillLevelKey = `${skillCode}-${String(s.level)}`;
                return (
                  <li key={idx} className="employee-dashboard-skill-item">
                    <span className="employee-dashboard-skill-label">
                      {s.skill} <span className="employee-dashboard-skill-level">(Level: {s.level})</span>
                    </span>
                    <button
                      className="employee-dashboard-btn"
                      onClick={() => handleTestClick(idx, s.skill, s.level)}
                      disabled={submittedTests.includes(skillLevelKey)}
                    >
                      {submittedTests.includes(skillLevelKey) ? "Submitted" : "Take Test"}
                    </button>
                    {testClickCounts[idx] ? (
                      <span className="employee-dashboard-click-count">
                        Clicked {testClickCounts[idx]} times
                      </span>
                    ) : null}
                  </li>
                );
              })
            ) : (
              <li>No skills/tests found.</li>
            )}
          </ul>
          {isSuperUser && (
          <div style={{ marginTop: 16 }}>
            <div className="employee-dashboard-btn-group">
              <button
                className="employee-dashboard-superuser-btn"
                onClick={() => navigate('/performance')}
              >
                View All Employee Performance
              </button>
              <button
                className="employee-dashboard-superuser-btn"
                onClick={() => navigate('/add-employee')}
              >
                Add New Employee
              </button>
              <button
                className="employee-dashboard-superuser-btn"
                onClick={() => navigate(`/edit-employee/${employeeId}`)}
              >
                Edit Employee
              </button>
              <button
                className="employee-dashboard-superuser-btn"
                onClick={() => navigate(`/assign-retest/${employeeId}`)}
              >
                Retest
              </button>
              <button
                className="employee-dashboard-superuser-btn"
                onClick={() => navigate('/add-role')}
              >
                Add Role
              </button>
              <button
                className="employee-dashboard-superuser-btn"
                onClick={() => navigate('/add-skill')}
              >
                Add Skill
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;