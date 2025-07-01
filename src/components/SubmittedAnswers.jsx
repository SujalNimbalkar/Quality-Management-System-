import React, { useEffect, useState } from 'react';

const SubmittedAnswers = () => {
  const [scoreLog, setScoreLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    fetch(`${BACKEND}/api/mcq/score-log`)
      .then(res => res.json())
      .then(data => {
        setScoreLog(data.scoreLog || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Employee Score Log</h2>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Employee Position</th>
            <th>Skill</th>
            <th>Level</th>
            <th>Score</th>
            <th>Max Score</th>
            <th>Percent</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {scoreLog.map((row, idx) => (
            <tr key={idx}>
              <td>{row.timestamp}</td>
              <td>{row.employee_id}</td>
              <td>{row.employee_name}</td>
              <td>{row.employee_position}</td>
              <td>{row.skill}</td>
              <td>{row.level}</td>
              <td>{row.score}</td>
              <td>{row.max_score}</td>
              <td>{row.percent}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmittedAnswers; 