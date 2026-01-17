// src/Router.jsx

// REACT
import React from 'react';

// I18N çeviri desteği (withTranslation HOC, i18n için)
import { withTranslation } from 'react-i18next';

// ROUTER: React Router v6+
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';

// PUBLIC alanlarda gösterilecek Header, Footer, Main
import ProjectHeader from '../pages/ProjectHeader';
import ProjectFooter from '../pages/ProjectFooter';
import ProjectMain from '../pages/ProjectMain';

// AUTH ve hata sayfası (yetkisiz erişim)
import Forbidden403 from '../pages/Forbidden403';

// Route guard bileşenleri
import ProtectedRoute from './ProtectedRoute';
import WriterRoute from './WriterRoute';
import AdminRoute from './AdminRoute';

// Admin ve Writer sayfaları/layout'ları
import AdminLayout from '../areas/admin/AdminLayout';
import AdminHome from '../areas/admin/AdminHome';
import BlogApi from '../areas/writer/BlogApi'; // Writer için sayfa
import BlogCategory from '../areas/admin/BlogCategory';

// About
import About from '../areas/admin/About';
import Blog from "../areas/admin/Blog"; // Admin için sayfa

/**
 * PublicLayout
 * -------------------------------------------------
 * Tüm "public" sayfaların layout'u (üstte header, altta footer)
 * Buradaki <Outlet /> → alt route'lara yol açar (ör: Anasayfa, Hakkında vs.)
 */
function PublicLayout() {
  return (
    <>
      <ProjectHeader logo="fa-solid fa-blog" />
      <div className="container">
        <Outlet />
      </div>
      <ProjectFooter copy="&copy; Bütün Haklar Saklıdır." />
    </>
  );
}

/**
 * Router
 * -------------------------------------------------
 * Ana router bileşeni. Tüm rotalar burada tanımlanır.
 * - Public ve admin route'larını ayrı layout'larla ayırırız.
 * - Rol ve login guard'ları için ProtectedRoute/WriterRoute/AdminRoute kullanılır.
 */
function Router() {
  return (
    <Routes>
      {/* ========== PUBLIC Layout ========== */}
      <Route element={<PublicLayout />}>
        {/* Anasayfa */}
        <Route path="/" element={<ProjectMain />} />
        <Route path="/index" element={<ProjectMain />} />
        <Route path="/403" element={<Forbidden403 />} />

        {/* (İsteğe bağlı) login gerektiren, ama header/footer olan alanlar */}
        <Route element={<ProtectedRoute />}>
          {/* örn: <Route path="/dashboard" element={<Dashboard />} /> */}
        </Route>

        {/* WRITER route (header/footer ile) */}
        <Route element={<WriterRoute />}>
          <Route path="/writer/blog-api" element={<BlogApi />} />
        </Route>

        {/* Bilinmeyen adres → anasayfa */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      {/* ========== ADMIN Layout ========== */}
      {/* Admin alanında kendine ait layout kullanılır. Header/footer YOK */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          {/* Ana admin home */}
          <Route index element={<AdminHome />} />

          {/* Blog kategorileri (sadece admin) */}
          <Route path="blog-category" element={<BlogCategory />} />
          <Route path="blog" element={<Blog />} />

          {/* ...Başka admin-only route'lar buraya eklenebilir */}

          {/*About*/}
          <Route path="about" element={<About />} />
        </Route>
      </Route>
    </Routes>
  );
}

// I18N ile sarmalanmış export (tüm sayfa içeriğinde çeviri desteği olur)
export default withTranslation()(Router);
