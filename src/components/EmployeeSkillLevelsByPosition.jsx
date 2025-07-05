import React, { useState, useEffect } from 'react';
import { skillNameToCode } from '../utils/skillMaps';
import './EmployeePerformance.css';

// Helper to normalize skill names
const normalizeSkillName = s => s && typeof s === 'string' ? s.replace(/\r?\n|\r/g, '').trim().replace(/\s+/g, ' ') : s;

const EmployeeSkillLevelsByPosition = () => {
  const [competencyMap, setCompetencyMap] = useState([]);
  const [allSkillsData, setAllSkillsData] = useState([]);
  const [allScoreLog, setAllScoreLog] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");

  const BACKEND = import.meta.env.VITE_BACKEND_URL;

  // Load competency map JSON on mount
  useEffect(() => {
    fetch(`${BACKEND}/excel_data/competency_map_Sheet1.json`)
      .then(res => res.json())
      .then(data => setCompetencyMap(data));
  }, [BACKEND]);

  // Load all employee skills and all score log on mount for filter table
  useEffect(() => {
    fetch(`${BACKEND}/excel_data/employee_skills_levels.json`).then(res => res.json()).then(setAllSkillsData);
    fetch(`${BACKEND}/api/performance/employee_assessment_results/all`).then(res => res.json()).then(setAllScoreLog);
  }, [BACKEND]);

  // Helper function to calculate achieved level from test results
  const calculateAchievedLevel = (test) => {
    let achieved = 0;
    let failed = false;
    
    if (test) {
      if (test.status && test.status.toLowerCase() === 'fail') {
        achieved = 0;
        failed = true;
      } else if (
        test.level && Number(test.level) === 2 &&
        test.percent && Number(test.percent) >= 80
      ) {
        achieved = 3;
      } else if (
        test.level && Number(test.level) === 3 &&
        test.percent && Number(test.percent) < 80 && Number(test.percent) > 60
      ) {
        achieved = 2;
      } else if (
        test.level && Number(test.level) === 3 &&
        test.percent && Number(test.percent) <= 60
      ) {
        achieved = 0;
        failed = true;
      } else if (test.level && !isNaN(Number(test.level))) {
        achieved = Number(test.level);
      }
    }
    
    return { achieved, failed };
  };

  return (
    <div className="employee-performance-card">
      <h2 className="employee-performance-title">Employee Skill Levels by Position</h2>
      <div style={{marginBottom: 16}}>
        <label htmlFor="role-select">Select Position/Role: </label>
        <select id="role-select" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
          <option value="">-- Select Role --</option>
          {competencyMap.map((r, i) => r.Role && <option key={i} value={r.Role}>{r.Role}</option>)}
        </select>
      </div>
      {selectedRole && (() => {
        // Find required skills for this role
        const roleEntry = competencyMap.find(r => r.Role === selectedRole);
        if (!roleEntry) return null;
        const requiredSkills = Object.entries(roleEntry.Skills || {});
        // Find all employees with this role
        const employeesWithRole = allSkillsData.filter(e => 
          Array.isArray(e.Roles) ? e.Roles.includes(selectedRole) : e.Roles === selectedRole
        );
        
        // Build table rows: for each employee, for each skill, show achieved level
        return (
          <div style={{overflowX:'auto'}}>
            <table className="employee-performance-table" border="1" cellPadding="4">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  {requiredSkills.map(([skillName], i) => <th key={i}>{skillName}</th>)}
                </tr>
              </thead>
              <tbody>
                {employeesWithRole.map((emp, idx) => {
                  return (
                    <tr key={idx}>
                      <td>{emp.Employee}</td>
                      <td>{emp["Employee Name"] || emp.Name || emp.EmployeeName || ""}</td>
                      {requiredSkills.map(([skillName], i) => {
                        // Find test result for this employee and skill
                        const skillCode = skillNameToCode[normalizeSkillName(skillName)] || skillName;
                        const test = allScoreLog.find(row =>
                          (row.employee_id === String(emp.Employee) || row.employee_id === emp.Employee) &&
                          (row.skill === skillCode || normalizeSkillName(row.skill) === normalizeSkillName(skillName))
                        );
                        
                        // Calculate achieved level
                        const { achieved, failed } = calculateAchievedLevel(test);
                        
                        return (
                          <td key={i} style={failed ? {color:'red', fontWeight:'bold'} : {}}>
                            {failed ? 'Failed' : achieved}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })()}
    </div>
  );
};

export default EmployeeSkillLevelsByPosition; 