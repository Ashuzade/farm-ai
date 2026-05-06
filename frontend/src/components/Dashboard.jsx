import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkHealth } from '../services/api';

const features = [
  {
    icon: '🌱',
    title: 'Crop Advisor',
    desc: 'AI crop recommendation from soil nutrients & weather conditions.',
    path: '/crop',
    bg: 'linear-gradient(135deg,#d4f5d4,#6dcf6d)',
    border: 'rgba(34,197,94,0.3)',
    btn: 'linear-gradient(135deg,#22c55e,#15803d)',
    shadow: 'rgba(34,197,94,0.3)',
    tag: '#14532d',
  },
  {
    icon: '🍃',
    title: 'Disease Detector',
    desc: 'Upload a leaf photo for instant plant disease diagnosis.',
    path: '/disease',
    bg: 'linear-gradient(135deg,#fff0e0,#ffb570)',
    border: 'rgba(249,115,22,0.3)',
    btn: 'linear-gradient(135deg,#f97316,#c2410c)',
    shadow: 'rgba(249,115,22,0.3)',
    tag: '#7c2d12',
  },
  {
    icon: '🌤️',
    title: 'Weather Intel',
    desc: 'Real-time weather data with AI-powered farming alerts.',
    path: '/weather',
    bg: 'linear-gradient(135deg,#e0f4ff,#70c4ff)',
    border: 'rgba(56,189,248,0.3)',
    btn: 'linear-gradient(135deg,#38bdf8,#0284c7)',
    shadow: 'rgba(56,189,248,0.3)',
    tag: '#0c4a6e',
  },
  {
    icon: '💧',
    title: 'Irrigation Planner',
    desc: 'AI water requirement & weekly irrigation schedule.',
    path: '/irrigation',
    bg: 'linear-gradient(135deg,#ede9fe,#a78bfa)',
    border: 'rgba(139,92,246,0.3)',
    btn: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    shadow: 'rgba(139,92,246,0.3)',
    tag: '#3b0764',
  },
];

const stats = [
  { value: '22',  label: 'Crops Supported',   icon: '🌾' },
  { value: '38',  label: 'Diseases Detected',  icon: '🔬' },
  { value: '99%', label: 'Model Accuracy',     icon: '🎯' },
  { value: '3',   label: 'Languages',          icon: '🌍' },
];

export default function Dashboard({ t }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    checkHealth()
      .then(() => setStatus('online'))
      .catch(() => setStatus('offline'));
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

      {/* Hero section */}
      <div style={{ textAlign: 'center', marginBottom: 44 }}>

        {/* Logo badge */}
        <div style={{
          width: 80, height: 80, borderRadius: 22,
          background: 'linear-gradient(135deg,#22c55e,#15803d)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, margin: '0 auto 16px',
          boxShadow: '0 8px 32px rgba(34,197,94,0.35)',
        }}>🌾</div>

        <h1 style={{
          color: '#14532d', fontSize: 40, fontWeight: 900,
          margin: '0 0 8px', letterSpacing: -1.5,
        }}>
          {t.app_name}
        </h1>
        <p style={{ color: '#4a8a4a', fontSize: 15, margin: '0 0 20px' }}>
          {t.tagline}
        </p>

        {/* Server status */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 20px', borderRadius: 24,
          background: 'rgba(255,255,255,0.7)',
          border: '1.5px solid rgba(34,197,94,0.25)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 12px rgba(34,197,94,0.1)',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            display: 'inline-block',
            background:
              status === 'online'   ? '#22c55e' :
              status === 'offline'  ? '#ef4444' : '#fbbf24',
            boxShadow:
              status === 'online'  ? '0 0 8px #22c55e' : 'none',
          }}/>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color:
              status === 'online'  ? '#16a34a' :
              status === 'offline' ? '#dc2626' : '#d97706',
          }}>
            Backend {status === 'checking' ? 'connecting...' : status}
          </span>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        {features.map(f => (
          <div
            key={f.path}
            style={{
              background: f.bg,
              border: `1.5px solid ${f.border}`,
              borderRadius: 20, padding: 22,
              boxShadow: `0 4px 20px ${f.shadow}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = `0 12px 30px ${f.shadow}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 20px ${f.shadow}`;
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>{f.icon}</div>
            <h3 style={{
              color: f.tag, fontSize: 15, fontWeight: 800,
              margin: '0 0 6px',
            }}>{f.title}</h3>
            <p style={{
              color: f.tag, fontSize: 12, margin: '0 0 16px',
              lineHeight: 1.55, opacity: 0.75,
            }}>{f.desc}</p>
            <Link
              to={f.path}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '8px 16px',
                background: f.btn,
                borderRadius: 10, color: '#fff',
                fontSize: 12, fontWeight: 700,
                textDecoration: 'none',
                boxShadow: `0 3px 10px ${f.shadow}`,
                transition: 'all 0.18s',
              }}
            >
              Get Started →
            </Link>
          </div>
        ))}
      </div>

      {/* ── Stats Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
      }}>
        {stats.map(s => (
          <div
            key={s.label}
            style={{
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255,255,255,0.85)',
              borderRadius: 16, padding: '18px 12px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ color: '#14532d', fontSize: 26, fontWeight: 900 }}>
              {s.value}
            </div>
            <div style={{ color: '#4a8a4a', fontSize: 11, marginTop: 3 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer tagline ── */}
      <div style={{
        textAlign: 'center', marginTop: 36,
        color: '#4a8a4a', fontSize: 12,
      }}>
       
      </div>
    </div>
  );
}