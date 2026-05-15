import { useState } from 'react';
import { registerUser } from '../services/api';
import { saveAuth } from '../services/auth';
import toast from 'react-hot-toast';

const roles = [
  { value: 'farmer',     icon: '👨‍🌾', label: 'Farmer',     desc: 'I grow crops and need farming advice' },
  { value: 'agronomist', icon: '🔬', label: 'Agronomist', desc: 'I provide expert agricultural guidance' },
];

export default function RegisterPage({ onRegister, onBackToLogin }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'farmer',
  });
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await registerUser({
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role,
      });
      saveAuth(data.access_token, data.user);
      toast.success(`Welcome to FarmAI, ${data.user.name}!`);
      onRegister(data.user);
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.75)',
    border: '1.5px solid rgba(34,197,94,0.2)',
    borderRadius: 10, fontSize: 14, color: '#14532d',
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', color: '#16a34a', fontSize: 11,
    fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: 0.7, marginBottom: 6,
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
        position: 'fixed', top: -40, right: -40, width: 200, height: 200,
        borderRadius: '50%', background: 'rgba(255,220,50,0.3)',
        boxShadow: '0 0 80px rgba(255,200,0,0.25)', pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'fixed', bottom: -60, left: -60, width: 250, height: 250,
        borderRadius: '50%', background: 'rgba(34,197,94,0.2)', pointerEvents: 'none',
      }}/>

      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg,#22c55e,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 12px',
            boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
          }}>🌾</div>
          <h1 style={{ color: '#14532d', fontSize: 26, fontWeight: 900, margin: 0 }}>
            Join FarmAI
          </h1>
          <p style={{ color: '#4a8a4a', fontSize: 12, margin: '4px 0 0' }}>
            Create your farming intelligence account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(255,255,255,0.85)',
          borderRadius: 20, padding: '24px 26px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}>

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div style={{ marginBottom: 13 }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text" name="name"
                value={form.name} onChange={handleChange}
                placeholder="e.g. Aishwarya Zade"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor='#22c55e'}
                onBlur={e => e.target.style.borderColor='rgba(34,197,94,0.2)'}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 13 }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor='#22c55e'}
                onBlur={e => e.target.style.borderColor='rgba(34,197,94,0.2)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 13 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min 6 characters"
                  style={{ ...inputStyle, paddingRight: 42 }}
                  onFocus={e => e.target.style.borderColor='#22c55e'}
                  onBlur={e => e.target.style.borderColor='rgba(34,197,94,0.2)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 15, color: '#4a8a4a',
                  }}
                >{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password" name="confirmPassword"
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Re-enter your password"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor='#22c55e'}
                onBlur={e => e.target.style.borderColor='rgba(34,197,94,0.2)'}
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p style={{ color: '#dc2626', fontSize: 11, margin: '4px 0 0' }}>
                  ❌ Passwords do not match
                </p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p style={{ color: '#16a34a', fontSize: 11, margin: '4px 0 0' }}>
                  ✅ Passwords match
                </p>
              )}
            </div>

            {/* Role selection */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>I am a</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {roles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                    style={{
                      padding: '10px 8px',
                      border: form.role === r.value
                        ? '2px solid #22c55e'
                        : '1.5px solid rgba(34,197,94,0.2)',
                      background: form.role === r.value
                        ? 'rgba(34,197,94,0.12)'
                        : 'rgba(255,255,255,0.5)',
                      borderRadius: 10, cursor: 'pointer',
                      transition: 'all 0.15s', textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{r.icon}</div>
                    <div style={{
                      color: form.role === r.value ? '#14532d' : '#4a8a4a',
                      fontSize: 12, fontWeight: 700,
                    }}>{r.label}</div>
                    <div style={{ color: '#6a8a6a', fontSize: 10, marginTop: 2 }}>
                      {r.desc}
                    </div>
                  </button>
                ))}
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
              }}
            >
              {loading ? '⏳ Creating account...' : '🌾 Create My Account'}
            </button>
          </form>

          {/* Back to login */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span style={{ color: '#4a8a4a', fontSize: 12 }}>
              Already have an account?{' '}
            </span>
            <button
              onClick={onBackToLogin}
              style={{
                background: 'none', border: 'none',
                color: '#16a34a', fontSize: 12,
                fontWeight: 700, cursor: 'pointer',
              }}
            >Login here →</button>
          </div>
        </div>

        <p style={{
          textAlign: 'center', color: '#4a8a4a',
          fontSize: 11, marginTop: 14,
        }}>
          FarmAI — Smart Farming Intelligence System
        </p>
      </div>
    </div>
  );
}