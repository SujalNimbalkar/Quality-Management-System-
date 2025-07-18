import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AssignRetest.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const normalizeSkill = s => s && typeof s === 'string' ? s.trim().toLowerCase() : s;

const AssignRetest = () => {
  const [employees, setEmployees] = useState([]);
  const [submittedTests, setSubmittedTests] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [empIdInput, setEmpIdInput] = useState('');
  const [fetchedEmployee, setFetchedEmployee] = useState(null);
  const [fetchingEmp, setFetchingEmp] = useState(false);
  const [skillNameToCode, setSkillNameToCode] = useState({});
  const navigate = useNavigate();
  

  useEffect(() => {
    fetch(`${BACKEND}/api/skills`)
      .then(res => res.json())
      .then(skills => {
        setSkillNameToCode(Object.fromEntries(skills.map(s => [s.name, s.code])));
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${BACKEND}/api/employees`)
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(() => setError('Failed to fetch employees'));
    fetch(`${BACKEND}/api/mcq/submitted-answers`)
      .then(res => res.json())
      .then(data => {
        const byEmp = {};
        (data.submissions || []).forEach(sub => {
          if (!sub.employee_id) return;
          const key = String(sub.employee_id);
          if (!byEmp[key]) byEmp[key] = {};
          const skillLevel = `${normalizeSkill(sub.skill)}-${sub.level}`;
          const statusFlag = sub.status_flag || sub.status || '';
          byEmp[key][skillLevel] = statusFlag;
        });
        setSubmittedTests(byEmp);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleReassign = async (employeeId, skill, level) => {
    try {
      const res = await fetch(`${BACKEND}/api/retest-allow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: employeeId, skill, level })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to allow retest');
      }
      alert(`Retest allowed for Employee ${employeeId}: ${skill} (Level ${level})!`);
      fetch(`${BACKEND}/api/mcq/submitted-answers`)
        .then(res => res.json())
        .then(data => {
          const byEmp = {};
          (data.submissions || []).forEach(sub => {
            if (!sub.employee_id) return;
            const key = String(sub.employee_id);
            if (!byEmp[key]) byEmp[key] = {};
            const skillLevel = `${normalizeSkill(sub.skill)}-${sub.level}`;
            const statusFlag = sub.status_flag || sub.status || '';
            byEmp[key][skillLevel] = statusFlag;
          });
          setSubmittedTests(byEmp);
        });
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleFetchEmployee = () => {
    if (!empIdInput) return;
    setFetchingEmp(true);
    setError('');
    fetch(`${BACKEND}/api/employee/${empIdInput}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => setFetchedEmployee(data))
      .catch(() => setError('Employee not found'))
      .finally(() => setFetchingEmp(false));
  };

  if (loading) return <div className="assign-retest-root">Loading...</div>;
  if (error) return <div className="assign-retest-root" style={{color:'red'}}>{error}</div>;

  return (
    <div className="assign-retest-root">
      <h2 className="assign-retest-title">Assign/Reassign Tests for Employee</h2>
      <div className="assign-retest-form">
        <input
          type="text"
          placeholder="Enter Employee ID"
          value={empIdInput}
          onChange={e => setEmpIdInput(e.target.value)}
          className="assign-retest-input"
        />
        <button onClick={handleFetchEmployee} disabled={fetchingEmp || !empIdInput} className="assign-retest-btn">
          {fetchingEmp ? 'Fetching...' : 'Fetch Employee'}
        </button>
      </div>
      {fetchedEmployee && (
        (() => {
          const empKey = String(fetchedEmployee.employee_id);
          console.log('empKey:', empKey, 'submittedTests keys:', Object.keys(submittedTests));
          return (
            <div className="assign-retest-card">
              <div><strong>Name:</strong> {fetchedEmployee.Employee || fetchedEmployee.name}</div>
              <div><strong>Email:</strong> {fetchedEmployee.email}</div>
              <div><strong>Roles:</strong> {fetchedEmployee.Roles && fetchedEmployee.Roles.join(', ')}</div>
              <div className="assign-retest-skills">
                <strong>Skills & Levels</strong>
                <ul>
                  {fetchedEmployee.Skills && fetchedEmployee.Skills.length > 0 ? (
                    fetchedEmployee.Skills.map((s, idx) => {
                      const skillCode = skillNameToCode[s.skill] || s.skill;
                      const skillLevel = `${normalizeSkill(skillCode)}-${s.level}`;
                      const status = submittedTests[empKey]?.[skillLevel];
                      console.log('Skill:', s.skill, 'SkillCode:', skillCode, 'Level:', s.level, 'SkillLevelKey:', skillLevel, 'Status:', status);
                      return (
                        <li key={idx}>
                          {s.skill} (Level: {s.level})
                          {status === 'submitted' ? (
                            <button className="assign-retest-reassign-btn" onClick={() => handleReassign(empKey, s.skill, s.level)}>
                              Allow Retest
                            </button>
                          ) : status === 'retest_allowed' ? (
                            <span className="assign-retest-status">Retest Allowed</span>
                          ) : status === 'retested' ? (
                            <span className="assign-retest-status">Already Retested</span>
                          ) : (
                            <span className="assign-retest-not-submitted">Not submitted</span>
                          )}
                        </li>
                      );
                    })
                  ) : (
                    <li>No skills found.</li>
                  )}
                </ul>
              </div>
            </div>
          );
        })()
      )}
      <button className="assign-retest-back-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
};

export default AssignRetest;
