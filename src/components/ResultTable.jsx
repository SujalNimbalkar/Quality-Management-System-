import React from 'react';

const ResultTable = ({ results }) => (
  <table border="1">
    <thead>
      <tr>
        <th>Name</th>
        <th>Position</th>
        <th>Skill Name</th>
        <th>Skill Code</th>
        <th>Level</th>
        <th>Score</th>
        <th>Result</th>
        <th>Course Link</th>
      </tr>
    </thead>
    <tbody>
      {results.map((row, idx) => (
        <tr key={idx}>
          <td>{row.Name}</td>
          <td>{row.Position}</td>
          <td>{row.SkillName}</td>
          <td>{row.SkillCode}</td>
          <td>{row.Level}</td>
          <td>{row.Score}</td>
          <td>{row.Result}</td>
          <td><a href={row.CourseLink} target="_blank" rel="noopener noreferrer">Link</a></td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default ResultTable;
