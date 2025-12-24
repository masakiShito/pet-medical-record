import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async (endpoint, setter) => {
      try {
        const res = await fetch(`${API_URL}${endpoint}`);
        const data = await res.json();
        if (!cancelled) {
          setter(data.status ?? 'unknown');
        }
      } catch {
        if (!cancelled) {
          setter('error');
        }
      }
    };

    const tick = () => {
      fetchStatus('/health', setApiStatus);
      fetchStatus('/db/health', setDbStatus);
    };

    tick();
    const interval = setInterval(tick, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Pet Medical Record</h1>
      <p>React + FastAPI + MySQL 開発環境</p>
      <ul>
        <li>API Health: {apiStatus}</li>
        <li>DB Health: {dbStatus}</li>
      </ul>
    </main>
  );
}
