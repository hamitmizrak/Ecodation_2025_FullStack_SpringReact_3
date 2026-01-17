// src/routes/AdminRoute.jsx
import React from 'react';
import ProtectedRoute from './ProtectedRoute';

/**
 * AdminRoute
 * ----------------------------
 * Bu bileşen, admin sayfaları için KISA YOL route guard'dır.
 * - Asıl kontrolü ProtectedRoute yapar.
 * - Burada sadece "hangi rollerin" bu rotaya erişebileceğini belirtiyoruz.
 * - Aşağıda roles={['ADMIN']} diyerek sadece ADMIN rolüne izin veriyoruz.
 *
 * Kullanım (örnek):
 *  <Route
 *    path="/admin"
 *    element={<AdminRoute />}>
 *    <Route index element={<AdminHome />} />
 *    <Route path="blog-category" element={<BlogCategoryPage />} />
 *  </Route>
 *
 * Notlar:
 * - Projenizde rol adı 'ROLE_ADMIN' ya da 'Admin' gibi farklıysa,
 *   aşağıdaki dizi içindeki ismi ona göre değiştirin.
 * - roles prop'u bir DİZİ olduğu için isterseniz birden fazla rol verebilirsiniz:
 *   roles={['ADMIN', 'SUPER_ADMIN']}
 */
export default function AdminRoute() {
  // ProtectedRoute, auth context/Redux üzerinden:
  // 1) Kullanıcı giriş yapmış mı? (değilse login'e yönlendirir)
  // 2) Gerekli role sahip mi? (değilse 403/Forbidden'a yönlendirir)
  // Burada sadece yetkili roller listesi veriliyor.
  return <ProtectedRoute roles={['ADMIN']} />;
}
