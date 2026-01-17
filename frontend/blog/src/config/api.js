// src/config/api.js

/**
 * API URL ve Endpoint Tanımları
 * ---------------------------------------------------
 * - API_BASE ve IMAGE_BASE: backend (veya prod/staging) URL'leri için otomatik algı.
 *   Önce Vite env (VITE_API_BASE), sonra CRA env (REACT_APP_API_BASE), en son local fallback kullanılır.
 * - ENDPOINTS: Tüm API yolları merkezi olarak buradan yönetilir; backend endpoint'iniz değişirse tek yerden güncellenir.
 */

// Backend ana adresi (örn: http://localhost:4444)
// .env dosyanızda VITE_API_BASE veya REACT_APP_API_BASE varsa onu kullanır.
export const API_BASE =
  import.meta?.env?.VITE_API_BASE || // Vite ortamı için (örn. VITE_API_BASE)
  process.env.REACT_APP_API_BASE || // CRA ortamı için (örn. REACT_APP_API_BASE)
  'http://localhost:4444'; // Lokal fallback

// Resimlerin geldiği kök URL
export const IMAGE_BASE =
  import.meta?.env?.VITE_IMAGE_BASE || // Vite ortamı için (örn. VITE_IMAGE_BASE)
  process.env.REACT_APP_IMAGE_BASE || // CRA ortamı için (örn. REACT_APP_IMAGE_BASE)
  API_BASE; // YOKSA API_BASE kullanılır

/**
 * ENDPOINTS: Tüm API yollarının merkezi sözlüğü.
 * ----------------------------------------------
 * - Backend'deki her fonksiyona tek yerden ulaşım için burada anahtar tanımla.
 * - Değişirse/dallandırılırsa tek noktadan güncellenir.
 */
export const ENDPOINTS = {
  // Kullanıcı girişi
  LOGIN: '/auth/api/v1.0.0/login',

  // Kayıt (rolesId: 1=Admin, 2=Writer, 3=User gibi)
  REGISTER_CREATE: (rolesId = 1) => `/register/api/v1.0.0/create/${rolesId}`,

  // Profil bilgisi (/me endpoint’i)
  ME: '/auth/api/v1.0.0/me',

  // (Opsiyonel) Roller listesi — backend’inizde varsa, burayı kendi controller yolunuzla değiştirin
  ROLES: {
    LIST: '/roles/api/v1.0.0', // Sadece örnek, kendi path’iniz farklı olabilir
  },


  // Blog Kategori endpoint’leri (CRUD)
  BLOG_CATEGORY: {
    LIST: '/blog/category/api/v1.0.0/list', // Kategori listesi (GET)
    CREATE: '/blog/category/api/v1.0.0/create', // Kategori ekle (POST)
    FIND: (id) => `/blog/category/api/v1.0.0/find/${id}`, // Kategori Bul (GET)
    UPDATE: (id) => `/blog/category/api/v1.0.0/update/${id}`, // Kategori güncelle (PUT)
    DELETE: (id) => `/blog/category/api/v1.0.0/delete/${id}`, // Kategori sil (DELETE)
  },

  // Blog — Backend sözleşmesi (JSON *veya* multipart) ile uyumlu:
  //  POST /blog/api/v1.0.0/create
  //  PUT  /blog/api/v1.0.0/update/{id}
  BLOG: {
    LIST:   '/blog/api/v1.0.0/list',
    CREATE: '/blog/api/v1.0.0/create',               // <<< düz string (path’te categoryId yok)
    FIND:   (id) => `/blog/api/v1.0.0/find/${id}`,
    UPDATE: (id) => `/blog/api/v1.0.0/update/${id}`,  // <<< düz id (path’te categoryId yok)
    DELETE: (id) => `/blog/api/v1.0.0/delete/${id}`,
  },

  ABOUT: {
    LIST: '/about/api/v1.0.0/list',
    CREATE: '/about/api/v1.0.0/create',
    UPDATE: (id) => `/about/api/v1.0.0/update/${id}`,
    DELETE: (id) => `/about/api/v1.0.0/delete/${id}`,
  },
};

// KULLANIM ÖRNEKLERİ:
// axios.post(`${API_BASE}${ENDPOINTS.LOGIN}`, { email, password });
// axios.get(`${API_BASE}${ENDPOINTS.BLOG_CATEGORY.LIST}`);
// axios.put(`${API_BASE}${ENDPOINTS.BLOG_CATEGORY.UPDATE(5)}`, data);
