import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { predictDisease } from '../services/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const formatDisease = (name) => {
  if (!name) return '';
  return name.replace(/___/g, ' — ').replace(/_/g, ' ').trim();
};

const getSeverity = (conf) => {
  if (conf >= 0.85) return { label:'🔴 High Severity',   color:'#dc2626', bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.3)'   };
  if (conf >= 0.60) return { label:'🟡 Medium Severity', color:'#d97706', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.3)'  };
  return               { label:'🟢 Low Severity',    color:'#16a34a', bg:'rgba(34,197,94,0.12)',   border:'rgba(34,197,94,0.3)'   };
};

export default function DiseasePage({ t }) {
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg','.jpeg','.png','.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handlePredict = async () => {
    if (!image) { toast.error('Please upload a leaf image first'); return; }
    setLoading(true);
    setResult(null);
    try {
      const data = await predictDisease(image);
      setResult(data);
      toast.success('Disease detected!');
    } catch {
      toast.error(t.errors.prediction_failed);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
  };

  const chartData = result?.top3?.map(item => ({
    name: item.disease.split('___')[1]?.replace(/_/g,' ') || item.disease,
    confidence: parseFloat((item.confidence * 100).toFixed(1)),
  })) || [];

  const severity = result ? getSeverity(result.confidence) : null;

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'32px 20px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <div style={{
            width:40, height:40, borderRadius:12,
            background:'linear-gradient(135deg,#f97316,#c2410c)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:20, boxShadow:'0 3px 10px rgba(249,115,22,0.35)',
          }}>🍃</div>
          <h1 style={{ color:'#7c2d12', fontSize:26, fontWeight:900, margin:0 }}>
            {t.disease.title}
          </h1>
        </div>
        <p style={{ color:'#b45309', fontSize:13, margin:0 }}>
          {t.disease.subtitle}
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* ── Left: Upload Panel ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Dropzone */}
          <div className="glass" style={{ padding:20 }}>
            <div
              {...getRootProps()}
              className={isDragActive ? 'upload-zone upload-zone-active' : 'upload-zone'}
            >
              <input {...getInputProps()} />
              {preview ? (
                <img
                  src={preview}
                  alt="Leaf preview"
                  style={{
                    maxHeight:160, maxWidth:'100%',
                    borderRadius:10, objectFit:'contain',
                  }}
                />
              ) : (
                <>
                  <div style={{ fontSize:36, marginBottom:8 }}>📷</div>
                  <div style={{
                    color:'#7c2d12', fontSize:13,
                    fontWeight:700, marginBottom:4,
                  }}>
                    {t.disease.upload}
                  </div>
                  <div style={{ color:'#b45309', fontSize:10 }}>
                    {t.disease.formats}
                  </div>
                </>
              )}
            </div>

            {/* File info */}
            {image && (
              <div style={{
                display:'flex', alignItems:'center',
                justifyContent:'space-between',
                marginTop:10, padding:'8px 12px',
                background:'rgba(249,115,22,0.08)',
                border:'1px solid rgba(249,115,22,0.2)',
                borderRadius:10,
              }}>
                <div>
                  <div style={{ color:'#7c2d12', fontSize:12, fontWeight:700 }}>
                    {image.name}
                  </div>
                  <div style={{ color:'#b45309', fontSize:10 }}>
                    {(image.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  style={{
                    background:'rgba(239,68,68,0.1)',
                    border:'1px solid rgba(239,68,68,0.2)',
                    borderRadius:8, padding:'4px 10px',
                    color:'#dc2626', fontSize:12,
                    cursor:'pointer', fontWeight:700,
                  }}
                >✕</button>
              </div>
            )}

            <button
              className="farm-btn farm-btn-disease"
              onClick={handlePredict}
              disabled={!image || loading}
              style={{ marginTop:12 }}
            >
              {loading
                ? <><span>⏳</span> {t.disease.loading}</>
                : `🔍 ${t.disease.predict}`
              }
            </button>
          </div>

          {/* Tips */}
          <div className="glass" style={{ padding:16 }}>
            <div style={{
              color:'#7c2d12', fontSize:11, fontWeight:800,
              textTransform:'uppercase', letterSpacing:0.7, marginBottom:8,
            }}>📸 Tips for Best Results</div>
            {[
              'Use clear, well-lit leaf photos',
              'Focus on the affected area',
              'Avoid blurry or dark images',
              'Single leaf per image works best',
            ].map((tip, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'flex-start', gap:7,
                color:'#92400e', fontSize:11, lineHeight:1.6,
              }}>
                <span style={{ color:'#f97316', fontWeight:700 }}>•</span>
                {tip}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Result Panel ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {result ? (
            <>
              {/* Main result */}
              <div className="glass" style={{
                padding:20,
                background: severity.bg,
                border: `1.5px solid ${severity.border}`,
              }}>
                <div style={{
                  display:'flex', justifyContent:'space-between',
                  alignItems:'flex-start', marginBottom:12,
                }}>
                  <div style={{
                    fontSize:9, fontWeight:800, textTransform:'uppercase',
                    letterSpacing:1, color:severity.color,
                    background:`${severity.bg}`,
                    padding:'3px 10px', borderRadius:10,
                    border:`1px solid ${severity.border}`,
                  }}>
                    {severity.label}
                  </div>
                </div>

                <div style={{
                  color:'#7c2d12', fontSize:11,
                  fontWeight:700, marginBottom:4,
                  textTransform:'uppercase', letterSpacing:0.5,
                }}>
                  {t.disease.result}
                </div>
                <div style={{
                  color:'#7c2d12', fontSize:18,
                  fontWeight:900, marginBottom:8, lineHeight:1.3,
                }}>
                  {formatDisease(result.disease)}
                </div>

                {/* Confidence bar */}
                <div style={{
                  display:'flex', alignItems:'center', gap:10,
                }}>
                  <div style={{
                    flex:1, background:'rgba(255,255,255,0.5)',
                    borderRadius:4, height:8, overflow:'hidden',
                  }}>
                    <div style={{
                      width:`${result.confidence * 100}%`,
                      height:8, borderRadius:4,
                      background:`linear-gradient(90deg,${severity.color}99,${severity.color})`,
                    }}/>
                  </div>
                  <span style={{
                    color:severity.color, fontSize:13,
                    fontWeight:900, flexShrink:0,
                  }}>
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Top 3 chart */}
              <div className="glass" style={{ padding:18 }}>
                <div style={{
                  color:'#7c2d12', fontSize:12, fontWeight:800,
                  marginBottom:12,
                }}>
                  📊 {t.disease.top3}
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={chartData} layout="vertical"
                    margin={{ left:8, right:16, top:0, bottom:0 }}
                  >
                    <XAxis
                      type="number" domain={[0,100]}
                      tickFormatter={v => `${v}%`}
                      tick={{ fontSize:10, fill:'#b45309' }}
                    />
                    <YAxis
                      type="category" dataKey="name"
                      width={110}
                      tick={{ fontSize:9, fill:'#92400e' }}
                    />
                    <Tooltip
                      formatter={v => [`${v}%`,'Confidence']}
                      contentStyle={{
                        background:'rgba(255,255,255,0.9)',
                        border:'1px solid rgba(249,115,22,0.3)',
                        borderRadius:8, fontSize:11,
                      }}
                    />
                    <Bar dataKey="confidence" radius={[0,5,5,0]}>
                      {chartData.map((_,i) => (
                        <Cell key={i}
                          fill={i === 0 ? '#f97316' : 'rgba(249,115,22,0.2)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Healthy check */}
              {result.disease.toLowerCase().includes('healthy') && (
                <div className="glass" style={{
                  padding:16, textAlign:'center',
                  background:'rgba(34,197,94,0.1)',
                  border:'1.5px solid rgba(34,197,94,0.3)',
                }}>
                  <div style={{ fontSize:32, marginBottom:6 }}>✅</div>
                  <div style={{
                    color:'#14532d', fontSize:14, fontWeight:800,
                  }}>Your plant looks healthy!</div>
                  <div style={{ color:'#16a34a', fontSize:11, marginTop:4 }}>
                    No disease detected. Keep up the good care.
                  </div>
                </div>
              )}

              {/* Reset button */}
              <button
                onClick={handleReset}
                style={{
                  width:'100%', padding:'10px',
                  background:'rgba(255,255,255,0.6)',
                  border:'1.5px solid rgba(249,115,22,0.25)',
                  borderRadius:11, color:'#b45309',
                  fontSize:13, fontWeight:700, cursor:'pointer',
                  transition:'all 0.18s',
                }}
              >🔄 Try Another Image</button>
            </>
          ) : (
            <div className="glass" style={{
              padding:40, textAlign:'center',
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              minHeight:300,
            }}>
              <div style={{ fontSize:52, marginBottom:12 }}>🔬</div>
              <div style={{ color:'#b45309', fontSize:13 }}>
                Upload a leaf image and click
              </div>
              <div style={{ color:'#f97316', fontSize:13, fontWeight:700 }}>
                {t.disease.predict}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}