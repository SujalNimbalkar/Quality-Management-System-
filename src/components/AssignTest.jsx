import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const AssignTest = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [tests, setTests] = useState(['Test 1', 'Test 2', 'Test 3']);
  const [selectedTest, setSelectedTest] = useState('');

  useEffect(() => {
    // Fetch employee list from backend
    axios.get(`${BACKEND}/employees`)
      .then(response => {
        console.log('Fetched employees:', response.data); // Debugging log
        setEmployees(response.data);
      })
      .catch(error => console.error('Error fetching employees:', error));
  }, []);

  const handleAssign = () => {
    if (!selectedEmployee || !selectedTest) {
      alert('Please fill all fields');
      return;
    }

    // Call backend API to assign test
    axios.post(`${BACKEND}/assign-test`, {
      adminId: 'E1000', // Force adminId to 'E1000'
      employeeId: selectedEmployee,
      testName: selectedTest,
    })
      .then(() => alert('Test assigned successfully'))
      .catch(error => {
        alert('Error assigning test: ' + (error.response?.data?.message || error.message));
        console.error('Error assigning test:', error);
      });
  };

  return (
    <div>
      <h2>Assign Test (HR/Admin)</h2>
      <select
        value={selectedEmployee}
        onChange={e => setSelectedEmployee(e.target.value)}
      >
        <option value="">Select Employee</option>
        {employees.map(emp => (
          <option key={emp.Employee_id} value={emp.Employee_id}>
            {emp.Employee_id} {emp.Name ? `- ${emp.Name}` : ''}
          </option>
        ))}
      </select>
      <select
        value={selectedTest}
        onChange={e => setSelectedTest(e.target.value)}
      >
        <option value="">Select Test</option>
        {tests.map(test => (
          <option key={test} value={test}>{test}</option>
        ))}
      </select>
      <button onClick={handleAssign}>Assign Test</button>
    </div>
  );
};

export default AssignTest;
