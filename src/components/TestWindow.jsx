import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TestWindow.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const TestWindow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { skill, level, employeeInfo, employeeRoles, employeeId } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillNameToCode, setSkillNameToCode] = useState({});
  const [skillsLoaded, setSkillsLoaded] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  console.log("TestWindow location.state:", location.state);
  console.log("TestWindow employeeInfo:", employeeInfo);
  console.log("TestWindow employeeRoles:", employeeRoles);

  useEffect(() => {
    fetch(`${BACKEND}/api/skills`)
      .then(res => res.json())
      .then(skills => {
        setSkillNameToCode(Object.fromEntries(skills.map(s => [s.name, s.code])));
        setSkillsLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!skill || !level || !skillsLoaded) return;
    const normalizeSkillName = s => s.replace(/\r?\n|\r/g, '').trim().replace(/\s+/g, ' ');
    const normalizedSkill = normalizeSkillName(skill);
    const skill_id = skillNameToCode[normalizedSkill] || skill;
    fetch(`${BACKEND}/api/mcq/questions?skill_id=${encodeURIComponent(skill_id)}&level=${level}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [skill, level, skillsLoaded, skillNameToCode]);

  // Redirect to root if not navigated from EmployeeDashboard
  useEffect(() => {
    if (!location.state || !location.state.fromDashboard) {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  // Redirect to Login if back navigation comes from EmployeeDashboard
  useEffect(() => {
    const handlePopState = () => {
      // If previous page was EmployeeDashboard, redirect to Login
      if (location.state && location.state.fromDashboard) {
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.state, navigate]);

  const handleOptionChange = (qIdx, option) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitted || loading) return; // Prevent multiple submissions
    setSubmitted(true); // Disable button immediately

    // Use employeeId from navigation state, fallback to employeeInfo
    const empId = employeeId || employeeInfo?.id || employeeInfo?.employee_id || employeeInfo?.emp_id;
    const employeeName = employeeInfo?.name || employeeInfo?.employee_name;
    const employeePosition = (employeeInfo?.roles && employeeInfo.roles[0]) || (Array.isArray(employeeRoles) && employeeRoles[0]) || employeeInfo?.position || employeeInfo?.role;

    const submissions = questions.map((q, i) => {
      const selectedIdx = q.options.findIndex(opt => opt === selectedAnswers[i]);
      const selected_letter = selectedIdx !== -1 ? String.fromCharCode(65 + selectedIdx) : '';
      return {
        question_id: q._id || q.question_id,
        question_text: q.question_text,
        options: q.options,
        selected_letter,
        skill: q.skill_id || skill,
        level: level,
        employee_id: empId,
        employee_name: employeeName,
        employee_position: employeePosition
      };
    });

    fetch(`${BACKEND}/api/mcq/submit-answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissions })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Answers submitted!');
          navigate('/dashboard', {
            replace: true, // <-- add this
            state: {
              employeeInfo,
              employeeRoles,
              employeeId,
              submittedTest: { skill, level }
            }
          });
        } else {
          setSubmitted(false); // Allow retry
          alert('Submission failed');
        }
      })
      .catch(() => {
        setSubmitted(false); // Allow retry
        alert('Submission failed');
      });
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: 40}}>Loading...</div>;
  if (!questions.length) return <div style={{textAlign: 'center', marginTop: 40}}>No questions found for this skill/level.</div>;

  return (
    <div className="testwindow-root">
      <h2 className="testwindow-title">Test: {skill} (Level {level})</h2>
      <form onSubmit={handleSubmit}>
        <ol className="testwindow-questions">
          {questions.map((q, i) => (
            <li key={i} className="testwindow-question-card">
              <div className="testwindow-question-text">
                {q.question_text}
              </div>
              <ul className="testwindow-options">
                {q.options.map((opt, j) => (
                  <li key={j} className="testwindow-option-item">
                    <label className="testwindow-option-label">
                      <input
                        type="radio"
                        className="testwindow-radio"
                        name={`q${i}`}
                        value={opt}
                        checked={selectedAnswers[i] === opt}
                        onChange={() => handleOptionChange(i, opt)}
                        required
                      />
                      {opt}
                    </label>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <div className="testwindow-submit-row">
          {submitted ? (
            <span style={{ color: 'green', fontWeight: 'bold' }}>Submitted</span>
          ) : (
            <button type="submit" className="testwindow-submit-btn" disabled={submitted}>
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TestWindow;