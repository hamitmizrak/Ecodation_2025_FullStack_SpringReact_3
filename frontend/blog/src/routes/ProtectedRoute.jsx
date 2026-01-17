// src/routes/ProtectedRoute.jsx

import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initFromStorage, selectAuth } from '../features/auth/authSlice';

/**
 * ProtectedRoute
 * -------------------------------------------------------------------
 * Route guard (korumalı yönlendirme) bileşeni.
 * - Yetkili olmayan kullanıcıları engeller; gerekirse login'e veya 403'e yönlendirir.
 * - İster sadece giriş gereksin, ister rol bazlı erişim kontrolü yap.
 *
 * Props:
 *   roles: ['ADMIN', ...] gibi bir DİZİ (isteğe bağlı). Rol kontrolü yapılacaksa gönder.
 *
 * Akış:
 *   1) Açılışta initFromStorage çağrılır (localStorage'dan token+user kurulur).
 *   2) Auth state'ten login/rol bilgileri okunur.
 *   3) Kullanıcı login değilse anasayfaya yönlendirir.
 *   4) roles[] verildiyse: Kullanıcının rolleri kontrol edilir, yetkili değilse /403 (forbidden) döner.
 *   5) Geçtiyse alt route’ları (Outlet) açar.
 */
export default function ProtectedRoute({ roles }) {
  const dispatch = useDispatch();
  const location = useLocation();

  // Redux'tan auth state'i alıyoruz.
  const { isAuthenticated, roles: myRoles, loading, token } = useSelector(selectAuth);

  // Açılışta/refresh'te localStorage'dan auth state'i kurar.
  useEffect(() => {
    dispatch(initFromStorage());
  }, [dispatch]);

  // SSR güvenliği: browser'da değilse token null olur.
  const tokenInStorage = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Eğer auth state yükleniyor (ve token varsa) ise: "Yükleniyor" göster (örneğin sayfa yenilendiğinde)
  if (loading && (token || tokenInStorage)) {
    return <div className="container py-5">Yükleniyor...</div>;
  }

  // Eğer kullanıcı login değilse: Anasayfaya (veya /login'e) yönlendir.
  // Projede ayrı bir /login sayfası yoksa, anasayfa "/" mantıklı.
  if (!isAuthenticated && !tokenInStorage) {
    // react-router Navigate: mevcut adresi state.from olarak gönderiyoruz.
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Rol kontrolü (gelen ve mevcut rolleri normalize et, büyük harf, ROLE_ prefixsiz karşılaştır)
  if (roles && roles.length) {
    // Roller (dizileri) normalize et: büyük harf ve başındaki ROLE_ atılır
    const norm = (arr) =>
      (arr || []).map((r) => String(r).toUpperCase().trim()).map((r) => r.replace(/^ROLE_/, ''));
    const have = norm(myRoles); // Kullanıcının rolleri
    const need = norm(roles); // İstenen roller
    const ok = have.some((r) => need.includes(r)); // En az biri uyuyorsa true

    // Eğer kullanıcının rolü yoksa 403 sayfasına yönlendir.
    if (!ok) return <Navigate to="/403" replace />;
  }

  // Tüm kontroller geçtiyse:
  // children route'larını render et
  return <Outlet />;
}
