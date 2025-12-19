import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import IDE from './pages/IDE';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/ide" element={<IDE />} />
    </Routes>
  );
}

export default App;
