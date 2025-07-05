import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';

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
              {d ? d.skill : ''}{d && d.failed ? ' (Failed)' : ''}
            </text>
          );
        }} />
        <PolarRadiusAxis angle={30} domain={[0, 4]} />
        <Radar name="Required" dataKey="required" stroke="#ffa500" fill="#ffa500" fillOpacity={0.2} />
        <Radar name="Achieved" dataKey="achieved" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        <Tooltip formatter={(value, name, props) => {
          const d = props.payload;
          if (name === 'achieved' && d.failed) return [`Failed`, 'Achieved'];
          return [value, name.charAt(0).toUpperCase() + name.slice(1)];
        }} />
        <Legend />
      </RadarChart>
    </div>
  );
};

export default EmployeeRadarChart; 