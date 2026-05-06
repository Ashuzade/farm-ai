import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar        from './components/Navbar';
import Dashboard     from './components/Dashboard';
import CropPage      from './pages/CropPage';
import DiseasePage   from './pages/DiseasePage';
import WeatherPage   from './pages/WeatherPage';
import IrrigationPage from './pages/IrrigationPage';

import en from './i18n/en.json';
import hi from './i18n/hi.json';
import mr from './i18n/mr.json';

const translations = { en, hi, mr };

function AppContent({ t, lang, setLang }) {
  const location = useLocation();

  const pageClass =
    location.pathname === '/crop'       ? 'page-crop'       :
    location.pathname === '/disease'    ? 'page-disease'    :
    location.pathname === '/weather'    ? 'page-weather'    :
    location.pathname === '/irrigation' ? 'page-irrigation' :
    'page-home';

  return (
    <>
      <Navbar lang={lang} setLang={setLang} t={t} />

      <main className={pageClass}>
        <Routes>
          <Route path="/"           element={<Dashboard     t={t} />} />
          <Route path="/crop"       element={<CropPage      t={t} />} />
          <Route path="/disease"    element={<DiseasePage   t={t} />} />
          <Route path="/weather"    element={<WeatherPage   t={t} />} />
          <Route path="/irrigation" element={<IrrigationPage t={t} />} />    
        </Routes>
      </main>

      <footer style={{
        textAlign:'center', padding:'16px 24px',
        fontSize:12, fontWeight:600,
        borderTop:'1.5px solid rgba(255,255,255,0.3)',
        background:'rgba(255,255,255,0.2)',
        backdropFilter:'blur(8px)',
        color: pageClass === 'page-disease'    ? '#7c2d12' :
               pageClass === 'page-weather'    ? '#0c4a6e' :
               pageClass === 'page-irrigation' ? '#3b0764' :
               '#14532d',
      }}>
        🌾 FarmAI — Smart Farming Intelligence · Built with FastAPI + React
      </footer>
    </>
  );
}

export default function App() {
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius:'12px', fontSize:'13px' },
        }}
      />
      <AppContent t={t} lang={lang} setLang={setLang} />
    </BrowserRouter>
  );
}