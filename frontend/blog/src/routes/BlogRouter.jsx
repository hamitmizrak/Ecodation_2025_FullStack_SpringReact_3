// rfce
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';

function BlogRouter() {
  return (
    <Routes>
      {/* ======== PUBLIC LAYOUT  ========  */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<ProjectMain />} />
        <Route path="/index" element={<ProjectMain />} />
        <Route path="/403" element={<Forbidden403 />} />
      </Route>

      {/* ======== ADMIN LAYOUT  ========  */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />

          {/* Blog kategori  sadece ama sadece admin olanlar görebilir */}
          <Route path="blog-category" element={<BlogCategory />} />

          {/* Blog kategori  sadece ama sadece admin olanlar görebilir */}
          <Route path="blog" element={<Blog />} />
        </Route>
      </Route>
    </Routes>
  );
}

// I18N ile sarmalanmış export(Tüm sayfa içeriğinde çeviri desteği)
export default withTranslation()(BlogRouter);
