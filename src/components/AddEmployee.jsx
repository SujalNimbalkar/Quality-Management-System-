import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddEmployee.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const AddEmployee = () => {
  const [form, setForm] = useState({
    Employee: '',
    Department: '',
    Roles: [],
    email: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [roleOptions, setRoleOptions] = useState([]);
  const [roleSkillMap, setRoleSkillMap] = useState({});
  const navigate = useNavigate();

  // Fetch roles for dropdown
  useEffect(() => {
    fetch(`${BACKEND}/api/roles`)
      .then(res => res.json())
      .then(setRoleOptions);
  }, []);

  // Fetch role-skill mapping (new structure: { role, skills })
  useEffect(() => {
    fetch(`${BACKEND}/api/competency_map`)
      .then(res => res.json())
      .then(data => {
        let skillMap = {};
        if (Array.isArray(data)) {
          data.forEach(r => { if (r.role) skillMap[r.role] = r.skills; });
        }
        setRoleSkillMap(skillMap);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, options } = e.target;
    if (type === 'select-multiple') {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setForm((prev) => ({ ...prev, [name]: selected }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      // Compute union of skills with highest level for each skill
      let skillsUnion = {};
      form.Roles.forEach(role => {
        const skills = roleSkillMap[role] || {};
        Object.entries(skills).forEach(([skill, level]) => {
          const numericLevel = typeof level === 'number' ? level : (parseInt(level) || level);
          if (!(skill in skillsUnion) || (typeof numericLevel === 'number' && numericLevel > skillsUnion[skill])) {
            skillsUnion[skill] = numericLevel;
          }
        });
      });
      const skillsArray = Object.entries(skillsUnion).map(([skill, level]) => ({ skill, level }));
      const res = await fetch(`${BACKEND}/api/employee_skills_levels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Employee: form.Employee,
          Department: form.Department,
          Roles: form.Roles,
          email: form.email,
          Skills: skillsArray,
        })
      });
      if (!res.ok) throw new Error('Failed to add employee');
      setSuccess(true);
      setForm({ Employee: '', Department: '', Roles: [], email: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="add-employee-root">
      <h2>Add New Employee</h2>
      <form onSubmit={handleSubmit} className="add-employee-form">
        <label>
          Name:
          <input name="Employee" value={form.Employee} onChange={handleChange} required />
        </label>
        <label>
          Department:
          <input name="Department" value={form.Department} onChange={handleChange} required />
        </label>
        <label>
          Roles:
          <select name="Roles" value={form.Roles} onChange={handleChange} multiple required>
            {roleOptions.map((role, idx) => (
              <option key={idx} value={role}>{role}</option>
            ))}
          </select>
        </label>
        <label>
          Email:
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <button type="submit" onClick={() => navigate('/dashboard')}>Add Employee</button>
      </form>
      {success && <div style={{color:'green'}}>Employee added successfully!</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
    </div>
  );
};

export default AddEmployee;
