import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddRole.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const AddRole = () => {
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillLevels, setSkillLevels] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch skills from backend
    fetch(`${BACKEND}/api/skills`)
      .then(res => res.json())
      .then(data => setSkills(data));
  }, []);

  const handleLevelChange = (skill, level) => {
    setSkillLevels(prev => ({ ...prev, [skill]: level }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role.trim()) {
      setMessage('Role name is required.');
      return;
    }
    // Prepare role object: { Role, Skills: { skill: level, ... } }
    const roleObj = {
      Role: role.trim(),
      Skills: Object.fromEntries(
        Object.entries(skillLevels).filter(([_, v]) => v && !isNaN(Number(v)))
      )
    };
    // POST to backend (you may need to adjust endpoint)
    const res = await fetch(`${BACKEND}/api/competency_map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleObj)
    });
    if (res.ok) {
      setMessage('Role added successfully!');
      setTimeout(() => navigate(-1), 1000);
    } else {
      setMessage('Failed to add role.');
    }
  };

  return (
    <div className="add-role-root">
      <div className="add-role-card">
        <h2>Add New Role</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label><strong>Role Name:</strong></label><br />
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            />
          </div>
          <div className="section-title">Skill Levels:</div>
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {skills.map(skill => (
                <tr key={skill.code}>
                  <td>{skill.name}</td>
                  <td>
                    <select
                      value={skillLevels[skill.name] || ''}
                      onChange={e => handleLevelChange(skill.name, e.target.value)}
                    >
                      <option value="">--</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="submit">Add Role</button>
        </form>
        {message && <div className={message.includes('success') ? 'success' : 'error'}>{message}</div>}
      </div>
    </div>
  );
};

export default AddRole; 