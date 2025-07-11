import React, { useState, useEffect } from 'react';
import './EmployeePerformance.css';
import { skillNameToCode, skillCodeToName } from '../utils/skillMaps';
import EmployeeSkillLevelsByPosition from './EmployeeSkillLevelsByPosition';
import { EmployeeRadarChartSection } from './EmployeeRadarChart';

// Helper to normalize skill names
const normalizeSkillName = s => s && typeof s === 'string' ? s.replace(/\r?\n|\r/g, '').trim().replace(/\s+/g, ' ') : s;

const EmployeePerformance = () => {
  const [empId, setEmpId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [scoreLog, setScoreLog] = useState([]);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [employeeSkills, setEmployeeSkills] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);
  const [competencyMap, setCompetencyMap] = useState([]);
  const [loading, setLoading] = useState(false);

  const BACKEND = import.meta.env.VITE_BACKEND_URL;

  // Load competency map JSON on mount
  useEffect(() => {
    fetch(`${BACKEND}/excel_data/competency_map_Sheet1.json`)
      .then(res => res.json())
      .then(data => setCompetencyMap(data));
  }, [BACKEND]);

  // Fetch employee data and test results
  const handleFetch = async () => {
    if (!empId) return;
    setLoading(true);
    // Fetch all employee skills/roles from JSON
    const allSkillsRes = await fetch(`${BACKEND}/excel_data/employee_skills_levels.json`);
    const allSkills = await allSkillsRes.json();
    const empData = allSkills.find(e =>
      (empId && String(e.Employee).trim() === empId.trim()) ||
      (employeeName && e.Employee === employeeName)
    );
    setEmployeeData(empData);
    setEmployeeRoles(empData?.Roles || []);
    setEmployeeSkills(empData?.Skills || []);

    // Fetch test results
    const [scoreRes, answersRes] = await Promise.all([
      fetch(`${BACKEND}/api/performance/employee_assessment_results/all`),
      fetch(`${BACKEND}/api/mcq/submitted-answers`)
    ]);
    const scoreData = await scoreRes.json();
    setScoreLog(scoreData.filter(row => row.employee_id === empId));
    setSubmittedAnswers((await answersRes.json()).submissions.filter(row => row.employee_id === empId));
    setLoading(false);
  };

  return (
    <div className="employee-performance-root">
      <EmployeeSkillLevelsByPosition />
      <div className="employee-performance-card">
        <h2 className="employee-performance-title">Employee Performance & Answers</h2>
        <div className="employee-performance-input-row">
          <input
            type="text"
            className="employee-performance-input"
            placeholder="Enter Employee ID"
            value={empId}
            onChange={e => setEmpId(e.target.value)}
          />
          <input
            type="text"
            className="employee-performance-input"
            placeholder="Enter Employee Name (optional)"
            value={employeeName}
            onChange={e => setEmployeeName(e.target.value)}
          />
          <button className="employee-performance-btn" onClick={handleFetch}>Fetch</button>
        </div>
        {loading && <div>Loading...</div>}
        {/* Radar Chart Section */}
        {employeeRoles.length > 0 && scoreLog.length > 0 && competencyMap.length > 0 && (
          <EmployeeRadarChartSection
            employeeRoles={employeeRoles}
            competencyMap={competencyMap}
            scoreLog={scoreLog}
            skillNameToCode={skillNameToCode}
          />
        )}
        {scoreLog.length > 0 && (
          <div style={{marginTop: 16}}>
            <h4 className="employee-performance-section-title">Score Log</h4>
            <table className="employee-performance-table" border="1" cellPadding="4">
              <thead>
                <tr>
                  <th>Timestamp</th><th>Employee ID</th><th>Name</th><th>Position</th><th>Skill Name</th><th>Skill</th><th>Level</th><th>Score</th><th>Max Score</th><th>Percent</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scoreLog.map((row, i) => (
                  <tr key={i}>
                    <td>{row.timestamp}</td><td>{row.employee_id}</td><td>{row.employee_name}</td><td>{row.employee_position}</td>
                    <td>{skillCodeToName[row.skill] || row.skill}</td><td>{row.skill}</td>
                    <td>{row.level}</td><td>{row.score}</td><td>{row.max_score}</td><td>{row.percent}</td><td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* {submittedAnswers.length > 0 && (
          <div style={{marginTop: 16}}>
            <h4 className="employee-performance-section-title">Submitted Answers</h4>
            <table className="employee-performance-table" border="1" cellPadding="4">
              <thead>
                <tr>
                  {Object.keys(submittedAnswers[0]).map((k, i) => <th key={i}>{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {submittedAnswers.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, j) => <td key={j}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default EmployeePerformance; 