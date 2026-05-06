import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'mr', label: 'म'  },
];

const navLinks = [
  { path: '/',           icon: '🏠', label: 'Home'       },
  { path: '/crop',       icon: '🌱', label: 'Crop'       },
  { path: '/disease',    icon: '🍃', label: 'Disease'    },
  { path: '/weather',    icon: '🌤️', label: 'Weather'    },
  { path: '/irrigation', icon: '💧', label: 'Irrigation' },
];

export default function Navbar({ lang, setLang }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
      borderBottom: '2px solid rgba(34,197,94,0.2)',
      boxShadow: '0 2px 16px rgba(34,197,94,0.12)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 16,
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg,#22c55e,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 2px 8px rgba(34,197,94,0.35)',
          }}>🌾</div>
          <div>
            <div style={{ color:'#14532d', fontSize:17, fontWeight:900, letterSpacing:-0.5, lineHeight:1.1 }}>
              FarmAI
            </div>
            <div style={{ color:'#16a34a', fontSize:9, fontWeight:600, letterSpacing:0.5 }}>
              Smart Farming Intelligence
            </div>
          </div>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div style={{ display:'flex', alignItems:'center', gap:2 }} className="hidden md:flex">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '7px 13px',
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.18s',
                  whiteSpace: 'nowrap',
                  background: isActive
                    ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                    : 'transparent',
                  color: isActive ? '#fff' : '#166534',
                  boxShadow: isActive
                    ? '0 2px 10px rgba(34,197,94,0.35)'
                    : 'none',
                  border: isActive
                    ? '1.5px solid transparent'
                    : '1.5px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(34,197,94,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* ── Right Side ── */}
        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>

          {/* Status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 16,
            background: 'rgba(255,255,255,0.7)',
            border: '1.5px solid rgba(34,197,94,0.2)',
            fontSize: 11, fontWeight: 600, color: '#16a34a',
          }} className="hidden md:flex">
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
              display: 'inline-block',
              animation: 'pulse 2s infinite',
            }}/>
            Backend Online
          </div>

          {/* Language switcher */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: 'rgba(34,197,94,0.08)',
            border: '1.5px solid rgba(34,197,94,0.15)',
            borderRadius: 20, padding: '3px 4px',
          }}>
            {languages.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                style={{
                  padding: '4px 11px',
                  borderRadius: 15,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.15s',
                  background: lang === l.code
                    ? '#22c55e'
                    : 'transparent',
                  color: lang === l.code ? '#fff' : '#16a34a',
                  boxShadow: lang === l.code
                    ? '0 1px 6px rgba(34,197,94,0.3)'
                    : 'none',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
            style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1.5px solid rgba(34,197,94,0.2)',
              borderRadius: 8, padding: '6px 10px',
              fontSize: 16, cursor: 'pointer', color: '#14532d',
            }}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {open && (
        <div style={{
          background: 'rgba(240,253,244,0.97)',
          backdropFilter: 'blur(12px)',
          padding: '8px 24px 16px',
          borderTop: '1px solid rgba(34,197,94,0.15)',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 0', textDecoration: 'none',
                fontSize: 14, fontWeight: 600,
                color: location.pathname === link.path
                  ? '#16a34a' : '#166534',
                borderBottom: '1px solid rgba(34,197,94,0.1)',
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </nav>
  );
}