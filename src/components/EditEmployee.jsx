import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditEmployee.css';
const BACKEND = import.meta.env.VITE_BACKEND_URL;
const EditEmployee = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [roles, setRoles] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [roleSkillMap, setRoleSkillMap] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inputId, setInputId] = useState('');
  const navigate = useNavigate();
  const handleIdSubmit = (e) => {
    e.preventDefault();
    if (inputId) navigate(`/edit-employee/${inputId}`);
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    if (!id) { setLoading(false); setEmployee(null); return; }
    // Fetch employee data
    fetch(`${BACKEND}/api/employee/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Employee not found');
        return res.json();
      })
      .then(data => setEmployee(data))
      .catch(() => setError('Failed to fetch employee data'));
    // Fetch role options and role-skill map
    fetch(`${BACKEND}/api/competency_map`)
      .then(res => res.json())
      .then(data => {
        let roles = [];
        let skillMap = {};
        if (Array.isArray(data)) {
          roles = data.map(r => r.role);
          data.forEach(r => { if (r.role) skillMap[r.role] = r.skills; });
        }
        setRoleOptions(roles.filter(Boolean));
        setRoleSkillMap(skillMap);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (employee && employee.Roles) setRoles(employee.Roles);
    else if (employee && !employee.Roles) setRoles([]);
  }, [employee]);

  const handleRoleChange = (e) => {
    const selected = Array.from(e.target.options).filter(o => o.selected).map(o => o.value);
    setRoles(selected);
  };

  // Compute skills union for selected roles
  const computeSkillsArray = () => {
    let skillsUnion = {};
    roles.forEach(role => {
      const skills = roleSkillMap[role] || {};
      Object.entries(skills).forEach(([skill, level]) => {
        const numericLevel = typeof level === 'number' ? level : (parseInt(level) || level);
        if (!(skill in skillsUnion) || (typeof numericLevel === 'number' && numericLevel > skillsUnion[skill])) {
          skillsUnion[skill] = numericLevel;
        }
      });
    });
    return Object.entries(skillsUnion).map(([skill, level]) => ({ skill, level }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    // Compute new skills array
    const skillsArray = computeSkillsArray();
    try {
      const res = await fetch(`${BACKEND}/api/employee/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Roles: roles,
          Employee: employee.Employee,
          email: employee.email,
          Skills: skillsArray
        })
      });
      if (!res.ok) throw new Error('Failed to update employee');
      setSuccess(true);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="edit-employee-root">
      <form onSubmit={handleIdSubmit} style={{marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8}} className="edit-employee-form">
        <label htmlFor="emp-id-input"><strong>Go to Employee ID:</strong></label>
        <input id="emp-id-input" type="number" min="1" value={inputId} onChange={e => setInputId(e.target.value)} style={{width: 80}} />
        <button type="submit">Edit</button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{color:'red'}}>{error}</div>
      ) : !employee && id ? (
        <div>No employee found.</div>
      ) : id ? (
        <>
          <h2>Edit Employee Roles</h2>
          <form onSubmit={handleSubmit} className="edit-employee-form">
            <label>
              Employee:
              <input
                type="text"
                value={employee.Employee || ''}
                onChange={e => setEmployee(emp => ({ ...emp, Employee: e.target.value }))}
                required
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={employee.email || ''}
                onChange={e => setEmployee(emp => ({ ...emp, email: e.target.value }))}
                required
              />
            </label>
            <label>
              Roles:
              <select multiple value={roles} onChange={handleRoleChange} required>
                {roleOptions.map((role, idx) => (
                  <option key={idx} value={role}>{role}</option>
                ))}
              </select>
            </label>
            <button type="submit">Save Changes</button>
            <button type="button" style={{marginLeft:8}} onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="button" style={{marginLeft:8, background:'#c00', color:'#fff'}} onClick={async () => {
              if (window.confirm('Are you sure you want to delete this employee?')) {
                try {
                  const res = await fetch(`${BACKEND}/api/employee/${id}`, { method: 'DELETE' });
                  if (!res.ok) throw new Error('Failed to delete employee');
                  navigate('/dashboard');
                } catch (err) {
                  setError(err.message);
                }
              }
            }}>Delete Employee</button>
          </form>
          {success && <div className="success">Employee updated!</div>}
          {error && <div className="error">{error}</div>}
        </>
      ) : null}
    </div>
  );
};

export default EditEmployee;
