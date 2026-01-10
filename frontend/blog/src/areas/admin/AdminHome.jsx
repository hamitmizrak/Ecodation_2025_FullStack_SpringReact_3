// src/admin/AdminHome.jsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../features/auth/authSlice';

/** Kullanıcı adını üret */
function useDisplayName() {
  const { user } = useSelector(selectAuth);
  return useMemo(() => {
    if (!user) {
      const raw = localStorage.getItem('user');
      if (!raw) return 'Yönetici';
      try {
        const parsed = JSON.parse(raw);
        return parsed.fullName || parsed.fullname || parsed.name || parsed.email || 'Yönetici';
      } catch {
        return 'Yönetici';
      }
    }
    return user.fullName || user.fullname || user.name || user.email || 'Yönetici';
  }, [user]);
}

export default function AdminHome() {
  const name = useDisplayName();

  // --- Placeholder veriler (API bağlayınca burayı doldur) ---
  const stats = [
    { key: 'categories', label: 'Toplam Kategori', value: 12, icon: 'fa-tags' },
    { key: 'posts', label: 'Toplam Yazı', value: 34, icon: 'fa-file-lines' },
    { key: 'drafts', label: 'Taslaklar', value: 7, icon: 'fa-file-circle-question' },
    { key: 'published', label: 'Yayımlanan', value: 27, icon: 'fa-circle-check' },
  ];

  const recentActivities = [
    {
      id: 1,
      icon: 'fa-pen',
      color: 'text-primary',
      text: '“Java” kategorisi güncellendi',
      time: '2 dk önce',
    },
    {
      id: 2,
      icon: 'fa-plus',
      color: 'text-success',
      text: '“Backend” kategorisi eklendi',
      time: '1 saat önce',
    },
    {
      id: 3,
      icon: 'fa-user-shield',
      color: 'text-info',
      text: '1 kullanıcıya ADMIN rolü atandı',
      time: 'Dün',
    },
    {
      id: 4,
      icon: 'fa-triangle-exclamation',
      color: 'text-warning',
      text: '2 yazı taslakta bekliyor',
      time: '2 gün önce',
    },
  ];

  const recentCategories = [
    { id: 101, name: 'Frontend', slug: 'frontend', visible: true, updatedAt: '2025-08-20' },
    { id: 102, name: 'Java', slug: 'java', visible: true, updatedAt: '2025-08-18' },
    { id: 103, name: 'DevOps', slug: 'devops', visible: false, updatedAt: '2025-08-17' },
    { id: 104, name: 'Database', slug: 'database', visible: true, updatedAt: '2025-08-14' },
  ];

  const health = {
    cpu: 42, // %
    memory: 63,
    disk: 78,
  };

  return (
    <div className="admin-home">
      {/* Hero / Karşılama */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
          <div>
            <h4 className="mb-1">
              <i className="fa fa-gauge-high me-2" />
              Hoş geldiniz, {name}!
            </h4>
            <div className="text-muted">
              Yönetim paneli üzerinden kategorileri, yazıları ve kullanıcıları yönetin.
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin/blog-category" className="btn btn-primary">
              <i className="fa fa-plus me-2" />
              Yeni Kategori
            </Link>
            <button className="btn btn-outline-secondary" disabled title="Yakında">
              <i className="fa fa-file-circle-plus me-2" />
              Yeni Yazı
            </button>
          </div>
        </div>
      </div>

      {/* KPI Kartları */}
      <div className="row g-3 mb-3">
        {stats.map((s) => (
          <div className="col-12 col-sm-6 col-lg-3" key={s.key}>
            <div className="card border-0 shadow-sm h-100 position-relative">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="text-muted small">{s.label}</div>
                  <i className={`fa ${s.icon} text-secondary`} />
                </div>
                <div className="fs-3 fw-bold mt-1">{s.value}</div>
                <div className="mt-2">
                  {s.key === 'published' ? (
                    <span className="badge rounded-pill text-bg-success">
                      <i className="fa fa-arrow-up me-1" />
                      +3 bugün
                    </span>
                  ) : s.key === 'drafts' ? (
                    <span className="badge rounded-pill text-bg-warning">
                      <i className="fa fa-hourglass-half me-1" />
                      aksiyon gerekebilir
                    </span>
                  ) : (
                    <span className="badge rounded-pill text-bg-secondary">genel</span>
                  )}
                </div>
                {/* “detay” için link */}
                {s.key === 'categories' && (
                  <Link
                    to="/admin/blog-category"
                    className="stretched-link"
                    aria-label="Kategorilere git"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orta satır: Hızlı İşlemler + Aktiviteler */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header fw-semibold">
              <i className="fa fa-wand-magic-sparkles me-2" />
              Hızlı İşlemler
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-12 col-sm-6 col-xl-4">
                  <Link to="/admin/blog-category" className="btn btn-outline-primary w-100">
                    <i className="fa fa-plus me-2" />
                    Kategori Ekle
                  </Link>
                </div>
                <div className="col-12 col-sm-6 col-xl-4">
                  <button className="btn btn-outline-secondary w-100" disabled title="Yakında">
                    <i className="fa fa-pen-to-square me-2" />
                    Yazı Oluştur
                  </button>
                </div>
                <div className="col-12 col-sm-6 col-xl-4">
                  <button className="btn btn-outline-secondary w-100" disabled title="Yakında">
                    <i className="fa fa-user-plus me-2" />
                    Kullanıcı Ekle
                  </button>
                </div>
                <div className="col-12 col-sm-6 col-xl-4">
                  <button className="btn btn-outline-secondary w-100" disabled title="Yakında">
                    <i className="fa fa-database me-2" />
                    Yedek Al
                  </button>
                </div>
                <div className="col-12 col-sm-6 col-xl-4">
                  <button className="btn btn-outline-secondary w-100" disabled title="Yakında">
                    <i className="fa fa-sliders me-2" />
                    Ayarlar
                  </button>
                </div>
                <div className="col-12 col-sm-6 col-xl-4">
                  <button className="btn btn-outline-secondary w-100" disabled title="Yakında">
                    <i className="fa fa-chart-line me-2" />
                    Raporlar
                  </button>
                </div>
              </div>

              <hr className="my-3" />

              <div className="alert alert-info mb-0 d-flex align-items-center" role="alert">
                <i className="fa fa-lightbulb me-2" />
                İpucu: Kategori oluştururken slug alanını boş bırakırsanız otomatik üretilebilir.
              </div>
            </div>
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header fw-semibold">
              <i className="fa fa-clock-rotate-left me-2" />
              Son Aktiviteler
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0 small">
                {recentActivities.map((a) => (
                  <li className="mb-2 d-flex" key={a.id}>
                    <i className={`fa ${a.icon} ${a.color} me-2 mt-1`} />
                    <div>
                      <div>{a.text}</div>
                      <div className="text-muted">{a.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-footer text-end">
              <button className="btn btn-sm btn-outline-secondary" disabled title="Yakında">
                Tümünü Gör
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alt satır: Kategoriler Tablosu + Sistem Sağlığı */}
      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header fw-semibold">
              <i className="fa fa-table-list me-2" />
              Son Kategoriler
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Ad</th>
                    <th>Slug</th>
                    <th>Durum</th>
                    <th>Güncelleme</th>
                    <th className="text-end">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCategories.map((c, idx) => (
                    <tr key={c.id}>
                      <td>{idx + 1}</td>
                      <td>{c.name}</td>
                      <td>
                        <code>{c.slug}</code>
                      </td>
                      <td>
                        {c.visible ? (
                          <span className="badge rounded-pill text-bg-success">Aktif</span>
                        ) : (
                          <span className="badge rounded-pill text-bg-secondary">Pasif</span>
                        )}
                      </td>
                      <td className="text-muted">{c.updatedAt}</td>
                      <td className="text-end">
                        <Link to="/admin/blog-category" className="btn btn-sm btn-outline-primary">
                          <i className="fa fa-pen me-1" />
                          Düzenle
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {recentCategories.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        Kategori bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="card-footer text-end">
              <Link to="/admin/blog-category" className="btn btn-sm btn-outline-secondary">
                Tüm Kategoriler
              </Link>
            </div>
          </div>
        </div>

        {/* Sistem Sağlığı */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header fw-semibold">
              <i className="fa fa-heart-pulse me-2" />
              Sistem Sağlığı
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between small">
                  <span>CPU Kullanımı</span>
                  <span>%{health.cpu}</span>
                </div>
                <div
                  className="progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={health.cpu}
                >
                  <div className="progress-bar" style={{ width: `${health.cpu}%` }} />
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between small">
                  <span>Bellek Kullanımı</span>
                  <span>%{health.memory}</span>
                </div>
                <div
                  className="progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={health.memory}
                >
                  <div className="progress-bar" style={{ width: `${health.memory}%` }} />
                </div>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between small">
                  <span>Disk Kullanımı</span>
                  <span>%{health.disk}</span>
                </div>
                <div
                  className="progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={health.disk}
                >
                  <div className="progress-bar" style={{ width: `${health.disk}%` }} />
                </div>
              </div>

              <div className="alert alert-warning mt-3 mb-0 small" role="alert">
                <i className="fa fa-triangle-exclamation me-1" />
                Performans verileri örnek amaçlıdır. Gerçek değerler için monitoring servisine
                bağlanın.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alt bilgi */}
      <div className="text-center text-muted small py-3">
        Admin Anasayfa • {new Date().getFullYear()}
      </div>
    </div>
  );
}
