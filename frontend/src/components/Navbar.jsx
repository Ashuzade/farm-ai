import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logoutUser } from '../services/api';
import { clearAuth } from '../services/auth';
import toast from 'react-hot-toast';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'mr', label: 'म'  },
];

export default function Navbar({ lang, setLang, t, user, onLogout }) {
  const location = useLocation();
  const [open,        setOpen]        = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = [
  { path: '/',           icon: '🏠', label: t.nav.home       },
  { path: '/crop',       icon: '🌱', label: t.nav.crop       },
  { path: '/disease',    icon: '🍃', label: t.nav.disease    },
  { path: '/weather',    icon: '🌤️', label: t.nav.weather    },
  { path: '/irrigation', icon: '💧', label: t.nav.irrigation },
  ...(user?.role === 'admin' ? [{ path: '/admin', icon: '⚙️', label: 'Admin' }] : []),
];

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    clearAuth();
    toast.success('Logged out successfully');
    onLogout();
    setProfileOpen(false);
  };

  const getRoleColor = (role) => {
    return role === 'agronomist'
      ? { bg: 'rgba(59,130,246,0.15)', color: '#1d4ed8', border: 'rgba(59,130,246,0.3)' }
      : { bg: 'rgba(34,197,94,0.15)',  color: '#15803d', border: 'rgba(34,197,94,0.3)'  };
  };

  const roleStyle = user ? getRoleColor(user.role) : {};

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
        <Link to="/" style={{
          display: 'flex', alignItems: 'center',
          gap: 10, textDecoration: 'none', flexShrink: 0,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg,#22c55e,#15803d)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 20,
            boxShadow: '0 2px 8px rgba(34,197,94,0.35)',
          }}>🌾</div>
          <div>
            <div style={{
              color: '#14532d', fontSize: 17, fontWeight: 900,
              letterSpacing: -0.5, lineHeight: 1.1,
            }}>FarmAI</div>
            <div style={{
              color: '#16a34a', fontSize: 9,
              fontWeight: 600, letterSpacing: 0.5,
            }}>Smart Farming Intelligence</div>
          </div>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}
          className="hidden md:flex">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '7px 13px', borderRadius: 20,
                  fontSize: 12.5, fontWeight: 600,
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.18s', whiteSpace: 'nowrap',
                  background: isActive
                    ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                    : 'transparent',
                  color: isActive ? '#fff' : '#166534',
                  boxShadow: isActive
                    ? '0 2px 10px rgba(34,197,94,0.35)'
                    : 'none',
                }}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* ── Right Side ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 10, flexShrink: 0,
        }}>

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
                  padding: '4px 11px', borderRadius: 15,
                  fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', border: 'none',
                  background: lang === l.code ? '#22c55e' : 'transparent',
                  color:      lang === l.code ? '#fff'    : '#16a34a',
                  boxShadow:  lang === l.code
                    ? '0 1px 6px rgba(34,197,94,0.3)'
                    : 'none',
                  transition: 'all 0.15s',
                }}
              >{l.label}</button>
            ))}
          </div>

          {/* ── User Profile Dropdown ── */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.7)',
                  border: '1.5px solid rgba(34,197,94,0.2)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#22c55e,#15803d)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff', fontSize: 12, fontWeight: 800,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: 'left' }}
                  className="hidden md:block">
                  <div style={{
                    color: '#14532d', fontSize: 12,
                    fontWeight: 700, lineHeight: 1.2,
                  }}>
                    {user.name.split(' ')[0]}
                  </div>
                  <div style={{
                    fontSize: 9, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: 0.5,
                    color: roleStyle.color,
                  }}>
                    {user.role}
                  </div>
                </div>
                <span style={{ color: '#4a8a4a', fontSize: 10 }}>▼</span>
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0,
                  width: 220, zIndex: 100,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(34,197,94,0.2)',
                  borderRadius: 14,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                }}>
                  {/* Profile header */}
                  <div style={{
                    padding: '14px 16px',
                    background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
                    borderBottom: '1px solid rgba(34,197,94,0.15)',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#22c55e,#15803d)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff', fontSize: 18, fontWeight: 800,
                      marginBottom: 8,
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{
                      color: '#14532d', fontSize: 13,
                      fontWeight: 800, marginBottom: 2,
                    }}>{user.name}</div>
                    <div style={{
                      color: '#4a8a4a', fontSize: 11, marginBottom: 6,
                    }}>{user.email}</div>
                    <div style={{
                      display: 'inline-block',
                      padding: '2px 10px', borderRadius: 10,
                      background: roleStyle.bg,
                      border: `1px solid ${roleStyle.border}`,
                      color: roleStyle.color,
                      fontSize: 10, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>
                      {user.role === 'agronomist' ? '🔬' : '👨‍🌾'} {user.role}
                    </div>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: '8px 0' }}>
                    {[
                      { icon: '🏠', label: 'Dashboard',   path: '/'    },
                      { icon: '🌱', label: 'Crop Advisor', path: '/crop' },
                    ].map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 16px', textDecoration: 'none',
                          color: '#14532d', fontSize: 13, fontWeight: 500,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(34,197,94,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}

                    <div style={{
                      height: 1, background: 'rgba(34,197,94,0.15)',
                      margin: '6px 0',
                    }}/>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', padding: '9px 16px',
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'none', border: 'none',
                        color: '#dc2626', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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
          >{open ? '✕' : '☰'}</button>
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

          {/* Mobile logout */}
          {user && (
            <button
              onClick={handleLogout}
              style={{
                marginTop: 8, padding: '10px 0',
                background: 'none', border: 'none',
                color: '#dc2626', fontSize: 14,
                fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}