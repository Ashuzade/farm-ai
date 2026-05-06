import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Request interceptor — logs every request
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handles errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// --- Health ---
export const checkHealth = () => api.get('/health');

// --- Crop API ---
export const predictCrop = (data) =>
  api.post('/crop/predict', data);

export const predictCropExplained = (data) =>
  api.post('/crop/predict/explain', data);

// --- Disease API ---
export const predictDisease = (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  return api.post('/disease/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getDiseaseClasses = () =>
  api.get('/disease/classes');

// --- Weather API ---
export const getWeatherByCity = (city) =>
  api.get(`/weather/city?city=${encodeURIComponent(city)}`);

export const getWeatherByCoords = (lat, lon) =>
  api.get(`/weather/coords?lat=${lat}&lon=${lon}`);

export const getWeatherCropPrefill = (city) =>
  api.get(`/weather/crop-prefill?city=${encodeURIComponent(city)}`);

// --- Irrigation API ---
export const predictIrrigation = (data) =>
  api.post('/irrigation/predict', data);

export const getIrrigationOptions = () =>
  api.get('/irrigation/options');

export const getCropWaterBase = () =>
  api.get('/irrigation/crop-water-base');

export default api;