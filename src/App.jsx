import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import IDE from './pages/IDE';
import InstallBanner from './components/InstallBanner';

import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isInitializing, setIsInitializing] = React.useState(true);

  return (
    <AuthProvider>
      <LoadingScreen onFinished={() => setIsInitializing(false)} />
      {!isInitializing && (
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ide" element={<IDE />} />
          </Routes>
          <InstallBanner />
        </>
      )}
    </AuthProvider>
  );
}

export default App;

