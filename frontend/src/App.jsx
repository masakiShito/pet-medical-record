import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status ?? 'unknown'))
      .catch(() => setApiStatus('error'));

    fetch(`${API_URL}/db/health`)
      .then((res) => res.json())
      .then((data) => setDbStatus(data.status ?? 'unknown'))
      .catch(() => setDbStatus('error'));
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
