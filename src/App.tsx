import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import BoardGameUnified from './components/BoardGameUnified';

function App() {
  return (
      <AuthProvider>
        <BoardGameUnified />
      </AuthProvider>
  );
}

export default App;
