import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';

// Helper to normalize skill names
const normalizeSkillName = s => s && typeof s === 'string' ? s.replace(/\r?\n|\r/g, '').trim().replace(/\s+/g, ' ') : s;

// Chart for a single role
const EmployeeRadarChart = ({ data, role }) => {
  return (
    <div className="employee-performance-radar-container">
      <h5 style={{ textAlign: 'center', marginBottom: 8 }}>{role}</h5>
      <RadarChart cx={200} cy={200} outerRadius={150} width={400} height={400} data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" tick={props => {
          const d = data[props.index];
          return (
            <text {...props} fill={d && d.failed ? 'red' : '#666'} fontWeight={d && d.failed ? 'bold' : 'normal'}>
              {d ? d.skill : ''}{d && d.failed ? ' (L1)' : ''}
            </text>
          );
        }} />
        <PolarRadiusAxis angle={30} domain={[0, 4]} />
        <Radar name="Required" dataKey="required" stroke="#ffa500" fill="#ffa500" fillOpacity={0.2} />
        <Radar name="Achieved" dataKey="achieved" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        <Tooltip formatter={(value, name, props) => {
          const d = props.payload;
          if (name === 'achieved' && d.failed) return ['L1', 'Achieved'];
          return [value, name.charAt(0).toUpperCase() + name.slice(1)];
        }} />
        <Legend />
      </RadarChart>
    </div>
  );
};

// Section to render all radar charts for the employee's roles
export const EmployeeRadarChartSection = ({ employeeRoles, competencyMap, scoreLog, skillNameToCode }) => {
  // Compute radar data for each role
  const radarDataByRole = useMemo(() => {
    if (!employeeRoles.length || !competencyMap.length) return {};
    const radarData = {};
    employeeRoles.forEach(role => {
      // Find the entry for this role in the competency map
      const roleEntry = competencyMap.find(r => r.Role && r.Role.trim().toLowerCase() === role.trim().toLowerCase());
      if (!roleEntry) return;
      // Get all required skills for this role
      const requiredSkills = Object.entries(roleEntry.Skills || {});
      radarData[role] = requiredSkills.map(([skillName, requiredLevel]) => {
        // Find the test result for this skill (by code)
        const skillCode = skillNameToCode[normalizeSkillName(skillName)] || skillName;
        const test = scoreLog.find(row => {
          // row.skill may be code or name, so check both
          return row.skill === skillCode || normalizeSkillName(row.skill) === normalizeSkillName(skillName);
        });
        // Required level from map
        let required = 0;
        if (requiredLevel && !isNaN(Number(requiredLevel))) required = Number(requiredLevel);
        // Achieved level from test
        let achieved = 0;
        let failed = false;
        if (test) {
          const level = Number(test.level);
          const percent = Number(test.percent);
          if (level === 2) {
            if (percent >= 60 && percent < 80) achieved = 2;
            else if (percent >= 80) achieved = 3;
            else { achieved = 1; failed = true; }
          } else if (level === 3) {
            if (percent >= 80) achieved = 3;
            else if (percent >= 60 && percent < 80) achieved = 2;
            else { achieved = 1; failed = true; }
          } else if (level === 4) {
            if (percent >= 60) achieved = 4;
            else { achieved = 1; failed = true; }
          }
        }
        return {
          skill: skillName,
          required,
          achieved,
          failed,
        };
      });
    });
    return radarData;
  }, [employeeRoles, competencyMap, scoreLog, skillNameToCode]);

  return (
    <div style={{marginTop: 16}}>
      <h4 className="employee-performance-section-title">Skill Performance by Role</h4>
      {Object.entries(radarDataByRole).map(([role, data]) => (
        <EmployeeRadarChart key={role} data={data} role={role} />
      ))}
    </div>
  );
};

export default EmployeeRadarChart; 