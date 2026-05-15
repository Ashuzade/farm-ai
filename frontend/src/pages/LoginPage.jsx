import { useState } from 'react';
import { loginUser } from '../services/api';
import { saveAuth } from '../services/auth';
import toast from 'react-hot-toast';

export default function LoginPage({ onLogin }) {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(form);
      saveAuth(data.access_token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      onLogin(data.user);
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #d4f5d4 0%, #a8e6a8 30%, #6dcf6d 65%, #3ab83a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>

      {/* Decorations */}
      <div style={{
        position: 'fixed', top: -40, right: -40,
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(255,220,50,0.3)',
        boxShadow: '0 0 80px rgba(255,200,0,0.25)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'fixed', bottom: -60, left: -60,
        width: 250, height: 250, borderRadius: '50%',
        background: 'rgba(34,197,94,0.2)',
        pointerEvents: 'none',
      }}/>

      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg,#22c55e,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 14px',
            boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
          }}>🌾</div>
          <h1 style={{
            color: '#14532d', fontSize: 30, fontWeight: 900,
            margin: '0 0 4px', letterSpacing: -0.5,
          }}>FarmAI</h1>
          <p style={{ color: '#4a8a4a', fontSize: 13, margin: 0 }}>
            Smart Farming Intelligence
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(255,255,255,0.85)',
          borderRadius: 20,
          padding: '28px 28px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{
            color: '#14532d', fontSize: 20, fontWeight: 800,
            margin: '0 0 6px',
          }}>Welcome Back 👋</h2>
          <p style={{ color: '#4a8a4a', fontSize: 12, margin: '0 0 22px' }}>
            Login to access your FarmAI dashboard
          </p>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: 'block', color: '#16a34a', fontSize: 11,
                fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: 0.7, marginBottom: 6,
              }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'rgba(255,255,255,0.75)',
                  border: '1.5px solid rgba(34,197,94,0.2)',
                  borderRadius: 10, fontSize: 14, color: '#14532d',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#22c55e'}
                onBlur={e => e.target.style.borderColor = 'rgba(34,197,94,0.2)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', color: '#16a34a', fontSize: 11,
                fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: 0.7, marginBottom: 6,
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{
                    width: '100%', padding: '10px 42px 10px 14px',
                    background: 'rgba(255,255,255,0.75)',
                    border: '1.5px solid rgba(34,197,94,0.2)',
                    borderRadius: 10, fontSize: 14, color: '#14532d',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e => e.target.style.borderColor = 'rgba(34,197,94,0.2)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 16, color: '#4a8a4a',
                  }}
                >{showPass ? '︶' : '👁️'}</button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading
                  ? 'rgba(34,197,94,0.4)'
                  : 'linear-gradient(135deg,#22c55e,#15803d)',
                border: 'none', borderRadius: 12,
                color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(34,197,94,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '⏳ Logging in...' : '🌾 Login to FarmAI'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            margin: '18px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(34,197,94,0.2)' }}/>
            <span style={{ color: '#4a8a4a', fontSize: 12 }}>New to FarmAI?</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(34,197,94,0.2)' }}/>
          </div>

          {/* Register link */}
          <button
            onClick={() => onLogin('goto-register')}
            style={{
              width: '100%', padding: '11px',
              background: 'rgba(34,197,94,0.08)',
              border: '1.5px solid rgba(34,197,94,0.25)',
              borderRadius: 12, color: '#16a34a',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📝 Create New Account
          </button>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center', color: '#4a8a4a',
          fontSize: 11, marginTop: 16,
        }}>
          FarmAI — Smart Farming Intelligence System
        </p>
      </div>
    </div>
  );
}