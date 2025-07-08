import React, { useState, useEffect } from 'react';
import { skillNameToCode } from '../utils/skillMaps';
import './EmployeePerformance.css';
import * as XLSX from 'xlsx';

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

  const handleExportXLS = () => {
    if (!selectedRole) return;
    // Find required skills for this role
    const roleEntry = competencyMap.find(r => r.Role === selectedRole);
    if (!roleEntry) return;
    const requiredSkills = Object.entries(roleEntry.Skills || {});
    const employeesWithRole = allSkillsData.filter(e => 
      Array.isArray(e.Roles) ? e.Roles.includes(selectedRole) : e.Roles === selectedRole
    );
    // Build data array: header row + data rows
    const header = [
      'Employee Name',
      ...requiredSkills.map(([skillName]) => skillName)
    ];
    const data = employeesWithRole.map(emp => {
      const empName = emp["Employee Name"] || emp.Name || emp.EmployeeName || emp.Employee;
      const row = [empName];
      requiredSkills.forEach(([skillName]) => {
        const skillCode = skillNameToCode[normalizeSkillName(skillName)] || skillName;
        const test = allScoreLog.find(row =>
          (row.employee_name && row.employee_name.trim().toLowerCase() === String(empName).trim().toLowerCase()) &&
          (row.skill === skillCode || normalizeSkillName(row.skill) === normalizeSkillName(skillName))
        );
        // Prefer StrLevel if present, else compute
        let displayLevel = '';
        let isFailed = false;
        if (test) {
          const level = Number(test.level);
          const percent = Number(test.percent);
          if (level === 2) {
            if (percent >= 60 && percent < 80) displayLevel = 'L2';
            else if (percent >= 80) displayLevel = 'L3';
            else { displayLevel = 'L1'; isFailed = true; }
          } else if (level === 3) {
            if (percent > 80) displayLevel = 'L3';
            else if (percent >= 60 && percent <= 80) displayLevel = 'L2';
            else { displayLevel = 'L1'; isFailed = true; }
          } else if (level === 4) {
            if (percent > 60) displayLevel = 'L4';
            else { displayLevel = 'L1'; isFailed = true; }
          }
        }
        row.push(displayLevel);
      });
      return row;
    });
    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Skill Levels');
    XLSX.writeFile(wb, `SkillLevels_${selectedRole.replace(/\s+/g, '_')}.xlsx`);
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
      {/* Export to XLS Button */}
      <button onClick={handleExportXLS} className="employee-performance-btn" style={{marginBottom: 16}}>Export to XLS</button>
      {/* Print Button */}
      <button onClick={() => window.print()} className="employee-performance-btn" style={{marginBottom: 16}}>Print Table</button>
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
          <div id="print-skill-table" style={{overflowX:'auto'}}>
            <table className="employee-performance-table" border="1" cellPadding="4">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  {requiredSkills.map(([skillName], i) => <th key={i}>{skillName}</th>)}
                </tr>
              </thead>
              <tbody>
                {employeesWithRole.map((emp, idx) => {
                  return (
                    <tr key={idx}>
                      <td>{emp["Employee Name"] || emp.Name || emp.EmployeeName || emp.Employee}</td>
                      {requiredSkills.map(([skillName], i) => {
                        // Find test result for this employee and skill
                        const skillCode = skillNameToCode[normalizeSkillName(skillName)] || skillName;
                        // Try to match on employee name (robust to different key names)
                        const empName = emp["Employee Name"] || emp.Name || emp.EmployeeName || emp.Employee;
                        const test = allScoreLog.find(row =>
                          (row.employee_name && row.employee_name.trim().toLowerCase() === String(empName).trim().toLowerCase()) &&
                          (row.skill === skillCode || normalizeSkillName(row.skill) === normalizeSkillName(skillName))
                        );

                        // Prefer StrLevel if present
                        let displayLevel = '';
                        let isFailed = false;
                        if (test) {
                          const level = Number(test.level);
                          const percent = Number(test.percent);
                          if (level === 2) {
                            if (percent >= 60 && percent < 80) displayLevel = 'L2';
                            else if (percent >= 80) displayLevel = 'L3';
                            else { displayLevel = 'L1'; isFailed = true; }
                          } else if (level === 3) {
                            if (percent > 80) displayLevel = 'L3';
                            else if (percent >= 60 && percent <= 80) displayLevel = 'L2';
                            else { displayLevel = 'L1'; isFailed = true; }
                          } else if (level === 4) {
                            if (percent > 60) displayLevel = 'L4';
                            else { displayLevel = 'L1'; isFailed = true; }
                          }
                        }

                        return (
                          <td key={i} style={isFailed ? {color:'red', fontWeight:'bold'} : {}}>
                            {displayLevel}
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
      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-skill-table, #print-skill-table * { visibility: visible; }
          #print-skill-table { position: absolute; left: 0; top: 0; width: 100vw; background: white; }
          .employee-performance-btn, .employee-performance-title, label, select { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default EmployeeSkillLevelsByPosition; 