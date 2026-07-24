import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import IDE from './pages/IDE';
import Sitemap from './pages/Sitemap';
import InstallBanner from './components/InstallBanner';
import SEOManager from './components/SEOManager';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const isCrawling = typeof window !== 'undefined' && window.navigator.userAgent.includes('ReactSnap');
  const [isInitializing, setIsInitializing] = React.useState(!isCrawling);

  return (
    <AuthProvider>
      {!isCrawling && <LoadingScreen onFinished={() => setIsInitializing(false)} />}
      {!isInitializing && (
        <>
          <SEOManager />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ide" element={<IDE />} />
            <Route path="/sitemap" element={<Sitemap />} />
          </Routes>
          <InstallBanner />
        </>
      )}
    </AuthProvider>
  );
}

export default App;

