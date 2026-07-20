import axios from 'axios';

const api = axios.create({
  // ⚠️ Nt'akkad mn l-URL innou b-yitbaq m'a path l-XAMPP 'andak
  baseURL: 'http://localhost/carwash/backend', 
  withCredentials: true, // 👈 Hadi b-tb'at session cookie la-l-PHP[cite: 8]
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;