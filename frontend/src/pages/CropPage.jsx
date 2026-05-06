import { useState } from 'react';
import { predictCropExplained } from '../services/api';
import toast from 'react-hot-toast';
import {
  RadarChart, Radar, PolarGrid,
  PolarAngleAxis, ResponsiveContainer
} from 'recharts';
import WeatherWidget from '../components/WeatherWidget';

const defaultValues = {
  nitrogen:    90,
  phosphorus:  42,
  potassium:   43,
  temperature: 20.5,
  humidity:    82,
  ph:          6.5,
  rainfall:    202.9,
};

const fieldConfig = [
  { key:'nitrogen',   label:'Nitrogen',   min:0, max:140, step:1,   unit:'mg/kg' },
  { key:'phosphorus', label:'Phosphorus', min:0, max:145, step:1,   unit:'mg/kg' },
  { key:'potassium',  label:'Potassium',  min:0, max:205, step:1,   unit:'mg/kg' },
  { key:'ph',         label:'Soil pH',    min:0, max:14,  step:0.1, unit:'pH'    },
];

const sliderConfig = [
  { key:'temperature', label:'Temperature', min:0, max:50,  step:0.1, unit:'°C' },
  { key:'humidity',    label:'Humidity',    min:0, max:100, step:0.1, unit:'%'  },
  { key:'rainfall',    label:'Rainfall',    min:0, max:300, step:0.1, unit:'mm' },
];

export default function CropPage({ t }) {
  const [form,    setForm]    = useState(defaultValues);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) =>
    setForm(prev => ({ ...prev, [key]: parseFloat(value) }));

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await predictCropExplained(form);
      setResult(data);
      toast.success(`Recommended: ${data.crop.toUpperCase()}`);
    } catch {
      toast.error(t.errors.prediction_failed);
    } finally {
      setLoading(false);
    }
  };

  // Safe radar data
  const radarData =
    result?.explanation?.feature_importance &&
    typeof result.explanation.feature_importance === 'object'
      ? Object.entries(result.explanation.feature_importance).map(([key, val]) => ({
          feature: key,
          value: Math.abs(val) * 100,
        }))
      : [];

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 20px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <div style={{
            width:40, height:40, borderRadius:12,
            background:'linear-gradient(135deg,#22c55e,#15803d)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:20, boxShadow:'0 3px 10px rgba(34,197,94,0.35)',
          }}>🌱</div>
          <h1 style={{ color:'#14532d', fontSize:26, fontWeight:900, margin:0 }}>
            {t.crop.title}
          </h1>
        </div>
        <p style={{ color:'#4a8a4a', fontSize:13, margin:0 }}>
          {t.crop.subtitle}
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* ── Left: Input Form ── */}
        <div className="glass" style={{ padding:22 }}>

          {/* Weather widget */}
          <WeatherWidget
            onPrefill={prefill =>
              setForm(prev => ({ ...prev, ...prefill }))
            }
          />

          <div style={{
            borderTop:'1.5px solid rgba(34,197,94,0.15)',
            paddingTop:16, marginBottom:16,
          }}>
            {/* Soil inputs */}
            <div style={{
              color:'#14532d', fontSize:12, fontWeight:800,
              textTransform:'uppercase', letterSpacing:0.7, marginBottom:12,
            }}>
              🧪 Soil Parameters
            </div>

            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr',
              gap:10, marginBottom:14,
            }}>
              {fieldConfig.map(({ key, label, unit }) => (
                <div key={key}>
                  <div style={{
                    color:'#16a34a', fontSize:10, fontWeight:700,
                    textTransform:'uppercase', letterSpacing:0.7, marginBottom:4,
                  }}>{label}</div>
                  <div style={{ position:'relative' }}>
                    <input
                      type="number"
                      className="farm-input farm-input-crop"
                      value={form[key]}
                      onChange={e => handleChange(key, e.target.value)}
                    />
                    <span style={{
                      position:'absolute', right:10, top:'50%',
                      transform:'translateY(-50%)',
                      color:'#86efac', fontSize:10, fontWeight:600,
                      pointerEvents:'none',
                    }}>{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sliders */}
            <div style={{
              color:'#14532d', fontSize:12, fontWeight:800,
              textTransform:'uppercase', letterSpacing:0.7, marginBottom:10,
            }}>
              🌤️ Weather Conditions
            </div>
            {sliderConfig.map(({ key, label, min, max, step, unit }) => (
              <div key={key} style={{ marginBottom:10 }}>
                <div style={{
                  display:'flex', justifyContent:'space-between', marginBottom:4,
                }}>
                  <span style={{ color:'#2d7a2d', fontSize:11, fontWeight:600 }}>
                    {label}
                  </span>
                  <span style={{ color:'#16a34a', fontSize:11, fontWeight:800 }}>
                    {form[key]} {unit}
                  </span>
                </div>
                <input
                  type="range"
                  className="slider-crop"
                  min={min} max={max} step={step}
                  value={form[key]}
                  onChange={e => handleChange(key, e.target.value)}
                />
                <div style={{
                  display:'flex', justifyContent:'space-between', marginTop:2,
                }}>
                  <span style={{ color:'#86efac', fontSize:9 }}>{min}</span>
                  <span style={{ color:'#86efac', fontSize:9 }}>{max}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            className="farm-btn farm-btn-crop"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <><span>⏳</span> {t.crop.loading}</>
              : `🌾 ${t.crop.predict}`
            }
          </button>
        </div>

        {/* ── Right: Result Panel ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {result ? (
            <>
              {/* Crop result card */}
              <div className="result-crop glass">
                <div style={{
                  display:'inline-block', padding:'2px 10px',
                  borderRadius:10, fontSize:9, fontWeight:800,
                  textTransform:'uppercase', letterSpacing:1,
                  background:'rgba(34,197,94,0.2)', color:'#16a34a',
                  marginBottom:8,
                }}>✅ AI Recommendation</div>

                <div style={{
                  color:'#14532d', fontSize:32, fontWeight:900,
                  textTransform:'capitalize', marginBottom:4,
                }}>
                  {result.crop}
                </div>

                <div style={{ color:'#4a8a4a', fontSize:11 }}>
                  {(result.confidence * 100).toFixed(1)}% confidence
                </div>

                <div className="conf-track">
                  <div
                    className="conf-fill"
                    style={{ width:`${result.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Explanation card */}
              {result.explanation && (
                <div className="glass" style={{ padding:18 }}>
                  <div style={{
                    color:'#14532d', fontSize:12,
                    fontWeight:800, marginBottom:4,
                  }}>🧠 Why this crop?</div>

                  <div style={{
                    color:'#4a8a4a', fontSize:11, marginBottom:12,
                  }}>
                    {result.explanation.interpretation ||
                      'Based on your soil and weather data.'}
                  </div>

                  {/* Radar chart */}
                  {radarData.length > 0 && (
                    <ResponsiveContainer width="100%" height={180}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(34,197,94,0.2)" />
                        <PolarAngleAxis
                          dataKey="feature"
                          tick={{ fontSize:10, fill:'#2d7a2d' }}
                        />
                        <Radar
                          dataKey="value"
                          stroke="#16a34a"
                          fill="#22c55e"
                          fillOpacity={0.25}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}

                  {/* Feature importance bars */}
                  {result.explanation.feature_importance &&
                    typeof result.explanation.feature_importance === 'object' && (
                    <div style={{ marginTop:8 }}>
                      {Object.entries(result.explanation.feature_importance)
                        .slice(0, 4)
                        .map(([key, val]) => (
                          <div key={key} style={{
                            display:'flex', alignItems:'center',
                            gap:8, marginBottom:6,
                          }}>
                            <span style={{
                              color:'#4a8a4a', fontSize:10,
                              textTransform:'capitalize',
                              width:80, flexShrink:0,
                            }}>{key}</span>
                            <div style={{
                              flex:1,
                              background:'rgba(34,197,94,0.1)',
                              borderRadius:3, height:5, overflow:'hidden',
                            }}>
                              <div style={{
                                width:`${Math.min(Math.abs(val) * 500, 100)}%`,
                                height:5, borderRadius:3,
                                background:'linear-gradient(90deg,#4ade80,#16a34a)',
                              }}/>
                            </div>
                            <span style={{
                              color:'#16a34a', fontSize:10, fontWeight:700,
                              width:44, textAlign:'right', flexShrink:0,
                            }}>
                              {val > 0 ? '+' : ''}{val.toFixed(3)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="glass" style={{
              padding:40, textAlign:'center',
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              minHeight:300,
            }}>
              <div style={{ fontSize:52, marginBottom:12 }}>🌱</div>
              <div style={{ color:'#4a8a4a', fontSize:13 }}>
                Adjust the parameters and click
              </div>
              <div style={{ color:'#16a34a', fontSize:13, fontWeight:700 }}>
                {t.crop.predict}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}