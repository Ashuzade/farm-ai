import { useState } from 'react';
import { getWeatherCropPrefill } from '../services/api';
import toast from 'react-hot-toast';

const weatherIcons = {
  '01d':'☀️','01n':'🌙','02d':'⛅','02n':'⛅',
  '03d':'☁️','03n':'☁️','04d':'☁️','04n':'☁️',
  '09d':'🌧️','09n':'🌧️','10d':'🌦️','10n':'🌦️',
  '11d':'⛈️','11n':'⛈️','13d':'❄️','13n':'❄️',
};

export default function WeatherWidget({ onPrefill }) {
  const [city,    setCity]    = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!city.trim()) { toast.error('Enter a city name'); return; }
    setLoading(true);
    try {
      const data = await getWeatherCropPrefill(city.trim());
      setWeather(data.weather);
      onPrefill(data.crop_prefill);
      toast.success(`Weather loaded for ${data.weather.city}!`);
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
          const { getWeatherByCoords } = await import('../services/api');
          const data = await getWeatherByCoords(
            pos.coords.latitude, pos.coords.longitude
          );
          setWeather(data);
          onPrefill({
            temperature: data.temperature,
            humidity:    data.humidity,
            rainfall:    data.rainfall,
          });
          toast.success(`Weather loaded for ${data.city}!`);
        } catch { toast.error('Could not fetch weather'); }
        finally { setLoading(false); }
      },
      () => { toast.error('Location access denied'); setLoading(false); }
    );
  };

  return (
    <div style={{
      background:'rgba(56,189,248,0.08)',
      border:'1.5px solid rgba(56,189,248,0.25)',
      borderRadius:14, padding:14, marginBottom:16,
    }}>
      <div style={{
        display:'flex', alignItems:'center', gap:6,
        marginBottom:10,
      }}>
        <span style={{ fontSize:16 }}>🌤️</span>
        <span style={{
          color:'#0c4a6e', fontSize:11, fontWeight:800,
          textTransform:'uppercase', letterSpacing:0.7,
        }}>Auto-fill from Live Weather</span>
      </div>

      {/* Search row */}
      <div style={{ display:'flex', gap:6, marginBottom:10 }}>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFetch()}
          placeholder="Enter city..."
          className="farm-input farm-input-weather"
          style={{ flex:1, fontSize:12 }}
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          style={{
            padding:'8px 12px', borderRadius:9, border:'none',
            background:'linear-gradient(135deg,#38bdf8,#0284c7)',
            color:'#fff', fontSize:12, fontWeight:700,
            cursor:'pointer', flexShrink:0,
            boxShadow:'0 2px 8px rgba(56,189,248,0.3)',
          }}
        >{loading ? '⏳' : '🔍'}</button>
        <button
          onClick={handleGPS}
          disabled={loading}
          style={{
            padding:'8px 10px', borderRadius:9, border:'none',
            background:'rgba(99,102,241,0.15)',
            color:'#4f46e5', fontSize:14, cursor:'pointer',
          }}
        >📍</button>
      </div>

      {/* Weather result */}
      {weather ? (
        <div style={{
          background:'rgba(255,255,255,0.65)',
          border:'1.5px solid rgba(56,189,248,0.2)',
          borderRadius:12, padding:12,
        }}>
          <div style={{
            display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:8,
          }}>
            <div>
              <div style={{ color:'#0c4a6e', fontSize:13, fontWeight:800 }}>
                {weatherIcons[weather.icon] || '🌡️'} {weather.city}, {weather.country}
              </div>
              <div style={{ color:'#0369a1', fontSize:10 }}>
                {weather.description}
              </div>
            </div>
            <div style={{
              color:'#0284c7', fontSize:26, fontWeight:900,
            }}>
              {weather.temperature}°C
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
            {[
              { icon:'💧', label:'Humidity',  value:`${weather.humidity}%`     },
              { icon:'🌧️', label:'Rainfall',  value:`${weather.rainfall}mm`    },
              { icon:'💨', label:'Wind',      value:`${weather.wind_speed}m/s` },
            ].map(s => (
              <div key={s.label} style={{
                background:'rgba(56,189,248,0.1)',
                borderRadius:8, padding:'6px',
                textAlign:'center',
                border:'1px solid rgba(56,189,248,0.15)',
              }}>
                <div style={{ fontSize:13 }}>{s.icon}</div>
                <div style={{ color:'#0369a1', fontSize:11, fontWeight:800 }}>
                  {s.value}
                </div>
                <div style={{ color:'#7ab0d0', fontSize:9 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Prefill notice */}
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            marginTop:8, padding:'6px 10px',
            background:'rgba(34,197,94,0.1)',
            border:'1px solid rgba(34,197,94,0.2)',
            borderRadius:8,
          }}>
            <span style={{ fontSize:12 }}>✅</span>
            <span style={{ color:'#16a34a', fontSize:10, fontWeight:600 }}>
              Temperature, humidity & rainfall auto-filled
            </span>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign:'center', padding:'10px 0',
          color:'#7ab0d0', fontSize:11,
        }}>
          Enter a city or use 📍 GPS to auto-fill weather data
        </div>
      )}
    </div>
  );
}