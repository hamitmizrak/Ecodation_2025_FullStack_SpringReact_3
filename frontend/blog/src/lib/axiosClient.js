// src/api/axiosClient.js

import axios from 'axios';
import { API_BASE } from '../config/api';

/**
 * axiosClient
 * ---------------------------------------------------------
 * Projenin tüm backend istekleri için ortak axios instance'ı.
 * - baseURL: API_BASE (.env veya config/api.js'den gelir)
 * - Authorization header'ı kolayca ekleyip çıkarabilmek için setAccessToken / clearAccessToken fonksiyonları vardır.
 * - Interceptor ile: Eğer header'da Authorization yoksa localStorage'dan token'ı ekler (uyum ve fallback için).
 */

// Axios instance: tüm istekler bu nesne üzerinden yapılacak
export const axiosClient = axios.create({
  baseURL: API_BASE,
  // İstersen default header'lar da ekleyebilirsin
  // headers: { 'Content-Type': 'application/json' }
});

/**
 * setAccessToken
 * ---------------------------------------------------------
 * Tüm sonraki isteklerde Authorization header'ı otomatik eklenir.
 * @param {string|null} token - JWT token (yoksa header kaldırılır)
 */
export function setAccessToken(token) {
  if (!token) return clearAccessToken();
  axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
}

/**
 * clearAccessToken
 * ---------------------------------------------------------
 * Tüm sonraki isteklerde Authorization header'ı kaldırılır.
 */
export function clearAccessToken() {
  delete axiosClient.defaults.headers.common.Authorization;
}

/**
 * Request interceptor
 * ---------------------------------------------------------
 * Eğer istekte header.Authorization YOKSA (ör. sayfa yenilendi, store sıfırlandı),
 * localStorage'daki token'ı bulup header'a ekler. Böylece login süresi dolmadığı sürece kullanıcı login kalır.
 */
axiosClient.interceptors.request.use((config) => {
  // Header'da Authorization yoksa ve localStorage'da token varsa ekle
  if (!config.headers.Authorization) {
    const t = localStorage.getItem('token');
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

// KULLANIM ÖRNEKLERİ:
// setAccessToken(token);           // login olduktan sonra çağırılır
// clearAccessToken();              // logout'ta çağırılır
// axiosClient.get('/profile');     // otomatik token ile gider
