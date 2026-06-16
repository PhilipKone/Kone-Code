import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import IDE from './pages/IDE';
import InstallBanner from './components/InstallBanner';
import SEOManager from './components/SEOManager';
import LoadingScreen from './components/LoadingScreen';
import ReferralCard from './components/ReferralCard';

function App() {
  const [isInitializing, setIsInitializing] = React.useState(true);

  return (
    <AuthProvider>
      <LoadingScreen onFinished={() => setIsInitializing(false)} />
      {!isInitializing && (
        <>
          <SEOManager />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ide" element={<IDE />} />
            <Route path="/referral" element={
              <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <nav className="navbar" style={{ position: 'static', marginBottom: '2rem' }}>
                  <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <img src="/logo-circle-blue.svg" alt="Logo" style={{ height: '35px', marginRight: '10px' }} />
                    Kone Code
                  </Link>
                </nav>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <ReferralCard />
                </div>
              </div>
            } />
          </Routes>
          <InstallBanner />
        </>
      )}
    </AuthProvider>
  );
}

export default App;

