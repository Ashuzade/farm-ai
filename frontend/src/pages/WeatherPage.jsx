import { useState } from 'react';
import { getWeatherByCity, getWeatherByCoords } from '../services/api';
import toast from 'react-hot-toast';

const weatherIcons = {
  '01d':'☀️','01n':'🌙','02d':'⛅','02n':'⛅',
  '03d':'☁️','03n':'☁️','04d':'☁️','04n':'☁️',
  '09d':'🌧️','09n':'🌧️','10d':'🌦️','10n':'🌦️',
  '11d':'⛈️','11n':'⛈️','13d':'❄️','13n':'❄️','50d':'🌫️','50n':'🌫️',
};

const farmingTips = (w) => {
  const tips = [];
  if (w.temperature > 35) tips.push({ icon:'🌡️', text:'High temp — irrigate to cool soil',          color:'#dc2626' });
  if (w.temperature < 10) tips.push({ icon:'❄️', text:'Low temp — protect crops from frost',         color:'#2563eb' });
  if (w.humidity > 80)    tips.push({ icon:'💧', text:'High humidity — watch for fungal disease',    color:'#7c3aed' });
  if (w.humidity < 30)    tips.push({ icon:'🏜️', text:'Low humidity — increase irrigation frequency', color:'#d97706' });
  if (w.rainfall > 10)    tips.push({ icon:'🌧️', text:'Heavy rainfall — ensure proper drainage',     color:'#0369a1' });
  if (w.wind_speed > 10)  tips.push({ icon:'💨', text:'Strong winds — delay pesticide spraying',     color:'#6d28d9' });
  if (tips.length === 0)  tips.push({ icon:'✅', text:'Great conditions for farming today!',          color:'#16a34a' });
  return tips;
};

const popularCities = [
  'Nagpur','Pune','Mumbai','Delhi',
  'Jaipur','Lucknow','Bhopal','Hyderabad',
];

export default function WeatherPage({ t }) {
  const [city,    setCity]    = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) { toast.error('Please enter a city name'); return; }
    setLoading(true);
    setWeather(null);
    try {
      const data = await getWeatherByCity(cityName.trim());
      setWeather(data);
      toast.success(`Weather loaded for ${data.city}!`);
    } catch (err) {
      toast.error(err.message || 'City not found');
    } finally {
      setLoading(false);
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await getWeatherByCoords(
            pos.coords.latitude, pos.coords.longitude
          );
          setWeather(data);
          setCity(data.city);
          toast.success(`Weather loaded for ${data.city}!`);
        } catch { toast.error('Could not fetch weather'); }
        finally { setLoading(false); }
      },
      () => { toast.error('Location access denied'); setLoading(false); }
    );
  };

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'32px 20px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <div style={{
            width:40, height:40, borderRadius:12,
            background:'linear-gradient(135deg,#38bdf8,#0284c7)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:20, boxShadow:'0 3px 10px rgba(56,189,248,0.35)',
          }}>🌤️</div>
          <h1 style={{ color:'#0c4a6e', fontSize:26, fontWeight:900, margin:0 }}>
            {t.weather.title}
          </h1>
        </div>
        <p style={{ color:'#0369a1', fontSize:13, margin:0 }}>
           {t.weather.subtitle}
        </p>
      </div>

      {/* ── Search Box ── */}
      <div className="glass" style={{ padding:20, marginBottom:16 }}>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchWeather(city)}
            placeholder={t.weather.search_placeholder}
            className="farm-input farm-input-weather"
            style={{ flex:1 }}
          />
          <button
            onClick={() => fetchWeather(city)}
            disabled={loading}
            className="farm-btn farm-btn-weather"
            style={{ width:'auto', padding:'8px 18px' }}
          >
            {loading ? '⏳' : `🔍 ${t.weather.search_btn}`}
          </button>
          <button
            onClick={handleGPS}
            disabled={loading}
            style={{
              padding:'8px 14px', borderRadius:11, border:'none',
              background:'rgba(99,102,241,0.15)',
              color:'#4f46e5', fontSize:16, cursor:'pointer',
              fontWeight:700, flexShrink:0,
            }}
            title="Use my location"
          >📍</button>
        </div>

        {/* Popular cities */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {popularCities.map(c => (
            <button
              key={c}
              onClick={() => { setCity(c); fetchWeather(c); }}
              style={{
                padding:'4px 12px', borderRadius:14,
                background:'rgba(56,189,248,0.12)',
                border:'1px solid rgba(56,189,248,0.25)',
                color:'#0369a1', fontSize:11,
                fontWeight:600, cursor:'pointer',
                transition:'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(56,189,248,0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(56,189,248,0.12)';
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* ── Weather Result ── */}
      {weather && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Main card */}
          <div style={{
            background:'linear-gradient(135deg,#38bdf8,#0284c7)',
            borderRadius:20, padding:24,
            boxShadow:'0 8px 32px rgba(56,189,248,0.35)',
          }}>
            <div style={{
              display:'flex', justifyContent:'space-between',
              alignItems:'flex-start', marginBottom:12,
            }}>
              <div>
                <div style={{ color:'#fff', fontSize:22, fontWeight:900 }}>
                  {weatherIcons[weather.icon] || '🌡️'} {weather.city}, {weather.country}
                </div>
                <div style={{ color:'rgba(255,255,255,0.75)', fontSize:12, marginTop:3 }}>
                  {weather.description} · Feels like {weather.feels_like}°C
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ color:'#fff', fontSize:52, fontWeight:900, lineHeight:1 }}>
                  {weather.temperature}°
                </div>
                <div style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>Celsius</div>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:12 }}>
              {[
                { icon:'💧', label:t.weather.humidity, value:`${weather.humidity}%`     },
                { icon:'🌧️', label:t.weather.rainfall, value:`${weather.rainfall}mm`    },
                { icon:'💨', label:t.weather.wind,     value:`${weather.wind_speed}m/s` },
                { icon:'🔵', label:t.weather.pressure, value:`${weather.pressure}hPa`   },
              ].map(s => (
                <div key={s.label} style={{
                  background:'rgba(255,255,255,0.2)',
                  borderRadius:12, padding:'10px 8px',
                  textAlign:'center',
                  border:'1px solid rgba(255,255,255,0.25)',
                }}>
                  <div style={{ fontSize:16 }}>{s.icon}</div>
                  <div style={{ color:'#fff', fontSize:13, fontWeight:800, marginTop:3 }}>
                    {s.value}
                  </div>
                  <div style={{ color:'rgba(255,255,255,0.7)', fontSize:9 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Farming tips */}
          <div className="glass" style={{ padding:18 }}>
            <div style={{
              color:'#0c4a6e', fontSize:12, fontWeight:800,
              marginBottom:10,
            }}>🌾 {t.weather.recommendations}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {farmingTips(weather).map((tip, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'10px 12px', borderRadius:10,
                  background:`${tip.color}18`,
                  border:`1.5px solid ${tip.color}40`,
                }}>
                  <span style={{ fontSize:16 }}>{tip.icon}</span>
                  <span style={{ color:tip.color, fontSize:12, fontWeight:600 }}>
                    {tip.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Crop prefill notice */}
          <div className="glass" style={{
            padding:16,
            background:'rgba(34,197,94,0.1)',
            border:'1.5px solid rgba(34,197,94,0.25)',
            display:'flex', alignItems:'center', gap:12,
          }}>
            <span style={{ fontSize:28 }}>🌱</span>
            <div>
              <div style={{ color:'#14532d', fontSize:12, fontWeight:800, marginBottom:2 }}>
                  {t.weather.autofill_title}
              </div>
              <div style={{ color:'#16a34a', fontSize:11 }}>
                 {t.weather.autofill_desc} "{weather?.city}"
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!weather && !loading && (
        <div className="glass" style={{
          padding:50, textAlign:'center',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
        }}>
          <div style={{ fontSize:56, marginBottom:12 }}>🌤️</div>
          <div style={{ color:'#0369a1', fontSize:14, fontWeight:700, marginBottom:4 }}>
             {t.weather.empty_title}
          </div>
          <div style={{ color:'#7ab0d0', fontSize:12 }}>
           {t.weather.empty_sub}
          </div>
        </div>
      )}
    </div>
  );
}