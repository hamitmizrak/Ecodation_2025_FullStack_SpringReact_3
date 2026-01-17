// src/routes/WriterRoute.jsx

import React from 'react';
import ProtectedRoute from './ProtectedRoute';

/**
 * WriterRoute
 * ----------------------------------------------------------------
 * Sadece "writer" (ve istersen "admin") rolüne sahip kullanıcıların erişebileceği route guard.
 * - ProtectedRoute'u kullanır; roller parametresiyle yetki sınırını belirtir.
 * - Sadece "WRITER" rolünü açmak istersen:
 *      roles={['WRITER']}
 * - Hem WRITER hem ADMIN erişsin istersen (çoğu zaman mantıklı):
 *      roles={['WRITER','ADMIN']}
 *
 * Kullanım örneği:
 *   <Route
 *     path="/writer"
 *     element={<WriterRoute />}>
 *     <Route index element={<WriterHome />} />
 *     <Route path="blog-editor" element={<BlogEditorPage />} />
 *   </Route>
 */
export default function DefaultUserRoute() {
  // Eğer sadece WRITER erişsin istiyorsan:
  // return <ProtectedRoute roles={['WRITER']} />;

  // Eğer hem WRITER hem ADMIN erişebilsin istiyorsan (yönetici de yazı ekleyebilsin):
  return <ProtectedRoute roles={['USER', 'ADMIN']} />;
}
