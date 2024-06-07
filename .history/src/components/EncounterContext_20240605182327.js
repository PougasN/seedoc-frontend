// EncounterContext.js
import React, { createContext, useState } from 'react';

const EncounterContext = createContext();

export const EncounterProvider = ({ children }) => {
  const [encounters, setEncounters] = useState([]);

  return (
    <EncounterContext.Provider value={{ encounters, setEncounters }}>
      {children}
    </EncounterContext.Provider>
  );
};

export default EncounterContext;
