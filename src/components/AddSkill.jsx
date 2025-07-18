import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddRole.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const AddSkill = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage('Skill name is required.');
      return;
    }
    const res = await fetch(`${BACKEND}/api/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    });
    if (res.ok) {
      setMessage('Skill added successfully!');
      setTimeout(() => navigate(-1), 1000);
    } else {
      setMessage('Failed to add skill.');
    }
  };

  return (
    <div className="add-role-root">
      <div className="add-skill-card">
        <h2>Add New Skill</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label><strong>Skill Name:</strong></label><br />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ width: '100%', padding: 8, fontSize: 16 }}
            />
          </div>
          <button type="submit" style={{ marginTop: 24, padding: '8px 24px', fontSize: 16 }}>Add Skill</button>
        </form>
        {message && <div style={{ marginTop: 16, color: message.includes('success') ? 'green' : 'red' }}>{message}</div>}
      </div>
    </div>
  );
};

export default AddSkill; 