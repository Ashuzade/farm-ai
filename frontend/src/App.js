import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar         from './components/Navbar';
import Dashboard      from './components/Dashboard';
import CropPage       from './pages/CropPage';
import DiseasePage    from './pages/DiseasePage';
import WeatherPage    from './pages/WeatherPage';
import IrrigationPage from './pages/IrrigationPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';

import { isLoggedIn, getUser, clearAuth } from './services/auth';

import en from './i18n/en.json';
import hi from './i18n/hi.json';
import mr from './i18n/mr.json';

const translations = { en, hi, mr };

// ── Protected Route ──
function ProtectedRoute({ children, user }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ── Main App Content ──
function AppContent({ t, lang, setLang, user, setUser }) {
  const location = useLocation();

  const pageClass =
    location.pathname === '/crop'       ? 'page-crop'       :
    location.pathname === '/disease'    ? 'page-disease'    :
    location.pathname === '/weather'    ? 'page-weather'    :
    location.pathname === '/irrigation' ? 'page-irrigation' :
    'page-home';

  const handleLogout = () => {
    clearAuth();
    setUser(null);
  };

  // ── Auth pages — no navbar ──
  if (location.pathname === '/login' || location.pathname === '/register') {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/" replace />
              : <LoginPage
                  onLogin={(u) => {
                    if (u === 'goto-register') {
                      window.location.href = '/register';
                    } else {
                      setUser(u);
                    }
                  }}
                />
          }
        />
        <Route
          path="/register"
          element={
            user
              ? <Navigate to="/" replace />
              : <RegisterPage
                  onRegister={(u) => setUser(u)}
                  onBackToLogin={() => { window.location.href = '/login'; }}
                />
          }
        />
      </Routes>
    );
  }

  return (
    <>
      <Navbar
        lang={lang}
        setLang={setLang}
        t={t}
        user={user}
        onLogout={handleLogout}
      />

      <main className={pageClass}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute user={user}>
              <Dashboard t={t} user={user} />
            </ProtectedRoute>
          }/>
          <Route path="/crop" element={
            <ProtectedRoute user={user}>
              <CropPage t={t} />
            </ProtectedRoute>
          }/>
          <Route path="/disease" element={
            <ProtectedRoute user={user}>
              <DiseasePage t={t} />
            </ProtectedRoute>
          }/>
          <Route path="/weather" element={
            <ProtectedRoute user={user}>
              <WeatherPage t={t} />
            </ProtectedRoute>
          }/>
          <Route path="/irrigation" element={
            <ProtectedRoute user={user}>
              <IrrigationPage t={t} />
            </ProtectedRoute>
          }/>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer style={{
        textAlign: 'center', padding: '16px 24px',
        fontSize: 12, fontWeight: 600,
        borderTop: '1.5px solid rgba(255,255,255,0.3)',
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)',
        color:
          pageClass === 'page-disease'    ? '#7c2d12' :
          pageClass === 'page-weather'    ? '#0c4a6e' :
          pageClass === 'page-irrigation' ? '#3b0764' :
          '#14532d',
      }}>
        🌾 FarmAI — Smart Farming Intelligence
      </footer>
    </>
  );
}

// ── Root App ──
export default function App() {
  const [lang, setLang] = useState('en');
  const [user, setUser] = useState(null);
  const t = translations[lang];

  // Check if user is already logged in on app load
  useEffect(() => {
    if (isLoggedIn()) {
      setUser(getUser());
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', fontSize: '13px' },
        }}
      />
      <AppContent
        t={t}
        lang={lang}
        setLang={setLang}
        user={user}
        setUser={setUser}
      />
    </BrowserRouter>
  );
}