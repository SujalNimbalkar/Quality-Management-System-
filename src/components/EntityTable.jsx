import React, { useEffect, useState } from 'react';

function EntityTable({ entity, columns, title }) {
  const [rows, setRows] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [newRow, setNewRow] = useState({});

  useEffect(() => {
    fetch(`/api/${entity}`)
      .then(res => res.json())
      .then(setRows);
  }, [entity]);

  const handleChange = (row, key, value) => {
    setEditingRow({ ...row, [key]: value });
  };

  const handleSave = (row) => {
    fetch(`/api/${entity}/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row)
    }).then(() => window.location.reload());
  };

  const handleDelete = (id) => {
    fetch(`/api/${entity}/${id}`, { method: 'DELETE' })
      .then(() => window.location.reload());
  };

  const handleAdd = () => {
    fetch(`/api/${entity}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRow)
    }).then(() => window.location.reload());
  };

  return (
    <div>
      <h2>{title}</h2>
      <table border="1">
        <thead>
          <tr>
            {columns.map(col => <th key={col}>{col}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id || row[columns[0]]}>
              {columns.map(col => (
                <td key={col}>
                  {editingRow && editingRow.id === row.id ? (
                    <input value={editingRow[col]} onChange={e => handleChange(editingRow, col, e.target.value)} />
                  ) : (
                    row[col]
                  )}
                </td>
              ))}
              <td>
                {editingRow && editingRow.id === row.id ? (
                  <button onClick={() => handleSave(editingRow)}>Save</button>
                ) : (
                  <button onClick={() => setEditingRow(row)}>Edit</button>
                )}
                <button onClick={() => handleDelete(row.id || row[columns[0]])}>Delete</button>
              </td>
            </tr>
          ))}
          <tr>
            {columns.map(col => (
              <td key={col}>
                <input value={newRow[col] || ''} onChange={e => setNewRow({ ...newRow, [col]: e.target.value })} />
              </td>
            ))}
            <td><button onClick={handleAdd}>Add</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default EntityTable;
