import React, { useState, useEffect } from 'react';
import './EmployeePerformance.css';
import EmployeeSkillLevelsByPosition from './EmployeeSkillLevelsByPosition';
import { EmployeeRadarChartSection } from './EmployeeRadarChart';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
// Helper to normalize skill names
const normalizeSkillName = s => s && typeof s === 'string' ? s.replace(/\r?\n|\r/g, '').trim().replace(/\s+/g, ' ') : s;

const EmployeePerformance = () => {
  const [empId, setEmpId] = useState("");
  const [scoreLog, setScoreLog] = useState([]);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [employeeSkills, setEmployeeSkills] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);
  const [competencyMap, setCompetencyMap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [skillNameToCode, setSkillNameToCode] = useState({});
  const [skillCodeToName, setSkillCodeToName] = useState({});
  const [skillsLoaded, setSkillsLoaded] = useState(false);


  // Load competency map JSON on mount (new structure: { role, skills })
  useEffect(() => {
    fetch(`${BACKEND}/api/competency_map`)
      .then(res => res.json())
      .then(data => setCompetencyMap(data));
  }, [BACKEND]);

  // Load skills mapping on mount
  useEffect(() => {
    fetch(`${BACKEND}/api/skills`)
      .then(res => res.json())
      .then(skills => {
        setSkillNameToCode(Object.fromEntries(skills.map(s => [s.name, s.code])));
        setSkillCodeToName(Object.fromEntries(skills.map(s => [s.code, s.name])));
        setSkillsLoaded(true);
      });
  }, []);

  // Fetch employee data and test results
  const handleFetch = async () => {
    if (!empId) return;
    setLoading(true);
    // Fetch all employee skills/roles from backend API
    const allSkillsRes = await fetch(`${BACKEND}/api/employee_skills_levels`);
    const allSkills = await allSkillsRes.json();
    // Find employee by string or number id
    const empData = allSkills.find(e => String(e.employee_id) === empId.trim() || Number(e.employee_id) === Number(empId.trim()));
    setEmployeeData(empData);
    setEmployeeRoles(empData?.Roles || []);
    setEmployeeSkills(empData?.Skills || []);

    // Fetch test results
    const [scoreRes, answersRes] = await Promise.all([
      fetch(`${BACKEND}/api/performance/employee_assessment_results/all`),
      fetch(`${BACKEND}/api/mcq/submitted-answers`)
    ]);
    const scoreData = await scoreRes.json();
    setScoreLog(scoreData.filter(row => String(row.employee_id) === empId.trim() || Number(row.employee_id) === Number(empId.trim())));
    setSubmittedAnswers((await answersRes.json()).submissions.filter(row => String(row.employee_id) === empId.trim() || Number(row.employee_id) === Number(empId.trim())));
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
          <button className="employee-performance-btn" onClick={handleFetch}>Fetch</button>
        </div>
        {loading && <div>Loading...</div>}
        {/* Radar Chart Section */}
        {skillsLoaded && employeeRoles.length > 0 && scoreLog.length > 0 && competencyMap.length > 0 && (
          <EmployeeRadarChartSection
            employeeRoles={employeeRoles}
            competencyMap={competencyMap}
            scoreLog={scoreLog}
          />
        )}
        {skillsLoaded && scoreLog.length > 0 && (
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
      </div>
    </div>
  );
};

export default EmployeePerformance;