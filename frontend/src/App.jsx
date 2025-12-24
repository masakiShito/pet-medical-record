import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [dbStatus, setDbStatus] = useState('checking');
  // capture detail returned from /db/health
  const [dbDetail, setDbDetail] = useState(null);

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
        const detail = data.detail ?? null;
        if (isMounted) {
          setDbStatus(status);
          // show detail only when not ok
          setDbDetail(status === 'ok' ? null : detail);
        }
        return status;
      } catch {
        if (isMounted) {
          setDbStatus('error');
          setDbDetail('network error');
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
        <li>
          DB Health: {dbStatus}
          {dbDetail ? ` - ${dbDetail}` : null}
        </li>
      </ul>
    </main>
  );
}
