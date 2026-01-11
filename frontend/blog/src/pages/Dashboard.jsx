import { useEffect, useState } from 'react';
import { fetchMe } from '../api/authService';
import { useAuth } from '../store/auth';
import { IMAGE_BASE } from '../config/api';

export default function Dashboard() {
  const { logout } = useAuth();
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMe(); // varsa
        setMe(data);
      } catch (e) {
        // 401 vs → interceptor zaten ele alır
      }
    })();
  }, []);

  const imageUrl = me?.imageUrl ? new URL(me.imageUrl, IMAGE_BASE).toString() : null;

  return (
    <div className="container" style={{ maxWidth: 720, margin: '32px auto' }}>
      <h3>Dashboard</h3>
      <p>Hoş geldin{me?.registerName ? `, ${me.registerName}` : ''} 👋</p>
      {imageUrl && <img src={imageUrl} alt="avatar" style={{ maxWidth: 160 }} />}
      <div className="mt-3">
        <button className="btn btn-outline-secondary" onClick={logout}>
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
