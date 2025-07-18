import React, { createContext, useContext, useEffect, useState } from "react";
const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const SkillsContext = createContext();

export const useSkills = () => useContext(SkillsContext);

export const SkillsProvider = ({ children }) => {
  const [skills, setSkills] = useState([]);
  const [skillNameToCode, setSkillNameToCode] = useState({});

  useEffect(() => {
    fetch(`${BACKEND}/api/skills`)
      .then(res => res.json())
      .then(skills => {
        setSkills(skills);
        setSkillNameToCode(Object.fromEntries(skills.map(s => [s.name, s.code])));
      });
  }, []);

  return (
    <SkillsContext.Provider value={{ skills, skillNameToCode }}>
      {children}
    </SkillsContext.Provider>
  );
}; 