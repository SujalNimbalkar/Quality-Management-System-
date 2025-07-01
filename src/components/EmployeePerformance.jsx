import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
import './EmployeePerformance.css';
// If recharts is not installed, show a placeholder for the radar chart

const EmployeePerformance = () => {
  const [empId, setEmpId] = useState("");
  const [skillId, setSkillId] = useState("");
  const [scoreLog, setScoreLog] = useState([]);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [loading, setLoading] = useState(false);
const BACKEND = import.meta.env.VITE_BACKEND_URL;
  const handleFetch = async () => {
    if (!empId) return;
    setLoading(true);
    const [scoreRes, answersRes] = await Promise.all([
      fetch(`${BACKEND}/api/performance/employee_assessment_results/all`),
      fetch(`${BACKEND}/api/mcq/submitted-answers`)
    ]);
    const scoreData = await scoreRes.json();
    const answersData = await answersRes.json();
    const filteredScore = scoreData.filter(row => row.employee_id === empId);
    setScoreLog(filteredScore);

    // Filter by employee_id and (if provided) skill
    const filteredAnswers = answersData.submissions.filter(row =>
      row.employee_id === empId && (skillId ? row.skill === skillId : true)
    );
    setSubmittedAnswers(filteredAnswers);

    // Prepare radar data: group by skill, take highest percent for each skill
    const skillMap = {};
    filteredScore.forEach(row => {
      if (!skillMap[row.skill] || Number(row.percent) > Number(skillMap[row.skill].percent)) {
        skillMap[row.skill] = row;
      }
    });
    setRadarData(Object.values(skillMap).map(row => ({ skill: row.skill, percent: Number(row.percent) })));
    setLoading(false);
  };

  return (
    <div className="employee-performance-root">
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
            placeholder="Enter Skill ID (optional)"
            value={skillId}
            onChange={e => setSkillId(e.target.value)}
          />
          <button className="employee-performance-btn" onClick={handleFetch}>Fetch</button>
        </div>
        {loading && <div>Loading...</div>}
        {scoreLog.length > 0 && (
          <div style={{marginTop: 16}}>
            <h4 className="employee-performance-section-title">Score Log</h4>
            <table className="employee-performance-table" border="1" cellPadding="4">
              <thead>
                <tr>
                  <th>Timestamp</th><th>Employee ID</th><th>Name</th><th>Position</th><th>Skill</th><th>Level</th><th>Score</th><th>Max Score</th><th>Percent</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scoreLog.map((row, i) => (
                  <tr key={i}>
                    <td>{row.timestamp}</td><td>{row.employee_id}</td><td>{row.employee_name}</td><td>{row.employee_position}</td><td>{row.skill}</td><td>{row.level}</td><td>{row.score}</td><td>{row.max_score}</td><td>{row.percent}</td><td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {submittedAnswers.length > 0 && (
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
        )}
        {radarData.length > 0 && (
          <div className="employee-performance-radar-container">
            <h4 className="employee-performance-section-title">Skill Performance (Spider Chart)</h4>
            <RadarChart cx={200} cy={200} outerRadius={150} width={400} height={400} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Percent" dataKey="percent" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePerformance; 