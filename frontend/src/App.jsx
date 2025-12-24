import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    let dbTimeoutId;

    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        if (isMounted) {
          setApiStatus(data.status ?? 'unknown');
        }
      } catch {
        if (isMounted) {
          setApiStatus('error');
        }
      }
    };

    const checkDbHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/db/health`);
        const data = await response.json();
        const status = data.status ?? 'unknown';
        if (isMounted) {
          setDbStatus(status);
        }
        return status;
      } catch {
        if (isMounted) {
          setDbStatus('error');
        }
        return 'error';
      }
    };

    const pollDbHealth = async () => {
      const status = await checkDbHealth();
      if (status !== 'ok' && isMounted) {
        dbTimeoutId = setTimeout(pollDbHealth, 2000);
      }
    };

    checkApiHealth();
    pollDbHealth();

    return () => {
      isMounted = false;
      if (dbTimeoutId) {
        clearTimeout(dbTimeoutId);
      }
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
