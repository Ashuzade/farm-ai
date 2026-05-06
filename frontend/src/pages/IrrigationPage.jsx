import { useState, useEffect } from 'react';
import { predictIrrigation, getIrrigationOptions } from '../services/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const defaultForm = {
  crop:           'rice',
  soil_type:      'loamy',
  growth_stage:   'flowering',
  temperature:    32.0,
  humidity:       70.0,
  rainfall:       5.0,
  wind_speed:     3.5,
  sunshine_hours: 8.0,
};

const stageOrder = ['seedling','vegetative','flowering','maturity','harvest'];
const stageIcons = { seedling:'🌱', vegetative:'🌿', flowering:'🌸', maturity:'🌾', harvest:'✂️' };
const soilIcons  = { sandy:'🏜️', loamy:'🟤', black:'⚫', red:'🔴', clayey:'🧱' };

const getUrgency = (net) => {
  if (net >= 4) return { label:'🔴 High Need',     color:'#dc2626', bg:'rgba(239,68,68,0.1)',  border:'rgba(239,68,68,0.3)'  };
  if (net >= 2) return { label:'🟡 Moderate Need', color:'#d97706', bg:'rgba(251,191,36,0.1)', border:'rgba(251,191,36,0.3)' };
  return           { label:'🟢 Low Need',       color:'#16a34a', bg:'rgba(34,197,94,0.1)',  border:'rgba(34,197,94,0.3)'  };
};

export default function IrrigationPage({ t }) {
  const [form,    setForm]    = useState(defaultForm);
  const [options, setOptions] = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getIrrigationOptions()
      .then(data => setOptions(data))
      .catch(() => toast.error('Failed to load options'));
  }, []);

  const handleChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: ['temperature','humidity','rainfall','wind_speed','sunshine_hours']
        .includes(key) ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await predictIrrigation(form);
      setResult(data);
      toast.success('Irrigation plan generated!');
    } catch (err) {
      toast.error(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  // Weekly chart data — only computed when result exists
  const weeklyData = result
    ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({
        day,
        water:
          result.frequency === 'Daily'
            ? result.net_irrigation
            : result.frequency === 'Every 2 days'
            ? (i % 2 === 0 ? result.net_irrigation * 2 : 0)
            : (i % 3 === 0 ? result.net_irrigation * 3 : 0),
      }))
    : [];

  // Safe slider config — uses t only if available
  const sliderConfig = [
    { key:'temperature',    label: t?.irrigation?.temperature || 'Temperature', min:10, max:45, step:0.5, unit:'°C'  },
    { key:'humidity',       label: t?.irrigation?.humidity    || 'Humidity',    min:20, max:95, step:1,   unit:'%'   },
    { key:'rainfall',       label: t?.irrigation?.rainfall    || 'Rainfall',    min:0,  max:25, step:0.5, unit:'mm'  },
    { key:'wind_speed',     label: t?.irrigation?.wind        || 'Wind Speed',  min:0,  max:15, step:0.5, unit:'m/s' },
    { key:'sunshine_hours', label: t?.irrigation?.sunshine    || 'Sunshine',    min:4,  max:12, step:0.5, unit:'hrs' },
  ];

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 20px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <div style={{
            width:40, height:40, borderRadius:12,
            background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:20, boxShadow:'0 3px 10px rgba(139,92,246,0.35)',
          }}>💧</div>
          <h1 style={{ color:'#3b0764', fontSize:26, fontWeight:900, margin:0 }}>
            {t?.irrigation?.title || 'Irrigation Planner'}
          </h1>
        </div>
        <p style={{ color:'#6d28d9', fontSize:13, margin:0 }}>
          {t?.irrigation?.subtitle || 'AI-powered water requirement based on FAO standards'}
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* ── Left: Input Form ── */}
        <div className="glass" style={{ padding:22 }}>

          {/* Crop selector */}
          <div style={{ marginBottom:16 }}>
            <div style={{
              color:'#4c1d95', fontSize:11, fontWeight:800,
              textTransform:'uppercase', letterSpacing:0.7, marginBottom:7,
            }}>
              🌾 {t?.irrigation?.crop_label || 'Crop Type'}
            </div>
            <select
              value={form.crop}
              onChange={e => handleChange('crop', e.target.value)}
              className="farm-input farm-input-irrigation"
              style={{ cursor:'pointer' }}
            >
              {(options?.crops || [form.crop]).map(c => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Soil type */}
          <div style={{ marginBottom:16 }}>
            <div style={{
              color:'#4c1d95', fontSize:11, fontWeight:800,
              textTransform:'uppercase', letterSpacing:0.7, marginBottom:7,
            }}>
              🪨 {t?.irrigation?.soil_label || 'Soil Type'}
            </div>
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:5,
            }}>
              {(options?.soils || [form.soil_type]).map(soil => (
                <button
                  key={soil}
                  onClick={() => handleChange('soil_type', soil)}
                  style={{
                    padding:'8px 4px', borderRadius:10, cursor:'pointer',
                    border: form.soil_type === soil
                      ? '2px solid #8b5cf6'
                      : '1.5px solid rgba(139,92,246,0.2)',
                    background: form.soil_type === soil
                      ? 'rgba(139,92,246,0.15)'
                      : 'rgba(255,255,255,0.5)',
                    transition:'all 0.15s',
                    display:'flex', flexDirection:'column',
                    alignItems:'center', gap:3,
                  }}
                >
                  <span style={{ fontSize:16 }}>{soilIcons[soil]}</span>
                  <span style={{
                    fontSize:9, fontWeight:700,
                    color: form.soil_type === soil ? '#6d28d9' : '#7c3aed',
                  }}>{soil}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Growth stage */}
          <div style={{ marginBottom:16 }}>
            <div style={{
              color:'#4c1d95', fontSize:11, fontWeight:800,
              textTransform:'uppercase', letterSpacing:0.7, marginBottom:7,
            }}>
              🌱 {t?.irrigation?.stage_label || 'Growth Stage'}
            </div>
            <div style={{ display:'flex', gap:4 }}>
              {stageOrder.map(stage => (
                <button
                  key={stage}
                  onClick={() => handleChange('growth_stage', stage)}
                  style={{
                    flex:1, padding:'8px 2px', borderRadius:10,
                    border:'none', cursor:'pointer', transition:'all 0.15s',
                    background: form.growth_stage === stage
                      ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)'
                      : 'rgba(139,92,246,0.1)',
                    display:'flex', flexDirection:'column',
                    alignItems:'center', gap:3,
                  }}
                >
                  <span style={{ fontSize:14 }}>{stageIcons[stage]}</span>
                  <span style={{
                    fontSize:8, fontWeight:700,
                    color: form.growth_stage === stage ? '#fff' : '#6d28d9',
                  }}>{stage}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weather sliders */}
          <div style={{
            color:'#4c1d95', fontSize:11, fontWeight:800,
            textTransform:'uppercase', letterSpacing:0.7, marginBottom:10,
          }}>
            🌤️ {t?.irrigation?.weather_label || 'Weather Conditions'}
          </div>

          {sliderConfig.map(({ key, label, min, max, step, unit }) => (
            <div key={key} style={{ marginBottom:9 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ color:'#5b21b6', fontSize:10, fontWeight:600 }}>
                  {label}
                </span>
                <span style={{ color:'#7c3aed', fontSize:10, fontWeight:800 }}>
                  {form[key]} {unit}
                </span>
              </div>
              <input
                type="range"
                className="slider-irrigation"
                min={min} max={max} step={step}
                value={form[key]}
                onChange={e => handleChange(key, e.target.value)}
              />
            </div>
          ))}

          <button
            className="farm-btn farm-btn-irrigation"
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop:12 }}
          >
            {loading
              ? <><span>⏳</span> {t?.irrigation?.loading || 'Calculating...'}</>
              : `💧 ${t?.irrigation?.predict || 'Generate Irrigation Plan'}`
            }
          </button>
        </div>

        {/* ── Right: Result Panel ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {result ? (
            <>
              {/* Main result */}
              {(() => {
                const urgency = getUrgency(result.net_irrigation);
                return (
                  <div className="glass" style={{
                    padding:20,
                    background: urgency.bg,
                    border:`1.5px solid ${urgency.border}`,
                  }}>
                    <div style={{
                      display:'flex', justifyContent:'space-between',
                      alignItems:'flex-start', marginBottom:12,
                    }}>
                      <div>
                        <div style={{
                          color:'#4c1d95', fontSize:11, fontWeight:700,
                          textTransform:'uppercase', letterSpacing:0.5, marginBottom:4,
                        }}>
                          {t?.irrigation?.daily_need || 'Daily Water Requirement'}
                        </div>
                        <div style={{
                          color:'#3b0764', fontSize:36,
                          fontWeight:900, lineHeight:1,
                        }}>
                          {result.water_requirement}
                          <span style={{ fontSize:14, marginLeft:4 }}>mm/day</span>
                        </div>
                      </div>
                      <div style={{
                        padding:'4px 12px', borderRadius:12,
                        background: urgency.bg,
                        border:`1px solid ${urgency.border}`,
                        color: urgency.color,
                        fontSize:10, fontWeight:800,
                      }}>
                        {urgency.label}
                      </div>
                    </div>

                    <div style={{
                      background:'rgba(255,255,255,0.55)',
                      borderRadius:10, padding:'10px 14px',
                    }}>
                      <div style={{ color:'#5b21b6', fontSize:10, marginBottom:2 }}>
                        {t?.irrigation?.net_irr || 'After accounting for rainfall'}:
                      </div>
                      <div style={{ color:'#3b0764', fontSize:15, fontWeight:800 }}>
                        {result.net_irrigation} mm/day
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Schedule cards */}
              <div style={{
                display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10,
              }}>
                {[
                  { icon:'📅', label: t?.irrigation?.frequency  || 'Frequency',    value: result.frequency              },
                  { icon:'🗓️', label: t?.irrigation?.weekly     || 'Weekly Total', value: `${result.weekly_total}mm`    },
                  { icon:'⏱️', label: t?.irrigation?.daily_time || 'Daily Time',   value: `${result.daily_minutes} min` },
                ].map(card => (
                  <div key={card.label} className="glass" style={{
                    padding:'14px 10px', textAlign:'center',
                    background:'rgba(139,92,246,0.08)',
                    border:'1.5px solid rgba(139,92,246,0.2)',
                  }}>
                    <div style={{ fontSize:22, marginBottom:5 }}>{card.icon}</div>
                    <div style={{ color:'#3b0764', fontSize:13, fontWeight:900 }}>
                      {card.value}
                    </div>
                    <div style={{ color:'#7c3aed', fontSize:10, marginTop:2 }}>
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly chart */}
              <div className="glass" style={{ padding:18 }}>
                <div style={{
                  color:'#3b0764', fontSize:12, fontWeight:800, marginBottom:12,
                }}>
                  📊 {t?.irrigation?.schedule || 'Weekly Irrigation Schedule'}
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={weeklyData}>
                    <defs>
                      <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa"/>
                        <stop offset="100%" stopColor="#7c3aed"/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize:10, fill:'#6d28d9' }}
                    />
                    <YAxis
                      tick={{ fontSize:10, fill:'#6d28d9' }}
                      tickFormatter={v => `${v}mm`}
                    />
                    <Tooltip
                      formatter={v => [`${v} mm`,'Water']}
                      contentStyle={{
                        background:'rgba(255,255,255,0.9)',
                        border:'1px solid rgba(139,92,246,0.3)',
                        borderRadius:8, fontSize:11,
                      }}
                    />
                    <Bar dataKey="water" radius={[5,5,0,0]}>
                      {weeklyData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.water > 0 ? 'url(#purpleGrad)' : 'rgba(139,92,246,0.1)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tips */}
              <div className="glass" style={{
                padding:16,
                background:'rgba(139,92,246,0.08)',
                border:'1.5px solid rgba(139,92,246,0.2)',
              }}>
                <div style={{
                  color:'#4c1d95', fontSize:11, fontWeight:800, marginBottom:8,
                }}>
                  💡 {t?.irrigation?.tips_title || 'Water Saving Tips'}
                </div>
                {/* Safe tips — no reference to result outside result block */}
                {(t?.irrigation?.tips || [
                  'Water early morning to reduce evaporation loss',
                  'Use drip irrigation for 30–50% water savings',
                  'Check soil moisture before each irrigation cycle',
                  'Maintain a consistent watering schedule for best yield',
                ]).map((tip, i) => (
                  <div key={i} style={{
                    display:'flex', gap:7, alignItems:'flex-start',
                    color:'#5b21b6', fontSize:11, lineHeight:1.6,
                  }}>
                    <span style={{ color:'#8b5cf6', fontWeight:700 }}>•</span>
                    {tip}
                  </div>
                ))}
                {/* High demand tip — safely inside result block */}
                {result.net_irrigation >= 4 && (
                  <div style={{
                    display:'flex', gap:7, alignItems:'flex-start',
                    color:'#dc2626', fontSize:11, lineHeight:1.6,
                    marginTop:4,
                  }}>
                    <span style={{ fontWeight:700 }}>⚠️</span>
                    High demand — consider mulching to retain moisture
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── Empty State ── */
            <div className="glass" style={{
              padding:40, textAlign:'center',
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              minHeight:300,
            }}>
              <div style={{ fontSize:52, marginBottom:12 }}>💧</div>
              <div style={{ color:'#6d28d9', fontSize:13, marginBottom:4 }}>
                {t?.irrigation?.empty_title || 'Select crop, soil & growth stage'}
              </div>
              <div style={{ color:'#7c3aed', fontSize:13, fontWeight:700 }}>
                {t?.irrigation?.empty_sub || 'then click Generate Irrigation Plan'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}